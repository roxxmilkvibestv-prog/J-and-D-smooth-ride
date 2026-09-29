import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Bike, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  AlertTriangle,
  Smartphone,
  Star,
  Send,
  Sparkles,
  Share2,
  Maximize2,
  Radio,
  Layers
} from 'lucide-react';
import L from 'leaflet';
import { BookingState } from '../types';

interface LiveTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingState | null;
  onCancelBooking: (id: string) => void;
  onOpenKigaliMap?: () => void;
}

const KIGALI_KNOWN_COORDS: Record<string, { lat: number; lng: number }> = {
  kcc: { lat: -1.9536, lng: 30.0934 },
  convention: { lat: -1.9536, lng: 30.0934 },
  heights: { lat: -1.9525, lng: 30.0915 },
  arena: { lat: -1.9538, lng: 30.1127 },
  remera: { lat: -1.9538, lng: 30.1127 },
  airport: { lat: -1.9686, lng: 30.1395 },
  kanombe: { lat: -1.9686, lng: 30.1395 },
  cbd: { lat: -1.9441, lng: 30.0619 },
  chic: { lat: -1.9441, lng: 30.0619 },
  downtown: { lat: -1.9441, lng: 30.0619 },
  nyarutarama: { lat: -1.9365, lng: 30.0968 },
  kacyiru: { lat: -1.9358, lng: 30.0827 },
  kiyovu: { lat: -1.9555, lng: 30.0601 },
  gishushu: { lat: -1.9490, lng: 30.0980 },
  nyamirambo: { lat: -1.9772, lng: 30.0483 },
  biryogo: { lat: -1.9772, lng: 30.0483 },
  kicukiro: { lat: -1.9715, lng: 30.1020 },
  gikondo: { lat: -1.9702, lng: 30.0811 },
  rebero: { lat: -1.9961, lng: 30.0767 },
  nyabugogo: { lat: -1.9381, lng: 30.0444 },
  muhima: { lat: -1.9410, lng: 30.0520 },
  kimihurura: { lat: -1.9536, lng: 30.0934 },
};

function getCoordsFromText(text: string, fallback: { lat: number; lng: number }): { lat: number; lng: number } {
  if (!text) return fallback;
  const lower = text.toLowerCase();
  for (const [key, coords] of Object.entries(KIGALI_KNOWN_COORDS)) {
    if (lower.includes(key)) return coords;
  }
  return fallback;
}

export const LiveTrackerModal: React.FC<LiveTrackerModalProps> = ({
  isOpen,
  onClose,
  booking,
  onCancelBooking,
  onOpenKigaliMap,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [etaMins, setEtaMins] = useState(3);
  const [progressPercent, setProgressPercent] = useState(25);
  const [currentStage, setCurrentStage] = useState<'arriving' | 'on_board' | 'completed'>('arriving');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'driver'; text: string; time: string }>>([
    { sender: 'driver', text: 'Muraho! I have sanitized both helmets and disposable hairnets ready. Arriving shortly!', time: 'Just now' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [showSosAlert, setShowSosAlert] = useState(false);

  // Compute real Kigali coordinates for pickup and dropoff
  const pickupCoords = getCoordsFromText(booking?.pickup || '', { lat: -1.9536, lng: 30.0934 });
  const dropoffCoords = getCoordsFromText(booking?.dropoff || '', { lat: -1.9686, lng: 30.1395 });

  // Initialize and manage real Leaflet OpenStreetMap
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        return;
      }

      // Initialize map centered between pickup and destination
      const midLat = (pickupCoords.lat + dropoffCoords.lat) / 2;
      const midLng = (pickupCoords.lng + dropoffCoords.lng) / 2;

      const map = L.map(mapContainerRef.current!, {
        center: [midLat, midLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // 100% Free OpenStreetMap Standard Tiles (No API Key Required)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Pickup Marker (Point A)
      const pickupIcon = L.divIcon({
        className: 'pickup-pin',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="width:26px; height:26px; border-radius:50%; background:#34A853; border:2.5px solid white; display:flex; align-items:center; justify-content:center; color:white; font-weight:900; font-size:12px; box-shadow:0 3px 8px rgba(0,0,0,0.6);">A</div>
            <div style="background:#0e190d; color:#9ed3aa; font-size:9px; font-weight:800; padding:2px 5px; border-radius:4px; margin-top:2px; border:1px solid #34A853; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.4);">Pickup</div>
          </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 25],
      });
      L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon })
        .addTo(map)
        .bindPopup(`<b>Pickup:</b> ${booking?.pickup || 'Kigali Pickup'}`);

      // Dropoff Marker (Point B)
      const dropoffIcon = L.divIcon({
        className: 'dropoff-pin',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="width:26px; height:26px; border-radius:50%; background:#e11d48; border:2.5px solid white; display:flex; align-items:center; justify-content:center; color:white; font-weight:900; font-size:12px; box-shadow:0 3px 8px rgba(0,0,0,0.6);">B</div>
            <div style="background:#190e10; color:#fda4af; font-size:9px; font-weight:800; padding:2px 5px; border-radius:4px; margin-top:2px; border:1px solid #e11d48; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.4);">Destination</div>
          </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 25],
      });
      L.marker([dropoffCoords.lat, dropoffCoords.lng], { icon: dropoffIcon })
        .addTo(map)
        .bindPopup(`<b>Destination:</b> ${booking?.dropoff || 'Kigali Destination'}`);

      // Route Path Polyline
      const routeLine = L.polyline([
        [pickupCoords.lat, pickupCoords.lng],
        [dropoffCoords.lat, dropoffCoords.lng]
      ], {
        color: '#34A853',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
      routeLineRef.current = routeLine;

      // Fit route within map bounds
      map.fitBounds([
        [pickupCoords.lat, pickupCoords.lng],
        [dropoffCoords.lat, dropoffCoords.lng]
      ], { padding: [40, 40] });

      // Moving Motorcycle Driver Marker
      const initialDriverLat = pickupCoords.lat + (dropoffCoords.lat - pickupCoords.lat) * (progressPercent / 100);
      const initialDriverLng = pickupCoords.lng + (dropoffCoords.lng - pickupCoords.lng) * (progressPercent / 100);

      const driverIcon = L.divIcon({
        className: 'driver-moto-pin',
        html: `
          <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
            <span style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(52,168,83,0.35); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
            <div style="width:34px; height:34px; border-radius:10px; background:#18321b; border:2px solid #34A853; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 4px 12px rgba(0,0,0,0.6); position:relative; z-index:2;">
              🏍️
            </div>
            <div style="background:#0e1a0f; color:#b9efc5; font-size:9px; font-weight:800; padding:1px 5px; border-radius:4px; margin-top:2px; border:1px solid #34A853; white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.5);">
              ${booking?.driver?.plateNumber || 'RAC 412B'}
            </div>
          </div>
        `,
        iconSize: [46, 56],
        iconAnchor: [23, 28],
      });

      const driverMarker = L.marker([initialDriverLat, initialDriverLng], { icon: driverIcon }).addTo(map);
      driverMarkerRef.current = driverMarker;
      mapInstanceRef.current = map;
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, booking]);

  // Update Driver Marker Position on Route as Trip Progresses
  useEffect(() => {
    if (!driverMarkerRef.current) return;
    const currentLat = pickupCoords.lat + (dropoffCoords.lat - pickupCoords.lat) * (progressPercent / 100);
    const currentLng = pickupCoords.lng + (dropoffCoords.lng - pickupCoords.lng) * (progressPercent / 100);
    driverMarkerRef.current.setLatLng([currentLat, currentLng]);
  }, [progressPercent, pickupCoords, dropoffCoords]);

  useEffect(() => {
    if (!isOpen || !booking) return;

    // Simulate real-time progress
    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          setCurrentStage('completed');
          return 100;
        }
        if (prev >= 50) {
          setCurrentStage('on_board');
        }
        return prev + 5;
      });

      setEtaMins((prev) => (prev > 1 ? prev - 1 : 1));
    }, 4000);

    return () => clearInterval(timer);
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText, time: 'Just now' }]);
    setInputMsg('');

    // Simulate realistic driver reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'driver', 
          text: `Got it! I am at the landmark with plate ${booking?.driver?.plateNumber || 'RAC 412B'}. See you in 1 minute!`, 
          time: 'Just now' 
        }
      ]);
    }, 1500);
  };

  const handleShareLiveLocationWithDriver = () => {
    const sendLocationText = (lat: number, lng: number) => {
      const locationMsg = `📍 My Live Location: (${lat.toFixed(4)}, ${lng.toFixed(4)}) • Please pick me up at my live location: ${booking?.pickup || 'Pickup Pin'}!`;
      setChatMessages(prev => [...prev, { sender: 'user', text: locationMsg, time: 'Just now' }]);

      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          {
            sender: 'driver',
            text: `Muraho! I have locked onto your live location pin (${lat.toFixed(4)}, ${lng.toFixed(4)}). Navigating directly on OpenStreetMap to pick you up!`,
            time: 'Just now',
          }
        ]);
      }, 1200);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendLocationText(pos.coords.latitude, pos.coords.longitude),
        () => sendLocationText(pickupCoords.lat, pickupCoords.lng),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      sendLocationText(pickupCoords.lat, pickupCoords.lng);
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="live-tracker-modal-card"
        className="relative w-full max-w-3xl bg-[#141e12] border border-[#85AB8B]/30 rounded-3xl p-5 sm:p-8 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#9ed3aa]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2c382a] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2b4e34] flex items-center justify-center text-[#9ed3aa] relative">
              <Bike className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#9ed3aa] rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Live {booking.type === 'ride' ? 'Smooth Ride' : 'Courier'} Tracking
                </h2>
                <span className="text-[10px] font-mono bg-[#222d20] text-[#9ed3aa] px-2 py-0.5 rounded border border-[#9ed3aa]/20">
                  {booking.id}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <p className="text-xs text-[#85AB8B] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#9ed3aa] inline-block" />
                  {currentStage === 'arriving' ? 'Driver approaching pickup location' : currentStage === 'on_board' ? 'Trip in progress across Kigali' : 'Arrived safely at destination!'}
                </p>
                <span className="text-[10px] text-[#9ed3aa] flex items-center gap-1 bg-[#182617] px-2 py-0.5 rounded-full border border-[#9ed3aa]/25 font-mono">
                  <MessageSquare className="w-2.5 h-2.5 text-[#9ed3aa]" />
                  <span>SMS alert to +250 796 569 416</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#c1c9bf] hover:text-white p-2 rounded-xl bg-[#1f2a1d] hover:bg-[#2c382a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Kigali Real Live Leaflet OpenStreetMap View */}
        <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-[#0c160b] border border-[#34A853]/40 shadow-inner mb-5">
          {/* Leaflet DOM container */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Live Telemetry Badge */}
          <div className="absolute top-3 left-3 z-[400] bg-[#142314]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#34A853]/40 flex items-center gap-2 text-xs text-white shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping" />
            <span className="font-semibold text-white">Live OpenStreetMap GPS</span>
            <span className="text-[#85AB8B] hidden sm:inline">| Speed: 38 km/h</span>
          </div>

          {/* Safety OTP Pin Badge & Full Map Trigger */}
          <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
            {onOpenKigaliMap && (
              <button
                type="button"
                onClick={onOpenKigaliMap}
                className="bg-[#142314]/90 hover:bg-[#1f381f] text-[#9ed3aa] px-3 py-1.5 rounded-full border border-[#34A853]/40 text-xs font-bold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
                title="Expand City Map"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full City Map</span>
              </button>
            )}

            <div className="bg-[#2b4e34] px-3.5 py-1.5 rounded-full border border-[#9ed3aa]/40 flex items-center gap-2 text-xs text-[#b9efc5] shadow-lg">
              <ShieldCheck className="w-4 h-4 text-[#9ed3aa]" />
              <span>Trip OTP: <strong className="font-mono text-white text-sm tracking-wider">{booking.otpCode || '5821'}</strong></span>
            </div>
          </div>

          {/* Bottom attribution badge */}
          <div className="absolute bottom-2 right-2 z-[400] bg-[#0c160b]/80 backdrop-blur-sm px-2.5 py-0.5 rounded-md border border-[#233822] text-[9px] text-[#7da67b]">
            100% Free OpenStreetMap • Live Real Route
          </div>
        </div>

        {/* Driver Profile & Actions Card */}
        <div className="bg-[#182216] rounded-2xl p-4 sm:p-5 border border-[#414942]/30 mb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={booking.driver?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt="Driver Avatar"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#9ed3aa]/50 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">{booking.driver?.name || 'Jean-Damascene Mugisha'}</h3>
                  <span className="text-xs bg-[#2b4e34] text-[#9ed3aa] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#9ed3aa]" /> {booking.driver?.rating || 4.95}
                  </span>
                </div>
                <div className="text-xs text-[#c1c9bf] mt-0.5">
                  Motorcycle: <strong className="text-white">{booking.driver?.bikeModel || 'TVS HLX 150'}</strong> • Plate: <strong className="text-[#9ed3aa] font-mono bg-[#222d20] px-1.5 py-0.5 rounded border border-[#9ed3aa]/20">{booking.driver?.plateNumber || 'RAC 412B'}</strong>
                </div>
                <div className="text-[11px] text-[#85AB8B] mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sanitized yellow helmet + hairnet verified</span>
                </div>
              </div>
            </div>

            {/* Call & Chat Triggers */}
            <div className="flex gap-2.5 w-full sm:w-auto">
              <a
                href={`tel:${booking.driver?.phone || '+250788349102'}`}
                className="flex-1 sm:flex-none bg-[#222d20] hover:bg-[#2c382a] text-white p-3 rounded-xl border border-[#414942]/40 flex items-center justify-center gap-2 text-xs font-semibold transition-colors"
              >
                <Phone className="w-4 h-4 text-[#9ed3aa]" />
                <span>Call Driver</span>
              </a>

              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`flex-1 sm:flex-none p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${
                  chatOpen
                    ? 'bg-[#336443] border-[#9ed3aa] text-white'
                    : 'bg-[#222d20] border-[#414942]/40 text-white hover:bg-[#2c382a]'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#9ed3aa]" />
                <span>Chat ({chatMessages.length})</span>
              </button>
            </div>
          </div>

          {/* Expandable Chat Box */}
          {chatOpen && (
            <div className="mt-4 pt-4 border-t border-[#2c382a] space-y-3">
              <div className="max-h-40 overflow-y-auto space-y-2 text-xs pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`p-2.5 rounded-xl max-w-[80%] ${
                        msg.sender === 'user'
                          ? 'bg-[#336443] text-white rounded-br-none'
                          : 'bg-[#222d20] text-[#d9e6d2] rounded-bl-none border border-[#414942]/30'
                      }`}
                    >
                      <div>{msg.text}</div>
                      <div className="text-[9px] opacity-60 text-right mt-0.5">{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShareLiveLocationWithDriver}
                  className="text-[11px] font-semibold bg-[#1d351d] hover:bg-[#284928] text-[#7de099] border border-[#34A853]/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Radio className="w-3 h-3 text-[#34A853] animate-pulse" />
                  <span>📍 Send My Live Location to Rider</span>
                </button>
                <span className="text-[10px] text-[#7d997b]">Free OpenStreetMap</span>
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type message to rider..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 bg-[#141e12] border border-[#414942]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
                />
                <button
                  type="submit"
                  className="bg-[#336443] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#3d7751] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Trip Fare & Safety Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#2c382a] text-xs">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[#c1c9bf]">Trip Fare: </span>
              <strong className="text-sm sm:text-base text-[#9ed3aa] font-bold">Rider-Agreed (Direct)</strong>
            </div>
            <div className="text-[#85AB8B]">
              Network: <strong className="text-white">{booking.momoNetwork} MoMo</strong>
            </div>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setShowSosAlert(true)}
              className="flex-1 sm:flex-none border border-[#ffb4ab]/40 text-[#ffb4ab] hover:bg-[#93000a]/20 px-3.5 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SOS / Helpline</span>
            </button>

            <button
              onClick={() => {
                onCancelBooking(booking.id);
                onClose();
              }}
              className="flex-1 sm:flex-none bg-[#1f2a1d] hover:bg-[#2c382a] text-[#c1c9bf] px-3.5 py-2 rounded-xl font-medium transition-colors"
            >
              Cancel Ride
            </button>
          </div>
        </div>

        {/* SOS Emergency Prompt */}
        {showSosAlert && (
          <div className="mt-4 p-3.5 bg-[#93000a]/30 border border-[#ffb4ab]/50 rounded-xl text-[#ffdad6] text-xs flex items-center justify-between gap-3 animate-fadeIn">
            <div>
              <strong>Kigali Emergency & Police Hotline: 112</strong>
              <p className="opacity-80">Smooth Ride Operations Desk: 0796569416 (24/7 Monitored)</p>
            </div>
            <button
              onClick={() => setShowSosAlert(false)}
              className="text-[#ffdad6] underline font-bold"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
