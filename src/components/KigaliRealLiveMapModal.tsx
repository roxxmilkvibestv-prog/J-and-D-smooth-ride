import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Bike, 
  Radio, 
  Users, 
  Crosshair, 
  Layers, 
  Share2, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Search,
  PhoneCall,
  Activity
} from 'lucide-react';
import L from 'leaflet';
import { io, Socket } from 'socket.io-client';
import { KIGALI_LOCATIONS } from '../data/kigaliLocations';

interface KigaliRealLiveMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPickupLocation?: (locationName: string, lat?: number, lng?: number) => void;
  userRole?: 'client' | 'rider';
}

interface ActivePilotMarker {
  driverId: string;
  driverName: string;
  bikePlate: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

interface ActiveClientMarker {
  clientId: string;
  clientName: string;
  landmark: string;
  lat: number;
  lng: number;
  tripId?: string;
  timestamp: number;
}

export const FREE_OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const FREE_OSM_ATTRIBUTION = '© OpenStreetMap contributors (100% Free & Open-Source)';

export interface SearchableKigaliPlace {
  id: string;
  name: string;
  sector: string;
  district: string;
  lat: number;
  lng: number;
  type: string;
}

export const KIGALI_SEARCHABLE_PLACES: SearchableKigaliPlace[] = [
  { id: 'kcc', name: 'Kigali Convention Centre (KCC)', sector: 'Kimihurura', district: 'Gasabo', lat: -1.9536, lng: 30.0934, type: 'Landmark' },
  { id: 'kh', name: 'Kigali Heights & KG 2 Roundabout', sector: 'Kimihurura', district: 'Gasabo', lat: -1.9525, lng: 30.0925, type: 'Commercial Mall' },
  { id: 'arena', name: 'BK Arena & Stadium Complex', sector: 'Remera', district: 'Gasabo', lat: -1.9538, lng: 30.1127, type: 'Sports Arena' },
  { id: 'airport', name: 'Kanombe Kigali International Airport', sector: 'Kanombe', district: 'Kicukiro', lat: -1.9686, lng: 30.1395, type: 'Airport Terminal' },
  { id: 'chic', name: 'Downtown CBD & CHIC Mall Complex', sector: 'Nyarugenge', district: 'Nyarugenge', lat: -1.9441, lng: 30.0619, type: 'City Center' },
  { id: 'utc', name: 'UTC & City Plaza Nyarugenge', sector: 'Nyarugenge', district: 'Nyarugenge', lat: -1.9465, lng: 30.0595, type: 'Shopping Mall' },
  { id: 'golf', name: 'Nyarutarama Golf Corridor & MTN Center', sector: 'Remera', district: 'Gasabo', lat: -1.9365, lng: 30.0968, type: 'Golf & Residential' },
  { id: 'kacyiru', name: 'Kacyiru Government Ministries & US Embassy', sector: 'Kacyiru', district: 'Gasabo', lat: -1.9358, lng: 30.0827, type: 'Ministries' },
  { id: 'biryogo', name: 'Nyamirambo Biryogo Car-Free Zone', sector: 'Nyamirambo', district: 'Nyarugenge', lat: -1.9772, lng: 30.0483, type: 'Food Street' },
  { id: 'nyabugogo', name: 'Nyabugogo Bus Terminal & Market', sector: 'Muhima', district: 'Nyarugenge', lat: -1.9381, lng: 30.0444, type: 'Bus Terminal' },
  { id: 'kimironko', name: 'Kimironko Market & Bus Park', sector: 'Kimironko', district: 'Gasabo', lat: -1.9460, lng: 30.1265, type: 'Main Market' },
  { id: 'rebero', name: 'Rebero Panoramic Ridge & Juru Park', sector: 'Rebero', district: 'Kicukiro', lat: -1.9961, lng: 30.0767, type: 'Panoramic View' },
  { id: 'gikondo', name: 'Gikondo Expo Grounds & Magerwa', sector: 'Gikondo', district: 'Kicukiro', lat: -1.9702, lng: 30.0811, type: 'Expo Trade' },
  { id: 'kiyovu', name: 'Kiyovu Luxury Quarter & Serena Hotel', sector: 'Nyarugenge', district: 'Nyarugenge', lat: -1.9520, lng: 30.0620, type: 'Serena Hotel' },
  { id: 'gisozi', name: 'Gisozi Genocide Memorial & ULK', sector: 'Gisozi', district: 'Gasabo', lat: -1.9298, lng: 30.0615, type: 'Memorial & Univ' },
  { id: 'kagugu', name: 'Kagugu / SOS Children Village', sector: 'Kinyinya', district: 'Gasabo', lat: -1.9180, lng: 30.0860, type: 'Residential' },
  { id: 'sonatubes', name: 'Kicukiro Centre & Sonatubes Junction', sector: 'Kicukiro', district: 'Kicukiro', lat: -1.9740, lng: 30.1030, type: 'Transit Junction' },
  { id: 'rdb', name: 'RDB Headquarters (Gishushu)', sector: 'Kimihurura', district: 'Gasabo', lat: -1.9510, lng: 30.0980, type: 'Gov Headquarters' },
  { id: 'mt_kigali', name: 'Mount Kigali Viewpoint & Fazenda', sector: 'Nyamirambo', district: 'Nyarugenge', lat: -1.9880, lng: 30.0210, type: 'Hill Viewpoint' },
  { id: 'faisal', name: 'King Faisal Hospital Rwanda', sector: 'Kacyiru', district: 'Gasabo', lat: -1.9420, lng: 30.0900, type: 'Hospital' },
  { id: 'giporoso', name: 'Giporoso Remera Junction', sector: 'Remera', district: 'Gasabo', lat: -1.9610, lng: 30.1180, type: 'Commercial Corner' },
];

export const KigaliRealLiveMapModal: React.FC<KigaliRealLiveMapModalProps> = ({
  isOpen,
  onClose,
  onSelectPickupLocation,
  userRole = 'client',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pilotMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const clientMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const userPinMarkerRef = useRef<L.Marker | null>(null);

  const [activeTabMode, setActiveTabMode] = useState<'client' | 'rider'>(userRole);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [clientPosition, setClientPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState('Kigali Convention Centre');
  const [activePilots, setActivePilots] = useState<ActivePilotMarker[]>([]);
  const [activeClients, setActiveClients] = useState<ActiveClientMarker[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'pilots' | 'clients'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [pinpointFeedback, setPinpointFeedback] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Connected to 100% Free Kigali GPS Grid');

  // Filtered places matching search query
  const filteredPlaces = searchQuery.trim()
    ? KIGALI_SEARCHABLE_PLACES.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : KIGALI_SEARCHABLE_PLACES.slice(0, 8);

  const handleSelectSearchPlace = (place: SearchableKigaliPlace) => {
    setSelectedLocationName(place.name);
    setClientPosition({ lat: place.lat, lng: place.lng });
    setSearchQuery(place.name);
    setShowSearchDropdown(false);
    setPinpointFeedback(`📍 Pinpoint placed: ${place.name} (${place.sector})`);
    setStatusMessage(`Pinpoint placed at ${place.name}. Broadcasted to riders.`);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.lat, place.lng], 16, { animate: true, duration: 1.2 });
      updateUserPinMarker(place.lat, place.lng, mapInstanceRef.current);
    }

    if (socketRef.current) {
      socketRef.current.emit(
        activeTabMode === 'rider' ? 'driver-location-update' : 'client-location-update',
        {
          lat: place.lat,
          lng: place.lng,
          driverName: activeTabMode === 'rider' ? 'Active Verified Pilot' : undefined,
          clientName: activeTabMode === 'client' ? 'Live Passenger' : undefined,
          landmark: place.name,
          bikePlate: 'RAD 829 K',
          isPinpoint: true,
        }
      );
    }
  };

  const handleCustomSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const matched = KIGALI_SEARCHABLE_PLACES.find((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sector.toLowerCase().includes(query.toLowerCase()) ||
      p.district.toLowerCase().includes(query.toLowerCase())
    );

    if (matched) {
      handleSelectSearchPlace(matched);
      return;
    }

    setIsSearchingExternal(true);
    setStatusMessage(`Searching Kigali map for "${query}"...`);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Kigali, Rwanda')}&limit=3`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const placeName = item.display_name.split(',')[0] || query;
        const place: SearchableKigaliPlace = {
          id: `custom-${Date.now()}`,
          name: `${placeName} (Kigali)`,
          sector: 'Kigali Area',
          district: 'Kigali',
          lat,
          lng,
          type: 'Search Pinpoint',
        };
        handleSelectSearchPlace(place);
      } else {
        const fallback: SearchableKigaliPlace = {
          id: `custom-${Date.now()}`,
          name: `${query} (Custom Kigali Pin)`,
          sector: 'Kigali',
          district: 'Rwanda',
          lat: -1.9536,
          lng: 30.0934,
          type: 'Pinpoint',
        };
        handleSelectSearchPlace(fallback);
      }
    } catch (err) {
      console.warn('Geocoding search failed, fallback pinpoint placed:', err);
      const fallback: SearchableKigaliPlace = {
        id: `custom-${Date.now()}`,
        name: `${query} (Custom Kigali Pin)`,
        sector: 'Kigali',
        district: 'Rwanda',
        lat: -1.9441,
        lng: 30.0619,
        type: 'Pinpoint',
      };
      handleSelectSearchPlace(fallback);
    } finally {
      setIsSearchingExternal(false);
      setShowSearchDropdown(false);
    }
  };

  // Initial Seed Pilots across Kigali so map is immediately lively and responsive
  useEffect(() => {
    if (activePilots.length === 0) {
      const initialPilots: ActivePilotMarker[] = [
        { driverId: 'pilot-1', driverName: 'Jean-Damascene (MotoElite #1)', bikePlate: 'RAC 412B', lat: -1.9512, lng: 30.0915, speed: 38, heading: 45, timestamp: Date.now() },
        { driverId: 'pilot-2', driverName: 'Emmanuel N. (Gasabo Express)', bikePlate: 'RAD 829K', lat: -1.9465, lng: 30.0652, speed: 32, heading: 120, timestamp: Date.now() },
        { driverId: 'pilot-3', driverName: 'Fabrice K. (Remera Swift)', bikePlate: 'RAB 319M', lat: -1.9550, lng: 30.1110, speed: 41, heading: 270, timestamp: Date.now() },
        { driverId: 'pilot-4', driverName: 'Patrick U. (Kacyiru Pilot)', bikePlate: 'RAC 902L', lat: -1.9372, lng: 30.0845, speed: 28, heading: 190, timestamp: Date.now() },
        { driverId: 'pilot-5', driverName: 'Claude M. (Nyamirambo VIP)', bikePlate: 'RAD 115P', lat: -1.9750, lng: 30.0510, speed: 35, heading: 80, timestamp: Date.now() },
      ];
      setActivePilots(initialPilots);
    }
  }, []);

  // Connect to Socket.io Real-Time Tracking
  useEffect(() => {
    if (!isOpen) return;

    const socket = io({
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setStatusMessage('Live GPS Relay Connected');
    });

    socket.on('active-drivers-list', (drivers: ActivePilotMarker[]) => {
      if (drivers && drivers.length > 0) {
        setActivePilots((prev) => {
          const map = new Map(prev.map(p => [p.driverId, p]));
          drivers.forEach(d => map.set(d.driverId, d));
          return Array.from(map.values());
        });
      }
    });

    socket.on('driver-location-changed', (driver: ActivePilotMarker) => {
      setActivePilots((prev) => {
        const filtered = prev.filter((p) => p.driverId !== driver.driverId);
        return [...filtered, driver];
      });
    });

    socket.on('active-clients-list', (clients: ActiveClientMarker[]) => {
      if (clients && clients.length > 0) {
        setActiveClients(clients);
      }
    });

    socket.on('client-location-changed', (client: ActiveClientMarker) => {
      setActiveClients((prev) => {
        const filtered = prev.filter((c) => c.clientId !== client.clientId);
        return [...filtered, client];
      });
    });

    socket.on('disconnect', () => {
      setStatusMessage('Reconnecting to GPS Relay...');
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Small delay to ensure modal DOM is fully rendered with dimensions
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        return;
      }

      // Center on Kigali City (-1.9441, 30.0619)
      const map = L.map(mapContainerRef.current!, {
        center: [-1.9441, 30.0619],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // 100% Free OpenStreetMap Standard Layer (No API key required)
      const initialLayer = L.tileLayer(FREE_OSM_TILE_URL, {
        maxZoom: 19,
        attribution: FREE_OSM_ATTRIBUTION,
      }).addTo(map);
      currentTileLayerRef.current = initialLayer;

      mapInstanceRef.current = map;

      // Click on map to pinpoint pickup or destination location
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setClientPosition({ lat, lng });
        const pinName = `Pinpoint (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setSelectedLocationName(pinName);
        updateUserPinMarker(lat, lng, map);
        setPinpointFeedback(`📍 Pickup location set: (${lat.toFixed(4)}, ${lng.toFixed(4)}) • Ready for ride booking!`);
        setStatusMessage(`Pickup location placed at ${lat.toFixed(4)}, ${lng.toFixed(4)}.`);

        if (socketRef.current) {
          socketRef.current.emit(
            activeTabMode === 'rider' ? 'driver-location-update' : 'client-location-update',
            {
              lat,
              lng,
              driverName: activeTabMode === 'rider' ? 'Active Verified Pilot' : undefined,
              clientName: activeTabMode === 'client' ? 'Live Passenger' : undefined,
              landmark: pinName,
              bikePlate: 'RAD 829 K',
              isPinpoint: true,
            }
          );
        }
      });
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      pilotMarkersRef.current.clear();
      clientMarkersRef.current.clear();
      userPinMarkerRef.current = null;
      currentTileLayerRef.current = null;
    };
  }, [isOpen]);

  // Helper to place or move user's personal marker
  const updateUserPinMarker = (lat: number, lng: number, map: L.Map) => {
    if (userPinMarkerRef.current) {
      userPinMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const pinIcon = L.divIcon({
        className: 'user-pin-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-[#34A853]/40 animate-ping"></span>
            <div class="w-8 h-8 rounded-full bg-[#1b4424] border-2 border-[#34A853] text-white flex items-center justify-center shadow-lg text-xs font-bold">
              📍
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      marker.bindPopup(`<strong>Your Location</strong><br/>Kigali Pickup Zone`);
      userPinMarkerRef.current = marker;
    }
  };

  // Sync Pilot Markers on the Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (filterType === 'clients') {
      pilotMarkersRef.current.forEach((m) => map.removeLayer(m));
      pilotMarkersRef.current.clear();
      return;
    }

    activePilots.forEach((pilot) => {
      if (!pilot.lat || !pilot.lng) return;

      const existingMarker = pilotMarkersRef.current.get(pilot.driverId);
      if (existingMarker) {
        existingMarker.setLatLng([pilot.lat, pilot.lng]);
      } else {
        const bikeIcon = L.divIcon({
          className: 'pilot-bike-icon',
          html: `
            <div class="relative flex items-center justify-center group">
              <span class="absolute w-7 h-7 rounded-full bg-[#9ed3aa]/30 animate-pulse"></span>
              <div class="w-7 h-7 rounded-full bg-[#132817] border-2 border-[#9ed3aa] text-[#9ed3aa] flex items-center justify-center shadow-md">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                </svg>
              </div>
              <div class="absolute -bottom-5 whitespace-nowrap bg-[#0d170e]/90 text-[9px] font-bold text-white px-1.5 py-0.5 rounded border border-[#336443] pointer-events-none">
                ${pilot.bikePlate}
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([pilot.lat, pilot.lng], { icon: bikeIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #111;">
            <strong style="color: #2b6e3b;">🏍️ ${pilot.driverName}</strong><br/>
            <span>Plate: <b>${pilot.bikePlate}</b></span><br/>
            <span>Speed: ~${pilot.speed || 35} km/h • Sanitized Helmets Ready</span>
          </div>
        `);
        pilotMarkersRef.current.set(pilot.driverId, marker);
      }
    });
  }, [activePilots, filterType]);

  // Sync Client Markers on the Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (filterType === 'pilots') {
      clientMarkersRef.current.forEach((m) => map.removeLayer(m));
      clientMarkersRef.current.clear();
      return;
    }

    activeClients.forEach((client) => {
      if (!client.lat || !client.lng) return;

      const existingMarker = clientMarkersRef.current.get(client.clientId);
      if (existingMarker) {
        existingMarker.setLatLng([client.lat, client.lng]);
      } else {
        const clientIcon = L.divIcon({
          className: 'client-beacon-icon',
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute w-6 h-6 rounded-full bg-cyan-400/40 animate-ping"></span>
              <div class="w-6 h-6 rounded-full bg-[#0a2027] border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-md text-[10px] font-bold">
                🙋
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([client.lat, client.lng], { icon: clientIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #111;">
            <strong style="color: #0891b2;">Passenger: ${client.clientName}</strong><br/>
            <span>Waiting at: <b>${client.landmark}</b></span>
          </div>
        `);
        clientMarkersRef.current.set(client.clientId, marker);
      }
    });
  }, [activeClients, filterType]);

  // Handle "Share My Live GPS Location"
  const handleToggleShareLocation = () => {
    if (isSharingLocation) {
      setIsSharingLocation(false);
      setStatusMessage('Live Location Sharing Stopped');
      return;
    }

    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by your browser.');
      return;
    }

    setStatusMessage('Acquiring high-accuracy Kigali GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setClientPosition({ lat, lng });
        setIsSharingLocation(true);
        setStatusMessage('Broadcasting Live GPS across Kigali Grid');

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15);
          updateUserPinMarker(lat, lng, mapInstanceRef.current);
        }

        // Broadcast to Socket.io
        if (socketRef.current) {
          socketRef.current.emit(
            activeTabMode === 'rider' ? 'driver-location-update' : 'client-location-update',
            {
              lat,
              lng,
              driverName: activeTabMode === 'rider' ? 'Active Verified Pilot' : undefined,
              clientName: activeTabMode === 'client' ? 'Live Passenger' : undefined,
              landmark: 'Live GPS Pin',
              bikePlate: 'RAC 412B',
            }
          );
        }
      },
      (err) => {
        console.warn('Geolocation fallback to downtown Kigali:', err.message);
        // Fallback to Downtown Kigali
        const fallbackLat = -1.9536;
        const fallbackLng = 30.0934;
        setClientPosition({ lat: fallbackLat, lng: fallbackLng });
        setIsSharingLocation(true);
        setStatusMessage('GPS Permission denied; sharing default Kigali Convention Centre location');

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([fallbackLat, fallbackLng], 14);
          updateUserPinMarker(fallbackLat, fallbackLng, mapInstanceRef.current);
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Jump to specific landmark
  const handleJumpToLandmark = (spot: SearchableKigaliPlace) => {
    setSelectedLocationName(spot.name);
    setClientPosition({ lat: spot.lat, lng: spot.lng });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([spot.lat, spot.lng], 15);
      updateUserPinMarker(spot.lat, spot.lng, mapInstanceRef.current);
    }

    if (isSharingLocation && socketRef.current) {
      socketRef.current.emit(
        activeTabMode === 'rider' ? 'driver-location-update' : 'client-location-update',
        {
          lat: spot.lat,
          lng: spot.lng,
          landmark: spot.name,
          clientName: 'Live Passenger',
          bikePlate: 'RAC 412B',
        }
      );
    }
  };

  const handleConfirmLocation = () => {
    if (onSelectPickupLocation) {
      onSelectPickupLocation(
        selectedLocationName,
        clientPosition?.lat,
        clientPosition?.lng
      );
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="kigali-real-map-card"
        className="relative w-full max-w-5xl h-[92vh] max-h-[820px] bg-[#111c10] border border-[#34A853]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#d9e6d2]"
      >
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#34A853] via-[#9ed3aa] to-[#34A853] z-10" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#223521] bg-[#142313] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#34A853]/20 border border-[#34A853]/40 flex items-center justify-center text-[#34A853] shadow-inner shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>Kigali Free Live Map</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#34A853]/25 text-[#7de099] border border-[#34A853]/40 flex items-center gap-1">
                    <Radio className="w-2 h-2 text-[#34A853] animate-ping" />
                    LIVE GPS
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/40">
                    100% Free OpenStreetMap • No API Key Needed
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-[#9bb59a] hidden sm:block">
                Free open-source Rwandan navigation: live moto pilots, client location sharing, and real Kigali topography.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher: Client vs Rider */}
            <div className="flex bg-[#0d160c] p-1 rounded-xl border border-[#233522]">
              <button
                type="button"
                onClick={() => setActiveTabMode('client')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTabMode === 'client'
                    ? 'bg-[#34A853] text-white shadow'
                    : 'text-[#9ab798] hover:text-white'
                }`}
              >
                Client View
              </button>
              <button
                type="button"
                onClick={() => setActiveTabMode('rider')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTabMode === 'rider'
                    ? 'bg-[#2b663b] text-white shadow'
                    : 'text-[#9ab798] hover:text-white'
                }`}
              >
                Rider / Pilot View
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#1b2b1a] hover:bg-[#253e24] text-[#a1baa0] hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Status and Quick Control Ribbon */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#172716] border-b border-[#253924] flex flex-wrap items-center justify-between gap-3 text-xs z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse shrink-0" />
            <span className="text-[#a4cca2] font-medium">{statusMessage}</span>
            <span className="text-[#6d8a6b]">•</span>
            <span className="text-[#9ed3aa] font-bold">
              {activePilots.length} Pilots Online
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Free Standard OpenStreetMap Badge Only */}
            <div className="flex items-center gap-1.5 bg-[#0f190e] rounded-xl px-2.5 py-1 border border-[#233822] text-[10px] text-[#7de099] font-medium shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
              <span>Standard Free OpenStreetMap</span>
            </div>

            {/* Filter buttons */}
            <div className="flex bg-[#0f190e] rounded-xl p-0.5 border border-[#233822]">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  filterType === 'all' ? 'bg-[#253d23] text-white' : 'text-[#87a585]'
                }`}
              >
                All ({activePilots.length + activeClients.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('pilots')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  filterType === 'pilots' ? 'bg-[#253d23] text-white' : 'text-[#87a585]'
                }`}
              >
                🏍️ Pilots ({activePilots.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('clients')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  filterType === 'clients' ? 'bg-[#253d23] text-white' : 'text-[#87a585]'
                }`}
              >
                🙋 Clients ({activeClients.length})
              </button>
            </div>

            {/* Live Location Share Button */}
            <button
              type="button"
              onClick={handleToggleShareLocation}
              className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md text-xs cursor-pointer ${
                isSharingLocation
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-[#34A853] hover:bg-[#2c8d46] text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isSharingLocation ? 'Stop Sharing GPS' : 'Share My Live Location'}</span>
            </button>
          </div>
        </div>

        {/* Map Body Area */}
        <div className="relative flex-1 w-full bg-[#0a1209] overflow-hidden">
          {/* Leaflet Map Div */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Interactive Search & Pinpoint Bar (Type area or landmark to pinpoint for rider) */}
          <div className="absolute top-3 left-3 right-3 sm:left-4 sm:w-[420px] z-[600]">
            <form onSubmit={handleCustomSearchSubmit} className="relative">
              <div className="flex items-center bg-[#111e11]/95 backdrop-blur-md border border-[#34A853]/70 rounded-2xl shadow-2xl px-3.5 py-2.5 gap-2.5 focus-within:border-[#34A853] focus-within:ring-2 focus-within:ring-[#34A853]/30">
                <Search className="w-4 h-4 text-[#34A853] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Type Kigali area, landmark, or street to pinpoint..."
                  className="bg-transparent text-xs sm:text-sm text-white placeholder-[#7f9e7d] focus:outline-none w-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchDropdown(false);
                    }}
                    className="text-[#7f9e7d] hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isSearchingExternal}
                  className="px-3 py-1 bg-[#34A853] hover:bg-[#2c8d46] disabled:opacity-40 text-white text-[11px] font-bold rounded-xl transition-all shrink-0 cursor-pointer shadow flex items-center gap-1"
                >
                  {isSearchingExternal ? (
                    <span>Searching...</span>
                  ) : (
                    <>
                      <span>Pinpoint</span>
                      <Crosshair className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>

              {/* Autocomplete Dropdown List */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#122212]/95 backdrop-blur-md border border-[#2b4429] rounded-2xl shadow-2xl max-h-64 overflow-y-auto z-[700] p-1.5 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-[#86e29b] tracking-wider border-b border-[#233822] flex items-center justify-between">
                    <span>Kigali Search Suggestions</span>
                    <button
                      type="button"
                      onClick={() => setShowSearchDropdown(false)}
                      className="text-[#7f9e7d] hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {filteredPlaces.length > 0 ? (
                    filteredPlaces.slice(0, 8).map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => handleSelectSearchPlace(place)}
                        className="w-full text-left p-2 rounded-xl hover:bg-[#1f371f] transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#34A853] group-hover:scale-110 transition-transform shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-[#9ed3aa]">{place.name}</div>
                            <div className="text-[10px] text-[#86a884]">{place.sector} • {place.district}</div>
                          </div>
                        </div>
                        <span className="text-[9px] bg-[#1a2f1a] text-[#9ed3aa] px-2 py-0.5 rounded-full border border-[#2e4d2b]">
                          {place.type}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-[#86a884]">
                      Press <strong>Pinpoint</strong> or <strong>Enter</strong> to search &ldquo;{searchQuery}&rdquo; across Kigali streets.
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Floating Kigali Landmark Selector Carousel */}
          <div className="absolute top-16 left-3 right-3 z-[500] pointer-events-none">
            <div className="flex gap-2 overflow-x-auto pb-1 pointer-events-auto scrollbar-none">
              {KIGALI_SEARCHABLE_PLACES.slice(0, 10).map((spot, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchPlace(spot)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap backdrop-blur-md border transition-all cursor-pointer shadow-lg flex items-center gap-1.5 ${
                    selectedLocationName === spot.name
                      ? 'bg-[#34A853] text-white border-[#34A853]'
                      : 'bg-[#142314]/90 text-[#b5d5b3] border-[#294227] hover:bg-[#1c331c] hover:text-white'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-[#34A853]" />
                  <span>{spot.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pinpoint Notification Toast */}
          {pinpointFeedback && (
            <div className="absolute top-28 left-4 right-4 sm:left-6 sm:w-auto sm:max-w-md z-[550] bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 text-xs px-3.5 py-2 rounded-2xl shadow-xl flex items-center justify-between gap-2 backdrop-blur-md animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold">{pinpointFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setPinpointFeedback(null)}
                className="text-emerald-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Floating Selected Sector Card / Confirmation */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto z-[500] max-w-sm bg-[#132213]/95 backdrop-blur-md border border-[#34A853]/60 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#86e29b] flex items-center gap-1">
                  <span>Selected Ride Pickup Location</span>
                </div>
                <div className="text-sm font-bold text-white truncate">{selectedLocationName}</div>
                {clientPosition && (
                  <div className="text-[10px] text-[#93b791] font-mono">
                    GPS: {clientPosition.lat.toFixed(4)}, {clientPosition.lng.toFixed(4)}
                  </div>
                )}
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#34A853] animate-ping shrink-0" />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#233922]">
              <button
                type="button"
                onClick={handleConfirmLocation}
                className="flex-1 px-3 py-2 bg-[#34A853] hover:bg-[#2c8d46] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Location & Book Ride</span>
              </button>
              <button
                type="button"
                onClick={handleToggleShareLocation}
                title="Broadcast GPS to Riders"
                className="p-2 bg-[#1f331e] hover:bg-[#2a4529] text-[#9ed3aa] rounded-xl border border-[#304e2e] transition-colors cursor-pointer"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Free Map Attribution Badge */}
          <div className="absolute bottom-2 right-4 z-[500] hidden sm:flex items-center gap-2 bg-[#0c160b]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#233822] text-[10px] text-[#86a884]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{FREE_OSM_ATTRIBUTION}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
