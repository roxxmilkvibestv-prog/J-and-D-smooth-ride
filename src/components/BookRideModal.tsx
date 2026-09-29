import React, { useState, useId, useRef, useEffect } from 'react';
import { 
  X, 
  Bike, 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  HelpCircle,
  Zap,
  Maximize2,
  Radio,
  Layers
} from 'lucide-react';
import L from 'leaflet';
import { 
  KIGALI_LOCATIONS, 
  RIDE_OPTIONS, 
  calculateDistanceKm, 
  calculateRideFare,
  MOCK_DRIVERS 
} from '../data/kigaliLocations';
import { getSelectedRider } from '../utils/riderDirectory';
import { BookingState, RideTier } from '../types';

interface BookRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (booking: BookingState) => void;
  onOpenKigaliMap?: () => void;
}

const KIGALI_PREVIEW_COORDS: Record<string, { lat: number; lng: number }> = {
  kcc: { lat: -1.9536, lng: 30.0934 },
  kh: { lat: -1.9525, lng: 30.0915 },
  bk_arena: { lat: -1.9538, lng: 30.1127 },
  airport: { lat: -1.9686, lng: 30.1395 },
  cbd: { lat: -1.9441, lng: 30.0619 },
  nyarutarama: { lat: -1.9365, lng: 30.0968 },
  kacyiru: { lat: -1.9358, lng: 30.0827 },
  kiyovu: { lat: -1.9555, lng: 30.0601 },
  gishushu: { lat: -1.9490, lng: 30.0980 },
  nyamirambo: { lat: -1.9772, lng: 30.0483 },
  kicukiro_centre: { lat: -1.9715, lng: 30.1020 },
  gikondo: { lat: -1.9702, lng: 30.0811 },
  remera_corner: { lat: -1.9575, lng: 30.1180 },
  kagugu: { lat: -1.9180, lng: 30.0750 },
  kabuga: { lat: -1.9750, lng: 30.1980 },
};

export const BookRideModal: React.FC<BookRideModalProps> = ({
  isOpen,
  onClose,
  onBookingConfirmed,
  onOpenKigaliMap,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [pickupId, setPickupId] = useState('kcc');
  const [customPickup, setCustomPickup] = useState('');
  const [dropoffId, setDropoffId] = useState('airport');
  const [customDropoff, setCustomDropoff] = useState('');
  const [selectedTier, setSelectedTier] = useState<RideTier>('standard');
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('+250 78');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoNetwork, setMomoNetwork] = useState<'MTN' | 'Airtel'>('MTN');
  const [helmetPreference, setHelmetPreference] = useState<'standard' | 'large' | 'bring_own'>('standard');
  const [passengerNotes, setPassengerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'details' | 'momo_confirm'>('details');
  const [errorMsg, setErrorMsg] = useState('');
  const [customPinCoords, setCustomPinCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCustomPinCoords({ lat, lng });
        setCustomPickup(`My Live Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15);
        }
      },
      (err) => {
        setIsLocating(false);
        // Kigali Convention Centre fallback if GPS permission is denied
        const lat = -1.9536;
        const lng = 30.0934;
        setCustomPinCoords({ lat, lng });
        setCustomPickup(`My Live Location (Kigali Convention Centre)`);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15);
        }
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const pickupCoord = customPinCoords || KIGALI_PREVIEW_COORDS[pickupId] || { lat: -1.9536, lng: 30.0934 };
  const dropoffCoord = KIGALI_PREVIEW_COORDS[dropoffId] || { lat: -1.9686, lng: 30.1395 };

  // Initialize and update real Leaflet route map in modal
  useEffect(() => {
    if (!isOpen || step !== 'details' || !mapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!mapInstanceRef.current) {
        const midLat = (pickupCoord.lat + dropoffCoord.lat) / 2;
        const midLng = (pickupCoord.lng + dropoffCoord.lng) / 2;

        const map = L.map(mapContainerRef.current!, {
          center: [midLat, midLng],
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
        });

        L.control.zoom({ position: 'topright' }).addTo(map);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setCustomPinCoords({ lat, lng });
          setCustomPickup(`Map Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        });

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.invalidateSize();
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Update pickup marker
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickupCoord.lat, pickupCoord.lng]);
      } else {
        const pIcon = L.divIcon({
          className: 'preview-pickup-pin',
          html: `
            <div style="display:flex; flex-direction:column; align-items:center;">
              <div style="width:24px; height:24px; border-radius:50%; background:#34A853; border:2px solid white; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:11px; box-shadow:0 3px 6px rgba(0,0,0,0.5);">A</div>
              <div style="background:#111c10; color:#9ed3aa; font-size:8px; font-weight:bold; padding:1px 4px; border-radius:3px; margin-top:2px; border:1px solid #34A853; white-space:nowrap;">Pickup</div>
            </div>
          `,
          iconSize: [36, 44],
          iconAnchor: [18, 22],
        });
        pickupMarkerRef.current = L.marker([pickupCoord.lat, pickupCoord.lng], { icon: pIcon }).addTo(map);
      }

      // Update dropoff marker
      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setLatLng([dropoffCoord.lat, dropoffCoord.lng]);
      } else {
        const dIcon = L.divIcon({
          className: 'preview-dropoff-pin',
          html: `
            <div style="display:flex; flex-direction:column; align-items:center;">
              <div style="width:24px; height:24px; border-radius:50%; background:#e11d48; border:2px solid white; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:11px; box-shadow:0 3px 6px rgba(0,0,0,0.5);">B</div>
              <div style="background:#111c10; color:#fda4af; font-size:8px; font-weight:bold; padding:1px 4px; border-radius:3px; margin-top:2px; border:1px solid #e11d48; white-space:nowrap;">Dropoff</div>
            </div>
          `,
          iconSize: [36, 44],
          iconAnchor: [18, 22],
        });
        dropoffMarkerRef.current = L.marker([dropoffCoord.lat, dropoffCoord.lng], { icon: dIcon }).addTo(map);
      }

      // Update polyline
      if (routePolylineRef.current) {
        routePolylineRef.current.setLatLngs([
          [pickupCoord.lat, pickupCoord.lng],
          [dropoffCoord.lat, dropoffCoord.lng]
        ]);
      } else {
        routePolylineRef.current = L.polyline([
          [pickupCoord.lat, pickupCoord.lng],
          [dropoffCoord.lat, dropoffCoord.lng]
        ], {
          color: '#34A853',
          weight: 4,
          opacity: 0.85,
          dashArray: '6, 6',
        }).addTo(map);
      }

      // Fit bounds
      map.fitBounds([
        [pickupCoord.lat, pickupCoord.lng],
        [dropoffCoord.lat, dropoffCoord.lng]
      ], { padding: [30, 30] });

    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, step, pickupCoord, dropoffCoord]);

  // Cleanup map when closing
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
      routePolylineRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const pickupLocation = KIGALI_LOCATIONS.find(l => l.id === pickupId);
  const dropoffLocation = KIGALI_LOCATIONS.find(l => l.id === dropoffId);

  const pickupText = customPickup.trim() || (pickupLocation ? `${pickupLocation.name} (${pickupLocation.sector})` : 'Pickup Point');
  const dropoffText = customDropoff.trim() || (dropoffLocation ? `${dropoffLocation.name} (${dropoffLocation.sector})` : 'Destination Point');

  const distanceKm = calculateDistanceKm(pickupId, dropoffId);
  const estimatedFare = calculateRideFare(distanceKm, selectedTier);

  const handleQuickSwap = () => {
    const tempPickup = pickupId;
    setPickupId(dropoffId);
    setDropoffId(tempPickup);
  };

  const handleInitiateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName.trim()) {
      setErrorMsg('Please enter passenger name.');
      return;
    }
    if (passengerPhone.length < 9) {
      setErrorMsg('Please enter a valid Rwandan phone number (+250 7...).');
      return;
    }
    setErrorMsg('');
    setStep('momo_confirm');
  };

  const handleConfirmMoMoPayment = () => {
    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      const assignedDriver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

      const newBooking: BookingState = {
        id: `SMOOTH-${Date.now().toString().slice(-6)}`,
        type: 'ride',
        pickup: pickupText,
        dropoff: dropoffText,
        passengerName,
        phone: passengerPhone,
        momoNumber: momoNumber || passengerPhone,
        momoNetwork,
        tier: selectedTier,
        helmetPreference,
        distanceKm,
        fareRwf: estimatedFare,
        status: 'accepted',
        createdAt: new Date().toISOString(),
        driver: assignedDriver,
        otpCode,
      };

      setIsSubmitting(false);
      onBookingConfirmed(newBooking);
      onClose();
      setStep('details');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        id="book-ride-modal-card"
        className="relative w-full max-w-2xl bg-[#141e12] border border-[#85AB8B]/25 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#336443] via-[#9ed3aa] to-[#336443]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#2c382a] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#222d20] border border-[#9ed3aa]/20 flex items-center justify-center text-[#9ed3aa]">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Book a Smooth Ride</span>
                <span className="text-[11px] font-semibold bg-[#2b4e34] text-[#b9efc5] px-2 py-0.5 rounded-full border border-[#9ed3aa]/30 uppercase">
                  Live Dispatch
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#c1c9bf]">
                Sanitized helmet + hairnet • Fixed pricing • Pay via MoMo
              </p>
            </div>
          </div>
          <button
            id="close-ride-modal-btn"
            onClick={onClose}
            className="text-[#c1c9bf] hover:text-white p-2 rounded-xl bg-[#1f2a1d] hover:bg-[#2c382a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'details' ? (
          <form onSubmit={handleInitiateBooking} className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-[#93000a]/30 border border-[#ffb4ab]/40 rounded-xl text-[#ffdad6] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Route Selection */}
            <div className="bg-[#182216] p-4 sm:p-5 rounded-2xl border border-[#414942]/30 space-y-4">
              <div className="text-xs uppercase font-bold text-[#85AB8B] tracking-wider flex items-center justify-between">
                <span>Route Details (Kigali Sectors)</span>
                <button
                  type="button"
                  onClick={handleQuickSwap}
                  className="text-[11px] text-[#9ed3aa] hover:underline flex items-center gap-1 normal-case"
                >
                  Swap locations ⇄
                </button>
              </div>

              {/* Pickup */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#c1c9bf] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9ed3aa] inline-block" />
                    Pickup Location
                  </label>
                  <button
                    type="button"
                    onClick={handleUseLiveLocation}
                    disabled={isLocating}
                    className="px-2.5 py-0.5 text-[11px] font-semibold bg-[#1d351d] hover:bg-[#274927] text-[#7de099] border border-[#34A853]/50 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Radio className={`w-3 h-3 text-[#34A853] ${isLocating ? 'animate-spin' : 'animate-pulse'}`} />
                    <span>{isLocating ? 'Detecting GPS...' : '📍 Use My Live GPS'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    id="pickup-select"
                    value={pickupId}
                    onChange={(e) => {
                      setPickupId(e.target.value);
                      setCustomPickup('');
                    }}
                    className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9ed3aa]"
                  >
                    {KIGALI_LOCATIONS.map((loc) => (
                      <option key={`pickup-${loc.id}`} value={loc.id}>
                        {loc.name} - {loc.sector}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Or enter custom landmark / house #..."
                    value={customPickup}
                    onChange={(e) => setCustomPickup(e.target.value)}
                    className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#8b938a] focus:outline-none focus:border-[#9ed3aa]"
                  />
                </div>
              </div>

              {/* Dropoff */}
              <div>
                <label className="block text-xs font-semibold text-[#c1c9bf] mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab] inline-block" />
                  Dropoff Location (Destination)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    id="dropoff-select"
                    value={dropoffId}
                    onChange={(e) => {
                      setDropoffId(e.target.value);
                      setCustomDropoff('');
                    }}
                    className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9ed3aa]"
                  >
                    {KIGALI_LOCATIONS.map((loc) => (
                      <option key={`dropoff-${loc.id}`} value={loc.id}>
                        {loc.name} - {loc.sector}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Or enter destination landmark..."
                    value={customDropoff}
                    onChange={(e) => setCustomDropoff(e.target.value)}
                    className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-[#8b938a] focus:outline-none focus:border-[#9ed3aa]"
                  />
                </div>
              </div>

              {/* Interactive Free Route Map Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-[#0c160b] border border-[#34A853]/40 shadow-inner mt-2">
                <div className="flex items-center justify-between px-3.5 py-2 bg-[#122012] border-b border-[#233522]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
                    <span className="text-xs font-bold text-white">Live Route Map (Kigali OpenStreetMap)</span>
                    <span className="text-[10px] text-[#86a884] hidden sm:inline">• Click map to set custom pickup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#9ed3aa] bg-[#1a2d1a] px-2 py-0.5 rounded border border-[#34A853]/30">
                      {distanceKm} km route
                    </span>
                    {onOpenKigaliMap && (
                      <button
                        type="button"
                        onClick={onOpenKigaliMap}
                        className="text-[10px] text-[#9ed3aa] hover:text-white flex items-center gap-1 bg-[#1a2d1a] px-2 py-0.5 rounded border border-[#34A853]/30 transition-colors cursor-pointer"
                        title="Open full interactive map"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Full Map</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative h-44 sm:h-52 w-full">
                  <div ref={mapContainerRef} className="w-full h-full z-0" />
                  <div className="absolute bottom-1.5 right-2 z-[400] bg-[#0c160b]/80 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-[#7da67b] border border-[#233822]">
                    100% Free OpenStreetMap • No API Key Needed
                  </div>
                </div>
              </div>
            </div>

            {/* Ride Tier Selection */}
            <div>
              <label className="block text-xs uppercase font-bold text-[#85AB8B] tracking-wider mb-2.5">
                Choose Smooth Ride Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {RIDE_OPTIONS.map((tier) => {
                  const fare = calculateRideFare(distanceKm, tier.id);
                  const isSelected = selectedTier === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all relative ${
                        isSelected
                          ? 'bg-[#2b4e34]/70 border-[#9ed3aa] shadow-lg shadow-[#336443]/30'
                          : 'bg-[#182216] border-[#414942]/30 hover:border-[#85AB8B]/50'
                      }`}
                    >
                      {tier.recommended && (
                        <span className="absolute -top-2.5 right-3 text-[10px] bg-[#9ed3aa] text-[#02391c] font-bold px-2 py-0.5 rounded-full">
                          POPULAR
                        </span>
                      )}
                      <div className="font-bold text-sm text-white">{tier.title}</div>
                      <div className="text-[11px] text-[#c1c9bf] line-clamp-1 mt-0.5">{tier.tagline}</div>
                      <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-2">
                        <span className="text-xs font-bold text-[#b9efc5] uppercase tracking-wider">
                          Rider-Decided Fare
                        </span>
                        <span className="text-[11px] text-[#85AB8B] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {tier.estimatedMinutes}m ETA
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hygiene & Passenger Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#c1c9bf] mb-1.5 flex items-center justify-between">
                  <span>Passenger Name</span>
                  <span className="text-[#85AB8B] text-[11px]">Required</span>
                </label>
                <input
                  id="passenger-name-input"
                  type="text"
                  required
                  placeholder="e.g. Cornelius / Alice"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full bg-[#182216] border border-[#414942]/50 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9ed3aa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c1c9bf] mb-1.5 flex items-center justify-between">
                  <span>Contact Phone (MoMo)</span>
                  <span className="text-[#85AB8B] text-[11px]">Rwandan format</span>
                </label>
                <input
                  id="passenger-phone-input"
                  type="tel"
                  required
                  placeholder="+250 788 000 000"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  className="w-full bg-[#182216] border border-[#414942]/50 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9ed3aa]"
                />
              </div>
            </div>

            {/* Helmet Preference */}
            <div className="bg-[#182216] p-3.5 rounded-xl border border-[#414942]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#9ed3aa] shrink-0" />
                <div>
                  <span className="font-semibold text-white">Sanitized Helmet Guarantee</span>
                  <p className="text-[11px] text-[#c1c9bf]">Fresh UV-sterilized helmet & disposable hairnet provided.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHelmetPreference('standard')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${
                    helmetPreference === 'standard'
                      ? 'bg-[#336443] border-[#9ed3aa] text-white'
                      : 'bg-[#222d20] border-transparent text-[#c1c9bf]'
                  }`}
                >
                  Standard (M)
                </button>
                <button
                  type="button"
                  onClick={() => setHelmetPreference('large')}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${
                    helmetPreference === 'large'
                      ? 'bg-[#336443] border-[#9ed3aa] text-white'
                      : 'bg-[#222d20] border-transparent text-[#c1c9bf]'
                  }`}
                >
                  Large (L/XL)
                </button>
              </div>
            </div>

            {/* Fare Summary & Submit - Rider Decides Fare */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#2c382a]">
              <div>
                <div className="text-xs text-[#c1c9bf]">Trip Distance ({distanceKm} km)</div>
                <div className="text-lg sm:text-xl font-extrabold text-[#9ed3aa] flex items-center gap-1.5">
                  <span>Rider-Decided Fare</span>
                  <span className="text-[10px] bg-[#336443] text-white px-2 py-0.5 rounded-full uppercase font-normal">Direct</span>
                </div>
                <div className="text-[11px] text-[#85AB8B]">Agreed directly with pilot • 0% middleman fees</div>
              </div>

              <button
                id="submit-ride-booking-btn"
                type="submit"
                className="w-full sm:w-auto bg-[#336443] hover:bg-[#3d7751] text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-[#336443]/40 flex items-center justify-center gap-2 transform active:scale-95 text-sm uppercase tracking-wider"
              >
                <span>Confirm Trip Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: MoMo Payment & Instant Dispatch */
          <div className="space-y-6">
            <div className="bg-[#182216] p-5 rounded-2xl border border-[#414942]/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2c382a]">
                <span className="text-sm text-[#c1c9bf]">Trip Route</span>
                <span className="text-sm font-bold text-white text-right">
                  {pickupLocation?.name || 'Pickup'} → {dropoffLocation?.name || 'Dropoff'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[#2c382a]">
                <span className="text-sm text-[#c1c9bf]">Trip Fare</span>
                <span className="text-sm font-bold text-[#9ed3aa] uppercase tracking-wider">
                  Agreed with Pilot (Direct)
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-[#2c382a]">
                <span className="text-sm text-[#c1c9bf]">Passenger</span>
                <span className="text-sm font-medium text-white">{passengerName} ({passengerPhone})</span>
              </div>
              {/* Selected Rider Profile & Direct MoMo Info */}
              {(() => {
                const pilot = getSelectedRider();
                return (
                  <div className="pt-2 border-t border-[#2c382a] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={pilot?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'} 
                        alt="Pilot"
                        className="w-8 h-8 rounded-full object-cover border border-[#9ed3aa]"
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <span>{pilot?.name || 'Verified Moto Pilot'}</span>
                          <span className="text-[10px] text-[#9ed3aa] font-mono">({pilot?.bikePlate || 'RAD 829 K'})</span>
                        </div>
                        <div className="text-[11px] text-[#85AB8B]">
                          Direct MoMo: <strong className="text-white font-mono">{pilot?.momoNumber || pilot?.phone || '0788123456'}</strong>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#336443] text-[#9ed3aa]">
                      Rider Wallet
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* MoMo Provider Selection */}
            <div>
              <label className="block text-xs uppercase font-bold text-[#85AB8B] tracking-wider mb-2">
                Select Mobile Money Wallet
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setMomoNetwork('MTN')}
                  className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between ${
                    momoNetwork === 'MTN'
                      ? 'bg-[#ffcc00]/15 border-[#ffcc00] text-white'
                      : 'bg-[#182216] border-[#414942]/30 text-[#c1c9bf]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ffcc00] text-black font-extrabold flex items-center justify-center text-xs">
                      MTN
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">MTN MoMo</div>
                      <div className="text-[11px] text-[#ffcc00]">*182# Prompt</div>
                    </div>
                  </div>
                  {momoNetwork === 'MTN' && <Check className="w-5 h-5 text-[#ffcc00]" />}
                </div>

                <div
                  onClick={() => setMomoNetwork('Airtel')}
                  className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between ${
                    momoNetwork === 'Airtel'
                      ? 'bg-[#e60000]/15 border-[#e60000] text-white'
                      : 'bg-[#182216] border-[#414942]/30 text-[#c1c9bf]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#e60000] text-white font-extrabold flex items-center justify-center text-xs">
                      AIR
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">Airtel Money</div>
                      <div className="text-[11px] text-[#ffb4ab]">*500# Prompt</div>
                    </div>
                  </div>
                  {momoNetwork === 'Airtel' && <Check className="w-5 h-5 text-[#ffb4ab]" />}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#c1c9bf] mb-1.5">
                Your Rwandan MoMo Phone Number
              </label>
              <input
                type="tel"
                value={momoNumber || passengerPhone}
                onChange={(e) => setMomoNumber(e.target.value)}
                className="w-full bg-[#182216] border border-[#414942]/50 rounded-xl px-3.5 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#9ed3aa]"
                placeholder="e.g. 0788 123 456"
              />
              <p className="text-[11px] text-[#85AB8B] mt-1.5 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                Zero-fee direct settlement to your pilot&apos;s personal MoMo account.
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#2c382a]">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-1/3 bg-[#1f2a1d] hover:bg-[#2c382a] text-[#c1c9bf] py-3.5 rounded-xl font-medium text-sm transition-colors"
              >
                Back
              </button>
              <button
                id="confirm-momo-dispatch-btn"
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmMoMoPayment}
                className="w-2/3 bg-[#336443] hover:bg-[#3d7751] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting Kigali Fleet...
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-[#9ed3aa]" />
                    <span>Dispatch Moto Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
