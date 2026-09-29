import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BookRideModal } from './components/BookRideModal';
import { DeliveryModal } from './components/DeliveryModal';
import { PricingModal } from './components/PricingModal';
import { DriverJoinModal } from './components/DriverJoinModal';
import { LiveTrackerModal } from './components/LiveTrackerModal';
import { SmoothGuaranteeModal } from './components/SmoothGuaranteeModal';
import { AiVoiceDispatcherModal } from './components/AiVoiceDispatcherModal';
import { AiParcelScannerModal } from './components/AiParcelScannerModal';
import { AiTerrainFareModal } from './components/AiTerrainFareModal';
import { AiSafetyVerifierModal } from './components/AiSafetyVerifierModal';
import { KigaliMapModal } from './components/KigaliMapModal';
import { KigaliRealLiveMapModal } from './components/KigaliRealLiveMapModal';
import { MlEtaPredictorPillBadge } from './components/MlEtaPredictorPillBadge';
import { GuardianAngelModal } from './components/GuardianAngelModal';
import { CorporatePassModal } from './components/CorporatePassModal';
import { MomoUssdModal } from './components/MomoUssdModal';
import { KigaliRainRadarModal } from './components/KigaliRainRadarModal';
import { MultiStopDropModal } from './components/MultiStopDropModal';
import { RuraComplianceHubModal } from './components/RuraComplianceHubModal';
import { EbmReceiptModal } from './components/EbmReceiptModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { SupportChatModal, SupportChatFloatingButton } from './components/SupportChatModal';
import { SmsAlertSettingsModal } from './components/SmsAlertSettingsModal';
import { RiderPrivatePortal } from './components/RiderPrivatePortal';
import { DriverLoginModal } from './components/DriverLoginModal';
import { ClientPrivatePortal } from './components/ClientPrivatePortal';
import { ClientRegisterModal } from './components/ClientRegisterModal';
import { ClientLoginModal } from './components/ClientLoginModal';
import { AboutUsSection } from './components/AboutUsSection';
import { Footer } from './components/Footer';
import { ActiveTab, BookingState, DeliveryCategory, MultiStopWaypoint, DriverApplication, ClientAccount } from './types';
import { Bike, Package2, ShieldCheck, BellRing, Sparkles, PhoneCall, X, FileSpreadsheet } from 'lucide-react';
import { dispatchBookingSms } from './utils/smsNotifier';

export type TripPhase = 'Driver Assigned' | 'On the Way' | 'Arrived' | 'In Progress' | 'Completed';

// Dynamic CSS class mapping for Active Trip status badges and floating pill accents
export const TRIP_PHASE_CONFIG: Record<TripPhase, {
  badgeClass: string;
  pillBorderClass: string;
  dotClass: string;
  glowClass: string;
  subtext: string;
}> = {
  'Driver Assigned': {
    badgeClass: 'bg-amber-500/25 text-amber-300 border-amber-400/50 shadow-sm shadow-amber-500/20',
    pillBorderClass: 'border-amber-400/80',
    dotClass: 'bg-amber-400 animate-pulse',
    glowClass: 'shadow-[0_0_24px_rgba(245,158,11,0.3)]',
    subtext: 'Pilot Assigned • Helmets Ready',
  },
  'On the Way': {
    badgeClass: 'bg-sky-500/25 text-sky-300 border-sky-400/50 shadow-sm shadow-sky-500/20',
    pillBorderClass: 'border-sky-400/80',
    dotClass: 'bg-sky-400 animate-ping',
    glowClass: 'shadow-[0_0_24px_rgba(56,189,248,0.3)]',
    subtext: 'En Route • ETA ~2m',
  },
  'Arrived': {
    badgeClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50 shadow-sm shadow-emerald-500/20',
    pillBorderClass: 'border-emerald-400/80',
    dotClass: 'bg-emerald-400',
    glowClass: 'shadow-[0_0_24px_rgba(52,211,153,0.35)]',
    subtext: 'Arrived at Pickup Landmark',
  },
  'In Progress': {
    badgeClass: 'bg-purple-500/25 text-purple-300 border-purple-400/50 shadow-sm shadow-purple-500/20',
    pillBorderClass: 'border-purple-400/80',
    dotClass: 'bg-purple-400 animate-pulse',
    glowClass: 'shadow-[0_0_24px_rgba(168,85,247,0.3)]',
    subtext: 'Trip Underway • Live GPS',
  },
  'Completed': {
    badgeClass: 'bg-teal-500/25 text-teal-300 border-teal-400/50 shadow-sm shadow-teal-500/20',
    pillBorderClass: 'border-teal-400/80',
    dotClass: 'bg-teal-400',
    glowClass: 'shadow-[0_0_24px_rgba(20,184,166,0.3)]',
    subtext: 'Trip Completed • MoMo Paid',
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('rides');
  const [bookingType, setBookingType] = useState<'ride' | 'delivery' | null>(null);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [guaranteeModalOpen, setGuaranteeModalOpen] = useState(false);
  const [trackerModalOpen, setTrackerModalOpen] = useState(false);

  // New Innovation & AI Feature Modals State
  const [aiDispatchModalOpen, setAiDispatchModalOpen] = useState(false);
  const [parcelScannerModalOpen, setParcelScannerModalOpen] = useState(false);
  const [terrainFareModalOpen, setTerrainFareModalOpen] = useState(false);
  const [safetyVerifierModalOpen, setSafetyVerifierModalOpen] = useState(false);
  const [kigaliMapModalOpen, setKigaliMapModalOpen] = useState(false);
  const [guardianAngelModalOpen, setGuardianAngelModalOpen] = useState(false);
  const [corporatePassModalOpen, setCorporatePassModalOpen] = useState(false);
  const [momoUssdModalOpen, setMomoUssdModalOpen] = useState(false);

  // 5 New Supercharged Feature Modals State
  const [rainRadarModalOpen, setRainRadarModalOpen] = useState(false);
  const [multiStopModalOpen, setMultiStopModalOpen] = useState(false);
  const [ruraSafetyModalOpen, setRuraSafetyModalOpen] = useState(false);
  const [ebmReceiptModalOpen, setEbmReceiptModalOpen] = useState(false);

  // Google Sheets Workspace Hub Modal State
  const [googleSheetsModalOpen, setGoogleSheetsModalOpen] = useState(false);

  // SMS Alert Settings Modal State
  const [smsAlertSettingsModalOpen, setSmsAlertSettingsModalOpen] = useState(false);

  // Active Trip Phase State for Dynamic Floating Pill Badge
  const [tripPhase, setTripPhase] = useState<TripPhase>('Driver Assigned');

  // Client Support Chat Modal State
  const [supportChatOpen, setSupportChatOpen] = useState(false);

  // Rider/Pilot Private Portal State
  const [pilotPortalOpen, setPilotPortalOpen] = useState(false);
  const [pilotLoginOpen, setPilotLoginOpen] = useState(false);
  const [pilotProfile, setPilotProfile] = useState<DriverApplication | null>(null);
  const [isPilotLoggedIn, setIsPilotLoggedIn] = useState(false);

  // Client (Passenger / Enterprise) Private Portal State
  const [clientPortalOpen, setClientPortalOpen] = useState(false);
  const [clientRegisterOpen, setClientRegisterOpen] = useState(false);
  const [clientLoginOpen, setClientLoginOpen] = useState(false);
  const [clientProfile, setClientProfile] = useState<ClientAccount | null>(null);
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);

  const [activeBooking, setActiveBooking] = useState<BookingState | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to trigger auto-dismissing toast notifications that clear after few seconds
  const showToast = useCallback((message: string, durationMs: number = 3200) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastNotification(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastNotification(null);
      toastTimeoutRef.current = null;
    }, durationMs);
  }, []);

  // Clean up any active timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Lock background scrolling and reduce background rendering overhead when modals/portals are open
  useEffect(() => {
    const isAnyModalOpen = !!(
      clientPortalOpen ||
      pilotPortalOpen ||
      bookingType ||
      driverModalOpen ||
      pricingModalOpen ||
      guaranteeModalOpen ||
      trackerModalOpen ||
      pilotLoginOpen ||
      clientLoginOpen ||
      clientRegisterOpen ||
      supportChatOpen ||
      aiDispatchModalOpen ||
      parcelScannerModalOpen ||
      terrainFareModalOpen ||
      safetyVerifierModalOpen ||
      kigaliMapModalOpen ||
      guardianAngelModalOpen ||
      corporatePassModalOpen ||
      momoUssdModalOpen ||
      rainRadarModalOpen ||
      multiStopModalOpen ||
      ruraSafetyModalOpen ||
      ebmReceiptModalOpen ||
      googleSheetsModalOpen ||
      smsAlertSettingsModalOpen
    );

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [
    clientPortalOpen,
    pilotPortalOpen,
    bookingType,
    driverModalOpen,
    pricingModalOpen,
    guaranteeModalOpen,
    trackerModalOpen,
    pilotLoginOpen,
    clientLoginOpen,
    clientRegisterOpen,
    supportChatOpen,
    aiDispatchModalOpen,
    parcelScannerModalOpen,
    terrainFareModalOpen,
    safetyVerifierModalOpen,
    kigaliMapModalOpen,
    guardianAngelModalOpen,
    corporatePassModalOpen,
    momoUssdModalOpen,
    rainRadarModalOpen,
    multiStopModalOpen,
    ruraSafetyModalOpen,
    ebmReceiptModalOpen,
    googleSheetsModalOpen,
    smsAlertSettingsModalOpen
  ]);

  // Dynamic trip phase progression simulator for Active Trip floating badge
  useEffect(() => {
    if (!activeBooking) return;

    // Set initial phase
    if (activeBooking.status === 'driver_arriving') {
      setTripPhase('On the Way');
    } else if (activeBooking.status === 'in_progress') {
      setTripPhase('Arrived');
    } else if (activeBooking.status === 'completed') {
      setTripPhase('Completed');
    } else {
      setTripPhase('Driver Assigned');
    }

    // Real-time progression timing for dispatch phase updates
    const t1 = setTimeout(() => {
      setTripPhase((curr) => (curr === 'Driver Assigned' ? 'On the Way' : curr));
    }, 6000);

    const t2 = setTimeout(() => {
      setTripPhase((curr) => (curr === 'On the Way' ? 'Arrived' : curr));
    }, 14000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeBooking]);

  // Load saved booking, pilot profile, and client profile from local storage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jd_smooth_active_booking');
      if (saved) {
        setActiveBooking(JSON.parse(saved));
      }
      const savedPilot = localStorage.getItem('jd_smooth_pilot_profile');
      if (savedPilot) {
        setPilotProfile(JSON.parse(savedPilot));
        const sessionActive = localStorage.getItem('jd_smooth_pilot_session');
        if (sessionActive === 'true') {
          setIsPilotLoggedIn(true);
        }
      }
      const savedClient = localStorage.getItem('jd_smooth_client_profile');
      if (savedClient) {
        setClientProfile(JSON.parse(savedClient));
        const clientSessionActive = localStorage.getItem('jd_smooth_client_session');
        if (clientSessionActive === 'true') {
          setIsClientLoggedIn(true);
        }
      }
    } catch (e) {
      console.warn('Failed to load local state', e);
    }
  }, []);

  // Client Portal Handlers
  const handleClientAccountCreated = (client: ClientAccount) => {
    setClientProfile(client);
    setIsClientLoggedIn(true);
    try {
      localStorage.setItem('jd_smooth_client_session', 'true');
    } catch (e) {}
    showToast(`Account Created! Murakoze, ${client.fullName}. Entering your Private Client Portal...`, 3000);
    setClientRegisterOpen(false);
    setTimeout(() => {
      setClientPortalOpen(true);
    }, 400);
  };

  const handleClientLogin = (client: ClientAccount) => {
    setClientProfile(client);
    setIsClientLoggedIn(true);
    try {
      localStorage.setItem('jd_smooth_client_session', 'true');
    } catch (e) {}
    showToast(`Welcome back, ${client.fullName}! Opened your Private Client Portal.`, 3000);
    setClientLoginOpen(false);
    setClientPortalOpen(true);
  };

  const handleClientLogout = () => {
    setIsClientLoggedIn(false);
    setClientPortalOpen(false);
    try {
      localStorage.setItem('jd_smooth_client_session', 'false');
    } catch (e) {}
    showToast('Logged out of Client Portal. You can access it anytime.', 3000);
  };

  const handleRiderAccountCreated = (data: DriverApplication) => {
    setPilotProfile(data);
    setIsPilotLoggedIn(true);
    try {
      localStorage.setItem('jd_smooth_pilot_session', 'true');
    } catch (e) {}
    // Show brief toast for 3 seconds then automatically dismiss
    showToast(`Account Created! Murakoze, ${data.fullName}. Entering your Private Pilot Portal...`, 3000);
    setTimeout(() => {
      setDriverModalOpen(false);
      setPilotPortalOpen(true);
    }, 450);
  };

  const handlePilotLogin = (pilot: DriverApplication) => {
    setPilotProfile(pilot);
    setIsPilotLoggedIn(true);
    try {
      localStorage.setItem('jd_smooth_pilot_session', 'true');
    } catch (e) {}
    showToast(`Welcome back, ${pilot.fullName}! Opened your Private Pilot Portal.`, 3000);
    setPilotLoginOpen(false);
    setPilotPortalOpen(true);
  };

  const handlePilotLogout = () => {
    setIsPilotLoggedIn(false);
    setPilotPortalOpen(false);
    try {
      localStorage.setItem('jd_smooth_pilot_session', 'false');
    } catch (e) {}
    showToast('Logged out of Pilot Portal. You can log back in easily anytime.', 3200);
    setTimeout(() => {
      setPilotLoginOpen(true);
    }, 350);
  };

  const handleBookingConfirmed = (booking: BookingState) => {
    setActiveBooking(booking);
    try {
      localStorage.setItem('jd_smooth_active_booking', JSON.stringify(booking));
    } catch (e) {}

    // Dispatch automated SMS alert to admin phone via httpSMS gateway
    dispatchBookingSms(booking).then((res) => {
      if (res.success) {
        console.log(`[httpSMS] Booking alert dispatched to admin (${res.to || '+250796569416'})`);
      } else if (res.configured === false) {
        console.info('[httpSMS Info] SMS_API_KEY can be added in Settings > Secrets to enable live phone dispatch.');
      }
    }).catch((err) => {
      console.warn('[httpSMS Error] Failed to dispatch SMS alert:', err);
    });

    showToast(`Rider Assigned! ${booking.driver?.name} is on the way with sanitized helmets. Automated SMS alert dispatched to admin.`, 5000);

    // Open live tracker immediately for high satisfaction
    setTimeout(() => {
      setTrackerModalOpen(true);
    }, 400);
  };

  const handleCancelBooking = (bookingId: string) => {
    setActiveBooking(null);
    try {
      localStorage.removeItem('jd_smooth_active_booking');
    } catch (e) {}
    showToast('Ride booking cancelled successfully.', 3500);
  };

  // AI Dispatcher Handoff to Booking Modal
  const handleAiDispatchHandoff = (data: {
    type: 'ride' | 'delivery';
    pickup: string;
    dropoff: string;
    tier: string;
    estimatedFare: number;
    distanceKm: number;
    notes?: string;
  }) => {
    setBookingType(data.type);
    showToast(`AI Extracted Route: ${data.pickup} ➔ ${data.dropoff} (~${data.distanceKm}km)`, 4000);
  };

  // AI Parcel Scanner Handoff to Delivery Modal
  const handleParcelScannerHandoff = (data: {
    category: DeliveryCategory;
    dimensions: string;
    weightKg: number;
    notes: string;
  }) => {
    setBookingType('delivery');
    showToast(`Parcel Verified: ${data.dimensions}, ${data.weightKg}kg. Ready for moto pickup.`, 4000);
  };

  // Multi-Stop Route Handoff
  const handleMultiStopHandoff = (data: {
    pickup: string;
    waypoints: MultiStopWaypoint[];
    category: DeliveryCategory;
    totalDistanceKm: number;
    totalFareRwf: number;
    specialNotes: string;
  }) => {
    setBookingType('delivery');
    showToast(`Multi-Stop Courier Configured: ${data.waypoints.length} Drops across Kigali (~${data.totalDistanceKm}km, Direct Pilot Agreement)`, 4500);
  };

  // Kigali Map Sector Handoff
  const handleMapLocationSelect = (locationName: string) => {
    setBookingType('ride');
    showToast(`Selected Pickup Sector: ${locationName}`, 3500);
  };

  return (
    <div className="bg-[#0b160a] text-[#d9e6d2] min-h-screen relative flex flex-col font-sans selection:bg-[#9ed3aa] selection:text-[#02391c]">
      {/* Subtle Global Ambient Topographic Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(#9ed3aa 1px, transparent 1px), radial-gradient(#336443 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />
      <div 
        className="fixed top-0 left-1/3 w-[600px] h-[600px] rounded-full pointer-events-none z-0 opacity-25" 
        style={{ background: 'radial-gradient(circle, rgba(51, 100, 67, 0.4) 0%, transparent 70%)' }}
      />
      <div 
        className="fixed bottom-0 right-10 w-[500px] h-[500px] rounded-full pointer-events-none z-0 opacity-20" 
        style={{ background: 'radial-gradient(circle, rgba(158, 211, 170, 0.3) 0%, transparent 70%)' }}
      />

      {/* Toast Notification Banner */}
      {toastNotification && (
        <div 
          role="status"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-[92vw] sm:max-w-xl bg-[#182216]/95 backdrop-blur-md text-[#b9efc5] px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border border-[#9ed3aa] shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold transition-all duration-300"
        >
          <BellRing className="w-4 h-4 text-[#9ed3aa] shrink-0 animate-pulse" />
          <span className="truncate">{toastNotification}</span>
          <button
            type="button"
            onClick={() => {
              if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
              setToastNotification(null);
            }}
            className="ml-1 text-[#8b938a] hover:text-white p-0.5 rounded-full shrink-0 transition-colors"
            title="Dismiss notification"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Active Trip Pill if trip exists and modal is closed */}
      {activeBooking && !trackerModalOpen && (
        <div 
          onClick={() => setTrackerModalOpen(true)}
          className={`fixed bottom-6 right-6 z-[60] bg-[#142316]/95 hover:bg-[#1a2f1c] text-white px-5 py-3 rounded-full shadow-2xl border-2 cursor-pointer flex items-center gap-3.5 transition-all hover:scale-105 group backdrop-blur-md ${TRIP_PHASE_CONFIG[tripPhase]?.pillBorderClass || 'border-[#9ed3aa]'} ${TRIP_PHASE_CONFIG[tripPhase]?.glowClass || ''}`}
        >
          <div className="w-9 h-9 rounded-full bg-[#1b2b1d] flex items-center justify-center text-[#9ed3aa] relative shadow-inner shrink-0">
            <Bike className="w-4 h-4" />
            <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#142316] ${TRIP_PHASE_CONFIG[tripPhase]?.dotClass || 'bg-[#9ed3aa]'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#9ed3aa]">Active Trip</span>
              {/* Dynamic Status Badge changing color based on trip phase */}
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  const phases: TripPhase[] = ['Driver Assigned', 'On the Way', 'Arrived', 'In Progress', 'Completed'];
                  const nextIdx = (phases.indexOf(tripPhase) + 1) % phases.length;
                  setTripPhase(phases[nextIdx]);
                }}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${TRIP_PHASE_CONFIG[tripPhase]?.badgeClass || TRIP_PHASE_CONFIG['Driver Assigned'].badgeClass}`}
                title="Trip phase status (Click to cycle phase)"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${TRIP_PHASE_CONFIG[tripPhase]?.dotClass || 'bg-amber-400'}`} />
                {tripPhase}
              </span>

              {/* Machine Learning-based ETA Predictor Component */}
              <MlEtaPredictorPillBadge
                distanceKm={activeBooking.distanceKm || 3.5}
                initialTraffic="moderate"
                initialWeather="clear"
                pilotName={activeBooking.driver?.name}
              />
            </div>
            <div className="text-xs font-bold text-white group-hover:underline flex items-center gap-1.5">
              <span>{activeBooking.driver?.name?.split(' ')[0] || 'Pilot'}</span>
              <span className="text-[#8ba288]">•</span>
              <span>{activeBooking.driver?.plateNumber || 'RAC 412B'}</span>
              <span className="text-[#8ba288]">•</span>
              <span className="text-[#9ed3aa] text-[11px] font-medium">{TRIP_PHASE_CONFIG[tripPhase]?.subtext || 'ETA ~2m'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar with All Feature Handlers */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBooking={(type) => setBookingType(type)}
        onOpenDriverModal={() => setDriverModalOpen(true)}
        onOpenPricingModal={() => setPricingModalOpen(true)}
        onOpenGuaranteeModal={() => setGuaranteeModalOpen(true)}
        activeBooking={activeBooking}
        onOpenTracker={() => setTrackerModalOpen(true)}
        onOpenAiDispatch={() => setAiDispatchModalOpen(true)}
        onOpenParcelScanner={() => setParcelScannerModalOpen(true)}
        onOpenTerrainFare={() => setTerrainFareModalOpen(true)}
        onOpenKigaliMap={() => setKigaliMapModalOpen(true)}
        onOpenSafetyVerifier={() => setSafetyVerifierModalOpen(true)}
        onOpenCorporatePass={() => setCorporatePassModalOpen(true)}
        onOpenMomoUssd={() => setMomoUssdModalOpen(true)}
        onOpenGuardianAngel={() => setGuardianAngelModalOpen(true)}
        onOpenRainRadar={() => setRainRadarModalOpen(true)}
        onOpenMultiStop={() => setMultiStopModalOpen(true)}
        onOpenRuraSafety={() => setRuraSafetyModalOpen(true)}
        onOpenEbmReceipt={() => setEbmReceiptModalOpen(true)}
        onOpenGoogleSheets={() => setGoogleSheetsModalOpen(true)}
        onOpenSmsAlertSettings={() => setSmsAlertSettingsModalOpen(true)}
        onOpenPilotPortal={() => setPilotPortalOpen(true)}
        onOpenPilotLogin={() => setPilotLoginOpen(true)}
        hasPilotAccount={!!pilotProfile}
        isPilotLoggedIn={isPilotLoggedIn}
        onOpenClientPortal={() => setClientPortalOpen(true)}
        onOpenClientLogin={() => setClientLoginOpen(true)}
        onOpenClientRegister={() => setClientRegisterOpen(true)}
        hasClientAccount={!!clientProfile}
        isClientLoggedIn={isClientLoggedIn}
      />

      {/* Hero Section with Interactive AI Suite Ribbons */}
      <HeroSection
        onOpenBooking={(type) => setBookingType(type)}
        onOpenGuaranteeModal={() => setGuaranteeModalOpen(true)}
        onOpenPricingModal={() => setPricingModalOpen(true)}
        onOpenAiDispatch={() => setAiDispatchModalOpen(true)}
        onOpenParcelScanner={() => setParcelScannerModalOpen(true)}
        onOpenTerrainFare={() => setTerrainFareModalOpen(true)}
        onOpenKigaliMap={() => setKigaliMapModalOpen(true)}
        onOpenSafetyVerifier={() => setSafetyVerifierModalOpen(true)}
        onOpenCorporatePass={() => setCorporatePassModalOpen(true)}
        onOpenMomoUssd={() => setMomoUssdModalOpen(true)}
        onOpenGuardianAngel={() => setGuardianAngelModalOpen(true)}
        onOpenRainRadar={() => setRainRadarModalOpen(true)}
        onOpenMultiStop={() => setMultiStopModalOpen(true)}
        onOpenRuraSafety={() => setRuraSafetyModalOpen(true)}
        onOpenEbmReceipt={() => setEbmReceiptModalOpen(true)}
        isPaused={clientPortalOpen || pilotPortalOpen}
      />

      {/* About Us & Executive Leadership Section */}
      <AboutUsSection
        onOpenBooking={(type) => setBookingType(type)}
        onOpenGuaranteeModal={() => setGuaranteeModalOpen(true)}
      />

      {/* Modals & Workflows - Conditionally rendered for instant performance */}
      {bookingType === 'ride' && (
        <BookRideModal
          isOpen={true}
          onClose={() => setBookingType(null)}
          onBookingConfirmed={handleBookingConfirmed}
          onOpenKigaliMap={() => setKigaliMapModalOpen(true)}
        />
      )}

      {bookingType === 'delivery' && (
        <DeliveryModal
          isOpen={true}
          onClose={() => setBookingType(null)}
          onBookingConfirmed={handleBookingConfirmed}
        />
      )}

      {pricingModalOpen && (
        <PricingModal
          isOpen={true}
          onClose={() => setPricingModalOpen(false)}
          onSelectRouteForBooking={() => setBookingType('ride')}
        />
      )}

      {driverModalOpen && (
        <DriverJoinModal
          isOpen={true}
          onClose={() => setDriverModalOpen(false)}
          onAccountCreated={handleRiderAccountCreated}
          onSwitchToLogin={() => {
            setDriverModalOpen(false);
            setPilotLoginOpen(true);
          }}
        />
      )}

      {/* Driver / Pilot Login Modal */}
      {pilotLoginOpen && (
        <DriverLoginModal
          isOpen={true}
          onClose={() => setPilotLoginOpen(false)}
          onLoginSuccess={handlePilotLogin}
          onSwitchToRegister={() => {
            setPilotLoginOpen(false);
            setDriverModalOpen(true);
          }}
        />
      )}

      {/* Rider / Pilot Private Portal (Post Account Creation) */}
      {pilotPortalOpen && (
        <RiderPrivatePortal
          isOpen={true}
          onClose={() => setPilotPortalOpen(false)}
          onLogout={handlePilotLogout}
          pilotData={pilotProfile}
        />
      )}

      {/* Client Private Portal (Kigali VIP Passenger Operations) */}
      {clientPortalOpen && (
        <ClientPrivatePortal
          isOpen={true}
          onClose={() => setClientPortalOpen(false)}
          onLogout={handleClientLogout}
          clientData={clientProfile}
          onOpenBookingTab={(type) => setBookingType(type)}
          onOpenEbmModal={() => setEbmReceiptModalOpen(true)}
          onOpenRuraSafetyModal={() => setRuraSafetyModalOpen(true)}
        />
      )}

      {/* Client Registration Modal */}
      {clientRegisterOpen && (
        <ClientRegisterModal
          isOpen={true}
          onClose={() => setClientRegisterOpen(false)}
          onAccountCreated={handleClientAccountCreated}
          onSwitchToLogin={() => {
            setClientRegisterOpen(false);
            setClientLoginOpen(true);
          }}
        />
      )}

      {/* Client Login Modal */}
      {clientLoginOpen && (
        <ClientLoginModal
          isOpen={true}
          onClose={() => setClientLoginOpen(false)}
          onLoginSuccess={handleClientLogin}
          onSwitchToRegister={() => {
            setClientLoginOpen(false);
            setClientRegisterOpen(true);
          }}
        />
      )}

      {trackerModalOpen && (
        <LiveTrackerModal
          isOpen={true}
          onClose={() => setTrackerModalOpen(false)}
          booking={activeBooking}
          onCancelBooking={handleCancelBooking}
          onOpenKigaliMap={() => setKigaliMapModalOpen(true)}
        />
      )}

      {guaranteeModalOpen && (
        <SmoothGuaranteeModal
          isOpen={true}
          onClose={() => setGuaranteeModalOpen(false)}
          onBookRide={() => setBookingType('ride')}
        />
      )}

      {/* AI & Feature Modals */}
      {aiDispatchModalOpen && (
        <AiVoiceDispatcherModal
          isOpen={true}
          onClose={() => setAiDispatchModalOpen(false)}
          onProceedToBooking={handleAiDispatchHandoff}
        />
      )}

      {parcelScannerModalOpen && (
        <AiParcelScannerModal
          isOpen={true}
          onClose={() => setParcelScannerModalOpen(false)}
          onProceedToDelivery={handleParcelScannerHandoff}
        />
      )}

      {terrainFareModalOpen && (
        <AiTerrainFareModal
          isOpen={true}
          onClose={() => setTerrainFareModalOpen(false)}
          onBookWithRoute={(pickup, dropoff) => {
            setBookingType('ride');
            setToastNotification(`Selected Terrain Route: ${pickup} ➔ ${dropoff}`);
          }}
        />
      )}

      {safetyVerifierModalOpen && (
        <AiSafetyVerifierModal
          isOpen={true}
          onClose={() => setSafetyVerifierModalOpen(false)}
        />
      )}

      {kigaliMapModalOpen && (
        <KigaliRealLiveMapModal
          isOpen={true}
          onClose={() => setKigaliMapModalOpen(false)}
          onSelectPickupLocation={(loc) => handleMapLocationSelect(loc)}
          userRole={isPilotLoggedIn ? 'rider' : 'client'}
        />
      )}

      {guardianAngelModalOpen && (
        <GuardianAngelModal
          isOpen={true}
          onClose={() => setGuardianAngelModalOpen(false)}
          booking={activeBooking}
        />
      )}

      {corporatePassModalOpen && (
        <CorporatePassModal
          isOpen={true}
          onClose={() => setCorporatePassModalOpen(false)}
        />
      )}

      {momoUssdModalOpen && (
        <MomoUssdModal
          isOpen={true}
          onClose={() => setMomoUssdModalOpen(false)}
          fareRwf={activeBooking ? activeBooking.fareRwf : 1500}
          riderName={activeBooking?.driver?.name || 'Jean-Damascene Mugisha'}
          plateNumber={activeBooking?.driver?.plateNumber || 'RAC 412B'}
        />
      )}

      {/* 5 Supercharged 2026 Innovation Modals */}
      {rainRadarModalOpen && (
        <KigaliRainRadarModal
          isOpen={true}
          onClose={() => setRainRadarModalOpen(false)}
          onBookRainSafeRide={() => setBookingType('ride')}
        />
      )}

      {multiStopModalOpen && (
        <MultiStopDropModal
          isOpen={true}
          onClose={() => setMultiStopModalOpen(false)}
          onProceedWithMultiStop={handleMultiStopHandoff}
        />
      )}

      {ruraSafetyModalOpen && (
        <RuraComplianceHubModal
          isOpen={true}
          onClose={() => setRuraSafetyModalOpen(false)}
        />
      )}

      {ebmReceiptModalOpen && (
        <EbmReceiptModal
          isOpen={true}
          onClose={() => setEbmReceiptModalOpen(false)}
          booking={activeBooking}
        />
      )}

      {/* Google Sheets Workspace Hub Modal */}
      {googleSheetsModalOpen && (
        <GoogleSheetsModal
          isOpen={true}
          onClose={() => setGoogleSheetsModalOpen(false)}
          activeBooking={activeBooking}
          pilotProfile={pilotProfile}
          clientProfile={clientProfile}
          onNotify={(msg) => showToast(msg, 4000)}
        />
      )}

      {/* Floating Support Chat System (AI + Human Direct-to-SMS Dispatch) */}
      <SupportChatFloatingButton
        isOpen={supportChatOpen}
        onClick={() => setSupportChatOpen(true)}
      />

      {supportChatOpen && (
        <SupportChatModal
          isOpen={true}
          onClose={() => setSupportChatOpen(false)}
          onOpenRideBooking={() => {
            setSupportChatOpen(false);
            setBookingType('ride');
          }}
          onOpenDeliveryBooking={() => {
            setSupportChatOpen(false);
            setBookingType('delivery');
          }}
          onOpenSmsAlertSettings={() => setSmsAlertSettingsModalOpen(true)}
          userPhone={activeBooking?.phone || clientProfile?.phone || ''}
          userName={activeBooking?.passengerName || clientProfile?.fullName || ''}
        />
      )}

      {/* SMS Alert Settings & API Controls Modal */}
      {smsAlertSettingsModalOpen && (
        <SmsAlertSettingsModal
          isOpen={true}
          onClose={() => setSmsAlertSettingsModalOpen(false)}
          onNotify={(msg) => showToast(msg, 4000)}
        />
      )}

      {/* Footer */}
      <Footer
        onOpenGuarantee={() => setGuaranteeModalOpen(true)}
        onOpenDriverModal={() => setDriverModalOpen(true)}
        onOpenPricing={() => setPricingModalOpen(true)}
        onOpenAiDispatch={() => setAiDispatchModalOpen(true)}
        onOpenParcelScanner={() => setParcelScannerModalOpen(true)}
        onOpenTerrainFare={() => setTerrainFareModalOpen(true)}
        onOpenKigaliMap={() => setKigaliMapModalOpen(true)}
        onOpenSafetyVerifier={() => setSafetyVerifierModalOpen(true)}
        onOpenCorporatePass={() => setCorporatePassModalOpen(true)}
        onOpenRainRadar={() => setRainRadarModalOpen(true)}
        onOpenMultiStop={() => setMultiStopModalOpen(true)}
        onOpenRuraSafety={() => setRuraSafetyModalOpen(true)}
        onOpenEbmReceipt={() => setEbmReceiptModalOpen(true)}
        onOpenSmsAlertSettings={() => setSmsAlertSettingsModalOpen(true)}
      />
    </div>
  );
}
