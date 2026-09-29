import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  LogOut, 
  Menu, 
  X, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  RefreshCw, 
  ExternalLink,
  Zap,
  Bike,
  Package,
  Activity,
  MessageSquare,
  Send,
  Star,
  Phone,
  Search,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { ClientAccount, RiderProfile, DirectChatMessage } from '../types';
import { getStoredRiders, getSelectedRider, setSelectedRider } from '../utils/riderDirectory';
import { getSocket, playNotificationChime } from '../utils/directChat';
import { RiderClientChatModal } from './RiderClientChatModal';

interface ClientPrivatePortalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  clientData?: ClientAccount | null;
  onOpenBookingTab?: (type: 'ride' | 'delivery') => void;
  onOpenEbmModal?: () => void;
  onOpenRuraSafetyModal?: () => void;
}

export const ClientPrivatePortal: React.FC<ClientPrivatePortalProps> = ({
  isOpen,
  onClose,
  onLogout,
  clientData,
  onOpenBookingTab,
  onOpenEbmModal,
  onOpenRuraSafetyModal,
}) => {
  // Client state with real data fallback
  const [clientName, setClientName] = useState(clientData?.fullName || 'Verified Passenger');
  const [clientPhone, setClientPhone] = useState(clientData?.phone || '');
  const [clientEmail, setClientEmail] = useState(clientData?.email || '');
  const [momoNumber, setMomoNumber] = useState(clientData?.momoNumber || '');
  const [momoHolder, setMomoHolder] = useState(clientData?.fullName || 'Verified Passenger');
  const [accountType, setAccountType] = useState(clientData?.accountType || 'vip_concierge');
  const [pingState, setPingState] = useState<'verified' | 'pinging' | 'success'>('verified');

  // Active navigation tab
  const [activeNav, setActiveNav] = useState<'console' | 'riders' | 'trips' | 'wallet' | 'safety' | 'profile'>('console');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Verified Riders Directory & Direct Chat State
  const [ridersList, setRidersList] = useState<RiderProfile[]>(() => getStoredRiders());
  const [selectedRiderState, setSelectedRiderState] = useState<RiderProfile | null>(() => getSelectedRider());
  const [riderSearch, setRiderSearch] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [targetChatRider, setTargetChatRider] = useState<RiderProfile | null>(null);
  const [incomingRiderMessage, setIncomingRiderMessage] = useState<DirectChatMessage | null>(null);

  // Active Kigali Sectors
  const [activeSectors, setActiveSectors] = useState<{ [key: string]: boolean }>({
    gasabo: true,
    nyarugenge: true,
    kicukiro: false,
    remera: true,
  });

  // Quick Dispatch state
  const [dispatchPickup, setDispatchPickup] = useState('Kigali Heights, Kimihurura');
  const [dispatchDropoff, setDispatchDropoff] = useState('BK Arena, Remera');
  const [dispatchTier, setDispatchTier] = useState<'standard' | 'express' | 'vip_tour'>('express');
  const [dispatchNotes, setDispatchNotes] = useState('Clean sanitized helmet requested. Light luggage.');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchConfirmed, setDispatchConfirmed] = useState(false);

  // Sync state when clientData changes
  useEffect(() => {
    if (clientData) {
      if (clientData.fullName) {
        setClientName(clientData.fullName);
        setMomoHolder(clientData.fullName);
      }
      if (clientData.phone) setClientPhone(clientData.phone);
      if (clientData.email) setClientEmail(clientData.email);
      if (clientData.momoNumber) setMomoNumber(clientData.momoNumber);
      if (clientData.accountType) setAccountType(clientData.accountType);
    }
  }, [clientData]);

  // Synchronize Rider Directory and Listen for Live Rider Messages
  useEffect(() => {
    if (!isOpen) return;

    setRidersList(getStoredRiders());
    setSelectedRiderState(getSelectedRider());

    const handleRidersUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<RiderProfile[]>;
      if (customEvent.detail) {
        setRidersList(customEvent.detail);
      } else {
        setRidersList(getStoredRiders());
      }
      setSelectedRiderState(getSelectedRider());
    };
    window.addEventListener('jd_riders_updated', handleRidersUpdated);

    const handleSelectedRiderChange = () => {
      setSelectedRiderState(getSelectedRider());
    };
    window.addEventListener('jd_selected_rider_changed', handleSelectedRiderChange);

    const socket = getSocket();

    const handleRiderProfileChange = () => {
      setRidersList(getStoredRiders());
      setSelectedRiderState(getSelectedRider());
    };
    socket.on('rider-profile-changed', handleRiderProfileChange);

    const handleIncomingMessage = (msg: DirectChatMessage) => {
      if (msg.sender === 'rider') {
        setIncomingRiderMessage(msg);
        playNotificationChime();
      }
    };
    socket.on('direct-message-received', handleIncomingMessage);

    const handleLocalMessage = (e: Event) => {
      const customEvent = e as CustomEvent<DirectChatMessage>;
      if (customEvent.detail && customEvent.detail.sender === 'rider') {
        setIncomingRiderMessage(customEvent.detail);
        playNotificationChime();
      }
    };
    window.addEventListener('jd_new_direct_message', handleLocalMessage);

    return () => {
      window.removeEventListener('jd_riders_updated', handleRidersUpdated);
      window.removeEventListener('jd_selected_rider_changed', handleSelectedRiderChange);
      window.removeEventListener('jd_new_direct_message', handleLocalMessage);
      socket.off('rider-profile-changed', handleRiderProfileChange);
      socket.off('direct-message-received', handleIncomingMessage);
    };
  }, [isOpen]);

  // Auto-dismiss popup after 10s
  useEffect(() => {
    if (!incomingRiderMessage) return;
    const timer = setTimeout(() => {
      setIncomingRiderMessage(null);
    }, 10000);
    return () => clearTimeout(timer);
  }, [incomingRiderMessage]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectRiderForPickup = (rider: RiderProfile) => {
    setSelectedRider(rider);
    setSelectedRiderState(rider);
    const socket = getSocket();
    socket.emit('select-rider-for-pickup', {
      clientId: clientPhone || clientName,
      clientName,
      riderId: rider.id,
      riderName: rider.name,
      bikePlate: rider.bikePlate,
      momoNumber: rider.momoNumber || rider.phone,
    });
    showToast(`✅ Selected ${rider.name} (${rider.bikePlate}) for pickup! MoMo: ${rider.momoNumber || rider.phone}`);
  };

  const handleOpenChatWithRider = (rider: RiderProfile) => {
    setTargetChatRider(rider);
    setIncomingRiderMessage(null);
    setIsChatModalOpen(true);
  };

  const handleTestPing = () => {
    setPingState('pinging');
    setTimeout(() => {
      setPingState('success');
      showToast('MTN MoMo Direct Pay verified: Direct settlement to your pilot.');
    }, 900);
  };

  const toggleSector = (sectorKey: string) => {
    setActiveSectors((prev) => ({
      ...prev,
      [sectorKey]: !prev[sectorKey],
    }));
  };

  const handleInstantDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatchConfirmed(true);
      showToast('⚡ Moto Concierge Dispatched! Estimated arrival: 3-5 mins at ' + dispatchPickup);
      setTimeout(() => {
        setDispatchConfirmed(false);
        if (onOpenBookingTab) {
          onOpenBookingTab('ride');
          onClose();
        }
      }, 1200);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-[#0b160a]/90 text-[#d9e6d2] overflow-y-auto antialiased font-sans flex flex-col selection:bg-[#9ed3aa] selection:text-[#02391c]">
      {/* Optimized Viewport-Locked Ambient Video & City Backdrop Layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 transform-gpu">
        <video 
          poster="/hero-city-bg.jpg"
          autoPlay 
          loop 
          muted 
          playsInline 
          preload="metadata"
          className="w-full h-full object-cover opacity-35"
        >
          <source src="/hero-bg.webm" type="video/webm" />
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Dark Emerald Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b160a]/90 via-[#0b160a]/75 to-[#0b160a]/95" />
      </div>

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#142318] border border-[#9ed3aa] text-[#b9efc5] px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-[#9ed3aa] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* ASIDE SIDEBAR (Fixed Desktop & Smooth Responsive Mobile) */}
      <aside 
        className={`fixed left-0 top-0 h-full w-72 bg-[#121e17]/95 backdrop-blur-md z-50 flex flex-col justify-between shadow-2xl border-r border-white/10 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Brand Header */}
          <div className="h-20 flex items-center justify-between px-6 bg-black/30 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#336443] text-[#9ed3aa] shadow-inner">
                <span className="material-symbols-outlined text-2xl">person</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-[#d9e6d2]">J &amp; D CLIENT</span>
                  <span className="h-2 w-2 rounded-full bg-[#9ed3aa] animate-pulse"></span>
                </div>
                <span className="text-xs uppercase tracking-widest text-[#9ed3aa] font-semibold">Kigali VIP Hub</span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-[#c1c9bf] hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Client Status Card */}
          <div className="px-6 py-4">
            <div className="p-3 rounded-xl bg-[#18261e] border border-white/10 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#9ed3aa] ring-4 ring-[#9ed3aa]/20"></div>
                <span className="text-xs uppercase text-[#d9e6d2] tracking-wider font-semibold">
                  VIP Passenger (Active)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#336443] text-[#a9dfb5] text-xs font-semibold">
                Verified
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="px-4 py-2">
            <nav className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveNav('console');
                  setMobileSidebarOpen(false);
                  showToast('VIP Passenger Hub: Complete Kigali operations overview.');
                }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group text-left cursor-pointer ${
                  activeNav === 'console'
                    ? 'bg-[#336443] text-[#a9dfb5] font-semibold shadow-sm border border-[#9ed3aa]/30'
                    : 'text-[#c1c9bf] hover:bg-[#1a281f] hover:text-[#d9e6d2]'
                }`}
              >
                <span className="material-symbols-outlined text-[#8b938a] group-hover:text-[#9ed3aa] transition-colors">
                  speed
                </span>
                <span className="text-sm">VIP Passenger Hub</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNav('riders');
                  setMobileSidebarOpen(false);
                  showToast('Verified Kigali Pilots: View profiles, check MoMo numbers, and text riders.');
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group text-left cursor-pointer ${
                  activeNav === 'riders'
                    ? 'bg-[#336443] text-[#a9dfb5] font-semibold shadow-sm border border-[#9ed3aa]/30'
                    : 'text-[#c1c9bf] hover:bg-[#1a281f] hover:text-[#d9e6d2]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Bike className="w-5 h-5 text-[#8b938a] group-hover:text-[#9ed3aa] transition-colors" />
                  <span className="text-sm">Verified Riders</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#34A853]/25 text-[#7de099] font-bold border border-[#34A853]/40">
                  {ridersList.length} Online
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNav('trips');
                  setMobileSidebarOpen(false);
                  showToast('Trip History: 18 verified Kigali rides & EBM receipts.');
                }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group text-left cursor-pointer ${
                  activeNav === 'trips'
                    ? 'bg-[#336443] text-[#a9dfb5] font-semibold shadow-sm border border-[#9ed3aa]/30'
                    : 'text-[#c1c9bf] hover:bg-[#1a281f] hover:text-[#d9e6d2]'
                }`}
              >
                <span className="material-symbols-outlined text-[#8b938a] group-hover:text-[#9ed3aa] transition-colors">
                  alt_route
                </span>
                <span className="text-sm">Active &amp; Past Rides</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNav('wallet');
                  setMobileSidebarOpen(false);
                  showToast('MoMo Wallet: Pay directly to your selected pilot\'s personal MoMo wallet.');
                }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group text-left cursor-pointer ${
                  activeNav === 'wallet'
                    ? 'bg-[#336443] text-[#a9dfb5] font-semibold shadow-sm border border-[#9ed3aa]/30'
                    : 'text-[#c1c9bf] hover:bg-[#1a281f] hover:text-[#d9e6d2]'
                }`}
              >
                <span className="material-symbols-outlined text-[#8b938a] group-hover:text-[#9ed3aa] transition-colors">
                  payments
                </span>
                <span className="text-sm">MoMo &amp; Invoices</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNav('safety');
                  setMobileSidebarOpen(false);
                  showToast('Safety Hub: RURA certified sanitized helmets active.');
                }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group text-left cursor-pointer ${
                  activeNav === 'safety'
                    ? 'bg-[#336443] text-[#a9dfb5] font-semibold shadow-sm border border-[#9ed3aa]/30'
                    : 'text-[#c1c9bf] hover:bg-[#1a281f] hover:text-[#d9e6d2]'
                }`}
              >
                <span className="material-symbols-outlined text-[#8b938a] group-hover:text-[#9ed3aa] transition-colors">
                  verified_user
                </span>
                <span className="text-sm">Safety &amp; RURA Hub</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNav('profile');
                  setMobileSidebarOpen(false);
                  showToast('Profile & Sectors: Kigali patrol preferences.');
                }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group text-left cursor-pointer ${
                  activeNav === 'profile'
                    ? 'bg-[#336443] text-[#a9dfb5] font-semibold shadow-sm border border-[#9ed3aa]/30'
                    : 'text-[#c1c9bf] hover:bg-[#1a281f] hover:text-[#d9e6d2]'
                }`}
              >
                <span className="material-symbols-outlined text-[#8b938a] group-hover:text-[#9ed3aa] transition-colors">
                  badge
                </span>
                <span className="text-sm">Profile &amp; Sectors</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Priority Zone Widget & Logout */}
        <div>
          <div className="p-4 mx-4 mb-3 rounded-2xl bg-[#18261e] border border-white/10 flex flex-col gap-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#c1c9bf] uppercase tracking-wider font-semibold">Priority Zone</span>
              <span className="text-xs text-[#9ed3aa] font-semibold">Zone Alpha</span>
            </div>
            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#9ed3aa] h-full rounded-full w-full"></div>
            </div>
            <span className="text-[11px] text-[#8b938a]">Gasabo • Nyarugenge • Kicukiro Direct</span>
          </div>

          {/* Client Account & Logout Bar */}
          <div className="mx-4 mb-6 p-3 rounded-2xl bg-[#18261e] border border-white/15 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#336443] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#9ed3aa]/40">
                {clientName.charAt(0) || 'C'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-[#d9e6d2] truncate">{clientName}</span>
                <span className="text-[10px] text-[#9ed3aa] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9ed3aa] animate-pulse" />
                  <span>VIP Active</span>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onLogout) onLogout();
                else onClose();
              }}
              className="p-1.5 rounded-lg bg-[#2b1616]/80 hover:bg-[#421d1d] text-red-400 hover:text-red-200 transition-colors shrink-0 border border-red-500/20"
              title="Log Out of Client Account"
              aria-label="Log Out of Client Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen">
        {/* HEADER BAR (Smooth & Responsive) */}
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-[#121e17]/95 backdrop-blur-md z-40 shadow-md border-b border-white/10">
          <div className="h-20 w-full px-4 sm:px-8 md:px-12 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-[#1c2d22] border border-white/10 text-[#9ed3aa] shrink-0"
                aria-label="Open Client Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <div className="h-2.5 w-2.5 rounded-full bg-[#9ed3aa]"></div>
                <span className="text-sm sm:text-base font-bold tracking-tight text-[#d9e6d2] uppercase truncate">
                  J &amp; D SMOOTH RIDE
                </span>
              </div>

              <div className="hidden sm:flex items-center shrink-0">
                <span className="px-2.5 py-1 rounded-md bg-[#2b4e34]/80 text-[#98bf9e] text-xs font-semibold tracking-wider uppercase border border-[#9ed3aa]/20">
                  KIGALI CLIENT PORTAL
                </span>
              </div>

              <span className="hidden xl:inline text-[#414942]">/</span>
              <span className="hidden xl:inline text-xs sm:text-sm text-[#c1c9bf] truncate">
                {activeNav === 'console' && 'VIP Passenger Hub & Dispatch Desk'}
                {activeNav === 'riders' && 'Verified Kigali Moto Pilots & Instant Text'}
                {activeNav === 'trips' && 'Trip History & Live Bookings'}
                {activeNav === 'wallet' && 'Direct Rider MoMo & Digital Invoices'}
                {activeNav === 'safety' && 'RURA 2026 Safety & Hygiene Guarantee'}
                {activeNav === 'profile' && 'Passenger Identity & Preferred Sectors'}
              </span>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Return to Main Site Button */}
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1c2d22] hover:bg-[#253d2e] border border-white/10 text-xs text-[#c1c9bf] hover:text-white transition-all shadow-sm cursor-pointer"
                title="Return to Main Site"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-semibold">Exit Portal</span>
              </button>

              {/* Log Out Button */}
              <button
                type="button"
                onClick={() => {
                  if (onLogout) onLogout();
                  else onClose();
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#2b1616]/80 hover:bg-[#421d1d] border border-red-500/40 text-xs text-red-300 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Log Out of Client Account"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline font-semibold">Log Out</span>
              </button>

              <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

              {/* Client Avatar */}
              <div className="flex items-center gap-2 pl-1">
                <div className="flex flex-col text-right hidden md:block">
                  <span className="text-xs sm:text-sm font-semibold text-[#d9e6d2] leading-none truncate max-w-[140px]">
                    {clientName}
                  </span>
                  <span className="text-[10px] text-[#9ed3aa] leading-tight font-semibold mt-0.5">
                    VIP Concierge
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#336443] text-white flex items-center justify-center font-bold text-xs border border-[#9ed3aa]/40 shrink-0">
                  {clientName.charAt(0) || 'C'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="relative w-full pt-20 bg-transparent flex-1 pb-16">
          <div className="px-4 sm:px-8 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
            
            {/* Top Greeting & Status Card */}
            <div className="relative overflow-hidden rounded-3xl bg-[#142318]/90 border border-white/10 p-6 md:p-8 shadow-2xl">
              <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#9ed3aa]/5 blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#336443] text-[#a9dfb5] text-xs font-semibold uppercase tracking-wider border border-[#9ed3aa]/30">
                        Kigali VIP Passenger Network
                      </span>
                      <span className="text-[#414942] text-xs">•</span>
                      <span className="text-[#9ed3aa] text-xs flex items-center gap-1 font-semibold">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#9ed3aa] animate-ping"></span>
                        Priority Dispatch Active
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-semibold text-[#d9e6d2] tracking-tight">
                      Muraho, {clientName.split(' ')[0]}! Welcome to your Private Client Portal.
                    </h1>
                    <p className="text-sm sm:text-base text-[#c1c9bf] max-w-3xl leading-relaxed">
                      Fast-track moto-taxi bookings, sanitized dual helmets, digital tax invoices, and zero-fee direct MoMo payments to your pilot&apos;s own personal account.
                    </p>
                  </div>

                  {/* Quick Action Buttons Group */}
                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    {onOpenBookingTab && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenBookingTab('ride');
                          onClose();
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#9ed3aa] hover:bg-[#b0dfbb] text-[#02391c] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Book Moto Ride</span>
                      </button>
                    )}
                    {onOpenBookingTab && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenBookingTab('delivery');
                          onClose();
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#1c2d22] hover:bg-[#253d2e] text-white border border-white/10 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-[#9ed3aa]" />
                        <span>Send Parcel</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Badges Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#18261e] border border-white/10 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-[#9ed3aa] flex items-center justify-center text-[#02391c] shrink-0 font-bold">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-[#c1c9bf] uppercase tracking-wider font-semibold">Clean Safety</span>
                      <span className="text-sm font-medium text-[#d9e6d2] truncate">Dual Sanitized Helmets</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#18261e] border border-white/10 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-[#336443] text-[#a9dfb5] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-[#9ed3aa] font-semibold uppercase tracking-wider">Pilot MoMo Pay</span>
                      <span className="text-sm font-medium text-[#d9e6d2] truncate font-mono">
                        {selectedRiderState?.momoNumber || selectedRiderState?.phone || '0788 123 456'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#18261e] border border-white/10 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-[#336443] text-[#a9dfb5] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">support_agent</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-[#c1c9bf] uppercase tracking-wider font-semibold">24/7 Hotline</span>
                      <span className="text-sm font-medium text-[#d9e6d2] truncate font-mono">0796569416</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN TWO-COLUMN AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Operations, Forms & Details (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                
                {/* VIP Console Card: Selected Rider & Direct Text Button */}
                {activeNav === 'console' && selectedRiderState && (
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-[#172b1a] to-[#122215] border border-[#34A853]/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <img 
                          src={selectedRiderState.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'} 
                          alt={selectedRiderState.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-[#34A853]"
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#34A853] border-2 border-[#122215]" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#86e29b] flex items-center gap-1">
                          <Radio className="w-2.5 h-2.5 animate-ping text-[#34A853]" />
                          <span>Your Selected Pickup Pilot</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span>{selectedRiderState.name}</span>
                          <span className="text-xs text-[#9ed3aa] font-mono">({selectedRiderState.bikePlate})</span>
                        </h3>
                        <p className="text-xs text-[#85AB8B]">
                          Personal MoMo: <strong className="text-white font-mono">{selectedRiderState.momoNumber || selectedRiderState.phone}</strong> • {selectedRiderState.sector}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenChatWithRider(selectedRiderState)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-[#34A853] hover:bg-[#2c8d46] text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Text Pilot</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveNav('riders');
                          showToast('Select from verified Kigali moto pilots.');
                        }}
                        className="flex-1 sm:flex-none px-3 py-2 bg-[#1b2f1e] hover:bg-[#26442b] text-[#c1c9bf] hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors cursor-pointer"
                      >
                        Change Pilot
                      </button>
                    </div>
                  </div>
                )}

                {/* SECTION: Verified Kigali Moto Pilots Directory & Instant Direct Text */}
                {activeNav === 'riders' && (
                  <section className="p-6 md:p-8 rounded-3xl bg-[#142318]/90 border border-white/10 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#336443]/40 border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa] shadow-inner">
                          <Bike className="w-6 h-6 text-[#9ed3aa]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                              Verified Kigali Moto Pilots Directory
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#34A853]/25 text-[#7de099] border border-[#34A853]/40 text-xs font-bold flex items-center gap-1">
                              <Radio className="w-2.5 h-2.5 animate-ping text-[#34A853]" />
                              {ridersList.length} Active
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#c1c9bf]">
                            Select a vetted pilot to pick you up, check their personal MoMo number, or text them in real time.
                          </p>
                        </div>
                      </div>

                      {/* Selected Pilot Quick Badge */}
                      {selectedRiderState && (
                        <div className="p-2.5 rounded-xl bg-[#18261e] border border-[#34A853]/40 flex items-center gap-3">
                          <img 
                            src={selectedRiderState.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'} 
                            alt={selectedRiderState.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#9ed3aa]"
                          />
                          <div>
                            <div className="text-[10px] uppercase font-bold text-[#86e29b]">Active Selected Pilot</div>
                            <div className="text-xs font-bold text-white">{selectedRiderState.name} ({selectedRiderState.bikePlate})</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenChatWithRider(selectedRiderState)}
                            className="ml-2 px-3 py-1.5 rounded-lg bg-[#34A853] hover:bg-[#2c8d46] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Text Now</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-[#85AB8B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={riderSearch}
                          onChange={(e) => setRiderSearch(e.target.value)}
                          placeholder="Search by pilot name, plate (e.g. RAD 829), or sector..."
                          className="w-full bg-[#18261e] text-xs sm:text-sm text-white placeholder-[#7f9e7d] rounded-xl pl-9 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-[#9ed3aa]"
                        />
                        {riderSearch && (
                          <button
                            type="button"
                            onClick={() => setRiderSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#c1c9bf] hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="text-xs text-[#85AB8B]">
                        Zero platform fees: You pay directly to the pilot&apos;s personal MoMo account.
                      </div>
                    </div>

                    {/* Pilots Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ridersList
                        .filter((rider) => {
                          const q = riderSearch.toLowerCase();
                          if (!q) return true;
                          return (
                            rider.name.toLowerCase().includes(q) ||
                            rider.bikePlate.toLowerCase().includes(q) ||
                            rider.sector.toLowerCase().includes(q) ||
                            (rider.momoNumber && rider.momoNumber.includes(q)) ||
                            (rider.bikeModel && rider.bikeModel.toLowerCase().includes(q))
                          );
                        })
                        .map((rider) => {
                          const isSelected = selectedRiderState?.id === rider.id;
                          return (
                            <div 
                              key={rider.id}
                              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                                isSelected
                                  ? 'bg-[#182a1b] border-[#34A853] shadow-lg shadow-[#34A853]/10 ring-1 ring-[#34A853]'
                                  : 'bg-[#18261e] border-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-start gap-3.5">
                                <div className="relative shrink-0">
                                  <img 
                                    src={rider.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} 
                                    alt={rider.name}
                                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#34A853]/60 shadow"
                                  />
                                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#34A853] border-2 border-[#18261e]" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <h3 className="text-sm font-bold text-white truncate">{rider.name}</h3>
                                    {isSelected && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#34A853] text-white shrink-0">
                                        Selected
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 text-xs text-[#9ed3aa] font-semibold mt-0.5">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#34A853]" />
                                    <span>Verified Moto Pilot</span>
                                    <span className="text-[#556b53]">•</span>
                                    <span className="font-mono text-white font-bold">{rider.bikePlate}</span>
                                  </div>

                                  <div className="text-[11px] text-[#c1c9bf] truncate mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#9ed3aa] shrink-0" />
                                    <span>{rider.sector} • {rider.district}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Rider Info Chips: Personal MoMo number & bike specs */}
                              <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                                <div className="flex items-center justify-between p-2 rounded-xl bg-[#121e16] border border-white/5">
                                  <span className="text-[#85AB8B] text-[11px] font-medium flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-[#9ed3aa]" />
                                    Pilot Personal MoMo:
                                  </span>
                                  <span className="font-mono font-bold text-[#9ed3aa]">
                                    {rider.momoNumber || rider.phone || '0788 123 456'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-[#c1c9bf] px-1">
                                  <span>{rider.bikeModel || 'Alpha MK1 Electric'}</span>
                                  <div className="flex items-center gap-1 text-amber-300 font-bold">
                                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                                    <span>{rider.rating || '4.98'} ({rider.tripsCount || 100}+ rides)</span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                <button
                                  type="button"
                                  onClick={() => handleSelectRiderForPickup(rider)}
                                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-[#253e28] text-[#7de099] border border-[#34A853]/50'
                                      : 'bg-[#1f3322] hover:bg-[#28482d] text-white border border-white/10'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{isSelected ? 'Selected for Pickup' : 'Select for Pickup'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenChatWithRider(rider)}
                                  className="flex-1 py-2 px-3 rounded-xl bg-[#34A853] hover:bg-[#2c8d46] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Text Rider</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </section>
                )}

                {/* SECTION A: Passenger Identity & VIP Membership (Visible in Console & Profile) */}
                {(activeNav === 'console' || activeNav === 'profile') && (
                  <section className="p-6 md:p-8 rounded-3xl bg-[#142318]/90 border border-white/10 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#336443]/40 border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
                          <span className="material-symbols-outlined text-2xl">badge</span>
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold text-[#d9e6d2]">Passenger Identity &amp; VIP Profile</h2>
                          <p className="text-xs sm:text-sm text-[#c1c9bf]">Your verified VIP passenger record for priority Kigali dispatches.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#336443]/50 border border-[#9ed3aa]/30 text-[#9ed3aa] text-xs font-semibold uppercase">
                        Verified NIDA
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Full Legal Name</label>
                        <input 
                          className="w-full bg-[#18261e] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9ed3aa]/60 border border-white/10 font-medium" 
                          type="text" 
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Primary Contact Phone</label>
                        <input 
                          className="w-full bg-[#18261e] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9ed3aa]/60 border border-white/10 font-mono font-medium" 
                          type="text" 
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Contact Email</label>
                        <input 
                          className="w-full bg-[#18261e] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9ed3aa]/60 border border-white/10 font-medium" 
                          type="email" 
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* SECTION B: VIP Quick Dispatch Desk (Visible in Console) */}
                {activeNav === 'console' && (
                  <section className="p-6 md:p-8 rounded-3xl bg-[#142318]/90 border border-white/10 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#336443]/40 border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
                          <span className="material-symbols-outlined text-2xl">speed</span>
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold text-[#d9e6d2]">VIP Quick Dispatch Desk</h2>
                          <p className="text-xs sm:text-sm text-[#c1c9bf]">Instant priority moto request across all Kigali sectors.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#336443]/50 border border-[#9ed3aa]/30 text-[#9ed3aa] text-xs font-semibold uppercase">
                        Instant ETA: ~3-5m
                      </span>
                    </div>

                    <form onSubmit={handleInstantDispatch} className="flex flex-col gap-4">
                      {/* Pickup Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#9ed3aa]" />
                          <span>Pickup Landmark / Kigali Location</span>
                        </label>
                        <input 
                          type="text"
                          value={dispatchPickup}
                          onChange={(e) => setDispatchPickup(e.target.value)}
                          className="w-full bg-[#18261e] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9ed3aa]/60 border border-white/10"
                          placeholder="e.g. Kigali Heights, Kimihurura"
                          required
                        />
                      </div>

                      {/* Dropoff Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>Dropoff Destination</span>
                        </label>
                        <input 
                          type="text"
                          value={dispatchDropoff}
                          onChange={(e) => setDispatchDropoff(e.target.value)}
                          className="w-full bg-[#18261e] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9ed3aa]/60 border border-white/10"
                          placeholder="e.g. BK Arena, Remera"
                          required
                        />
                      </div>

                      {/* Service Tier Selection */}
                      <div className="flex flex-col gap-2 pt-1">
                        <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">
                          Choose Service Tier
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div 
                            onClick={() => setDispatchTier('standard')}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1 ${
                              dispatchTier === 'standard'
                                ? 'bg-[#336443] border-[#9ed3aa] text-white shadow-md'
                                : 'bg-[#18261e] border-white/10 text-[#c1c9bf] hover:border-white/30'
                            }`}
                          >
                            <span className="text-xs font-bold uppercase">Standard Moto</span>
                            <span className="text-sm font-bold text-[#9ed3aa] uppercase">Rider-Decided Fare</span>
                            <span className="text-[11px] opacity-80">Certified pilot • Clean helmet</span>
                          </div>

                          <div 
                            onClick={() => setDispatchTier('express')}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1 ${
                              dispatchTier === 'express'
                                ? 'bg-[#336443] border-[#9ed3aa] text-white shadow-md'
                                : 'bg-[#18261e] border-white/10 text-[#c1c9bf] hover:border-white/30'
                            }`}
                          >
                            <span className="text-xs font-bold uppercase">Express VIP</span>
                            <span className="text-sm font-bold text-[#9ed3aa] uppercase">Rider-Decided Fare</span>
                            <span className="text-[11px] opacity-80">Priority radar • High-speed EV</span>
                          </div>

                          <div 
                            onClick={() => setDispatchTier('vip_tour')}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1 ${
                              dispatchTier === 'vip_tour'
                                ? 'bg-[#336443] border-[#9ed3aa] text-white shadow-md'
                                : 'bg-[#18261e] border-white/10 text-[#c1c9bf] hover:border-white/30'
                            }`}
                          >
                            <span className="text-xs font-bold uppercase">Airport Run</span>
                            <span className="text-sm font-bold text-[#9ed3aa] uppercase">Rider-Decided Fare</span>
                            <span className="text-[11px] opacity-80">Kanombe direct • Luggage tie</span>
                          </div>
                        </div>
                      </div>

                      {/* Special instructions */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Special Instructions for Pilot</label>
                        <input 
                          type="text"
                          value={dispatchNotes}
                          onChange={(e) => setDispatchNotes(e.target.value)}
                          className="w-full bg-[#18261e] text-[#d9e6d2] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#9ed3aa]/60 border border-white/10"
                        />
                      </div>

                      {/* Dispatch Submit */}
                      <button
                        type="submit"
                        disabled={isDispatching}
                        className="mt-2 w-full py-4 px-6 rounded-2xl bg-[#9ed3aa] hover:bg-[#b0dfbb] text-[#02391c] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
                      >
                        {isDispatching ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Pinging Nearest Kigali Pilots...</span>
                          </>
                        ) : dispatchConfirmed ? (
                          <>
                            <Check className="w-5 h-5" />
                            <span>Confirmed! Redirecting to Live Track...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            <span>Dispatch Live Moto Concierge</span>
                          </>
                        )}
                      </button>
                    </form>
                  </section>
                )}

                {/* SECTION C: MTN MoMo Wallet & Invoices (Visible in Console & Wallet) */}
                {(activeNav === 'console' || activeNav === 'wallet') && (
                  <section className="p-6 md:p-8 rounded-3xl bg-[#142318]/90 border border-white/10 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#336443]/40 border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
                          <span className="material-symbols-outlined text-2xl">payments</span>
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold text-[#d9e6d2]">MTN Mobile Money &amp; Tax Billing</h2>
                          <p className="text-xs sm:text-sm text-[#c1c9bf]">Seamless contactless payment via direct USSD dialing.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#336443]/50 border border-[#9ed3aa]/30 text-[#9ed3aa] text-xs font-semibold uppercase">
                        Zero Fee
                      </span>
                    </div>

                    {/* MoMo Card Display */}
                    <div className="p-5 rounded-2xl bg-[#18261e] border border-white/10 flex flex-col gap-4 shadow-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#ffcc00] flex items-center justify-center font-bold text-black text-xs shadow-sm">
                            MoMo
                          </div>
                          <div>
                            <span className="text-sm sm:text-base font-semibold text-[#d9e6d2]">Selected Pilot Direct MoMo Payment</span>
                            <p className="text-xs text-[#c1c9bf]">Riders put their own personal MoMo number on their profile; clients pay directly to the rider</p>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-[#336443] text-[#9ed3aa] text-xs font-bold flex items-center gap-1 border border-[#9ed3aa]/30 shadow-sm font-mono">
                          *182*1*1*{(selectedRiderState?.momoNumber || selectedRiderState?.phone || '0788123456').replace(/\D/g, '')}#
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Your MoMo Number</label>
                          <input 
                            className="bg-[#142318] text-[#d9e6d2] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#9ed3aa]/60 border border-white/10 font-mono font-medium" 
                            type="text" 
                            value={momoNumber}
                            onChange={(e) => setMomoNumber(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">MoMo Account Holder</label>
                          <input 
                            className="bg-[#142318] text-[#d9e6d2] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#9ed3aa]/60 border border-white/10 font-medium" 
                            type="text" 
                            value={momoHolder}
                            onChange={(e) => setMomoHolder(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                        <span className="text-xs text-[#85AB8B]">
                          Official J&amp;D Hotline: <strong className="text-white font-mono">0796569416</strong>
                        </span>

                        <button 
                          type="button"
                          onClick={handleTestPing}
                          className="px-4 py-2 rounded-xl bg-[#253d2e] hover:bg-[#2f4d3a] text-[#9ed3aa] text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors border border-white/10 cursor-pointer shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">network_ping</span>
                          Verify MoMo Link
                        </button>
                      </div>
                    </div>

                    {/* Tax EBM v2 info */}
                    <div className="p-4 rounded-2xl bg-[#18261e] border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#9ed3aa] shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-white">Rwanda Revenue Authority (RRA) EBM v2</p>
                          <p className="text-[11px] text-[#c1c9bf]">Every ride generates a verified digital tax invoice with QR validation.</p>
                        </div>
                      </div>
                      {onOpenEbmModal && (
                        <button
                          type="button"
                          onClick={onOpenEbmModal}
                          className="px-3 py-1.5 rounded-xl bg-[#336443] hover:bg-[#3d7751] text-white text-xs font-semibold transition-all shrink-0 cursor-pointer"
                        >
                          Open EBM Hub
                        </button>
                      )}
                    </div>
                  </section>
                )}

                {/* SECTION D: Active Kigali Patrol Sectors (Visible in Console & Profile) */}
                {(activeNav === 'console' || activeNav === 'profile') && (
                  <section className="p-6 md:p-8 rounded-3xl bg-[#142318]/90 border border-white/10 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#336443]/40 border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
                          <span className="material-symbols-outlined text-2xl">map</span>
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold text-[#d9e6d2]">Preferred Kigali Patrol Sectors</h2>
                          <p className="text-xs sm:text-sm text-[#c1c9bf]">Toggle preferred districts to prioritize nearest standby pilots.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#336443]/50 border border-[#9ed3aa]/30 text-[#9ed3aa] text-xs font-semibold uppercase">
                        All Sectors Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Gasabo */}
                      <div 
                        onClick={() => toggleSector('gasabo')}
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          activeSectors.gasabo 
                            ? 'bg-[#336443]/85 text-[#a9dfb5] border-[#9ed3aa]/60 shadow-md' 
                            : 'bg-[#18261e] text-[#d9e6d2] hover:bg-[#203328] border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`material-symbols-outlined text-lg ${activeSectors.gasabo ? 'text-[#9ed3aa]' : 'text-[#8b938a]'}`}>
                            location_on
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-snug">Gasabo Sector</span>
                            <span className="text-xs opacity-80">Kimironko, Kacyiru, Gishushu</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-lg">
                          {activeSectors.gasabo ? 'check_circle' : 'add_circle'}
                        </span>
                      </div>

                      {/* Nyarugenge */}
                      <div 
                        onClick={() => toggleSector('nyarugenge')}
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          activeSectors.nyarugenge 
                            ? 'bg-[#336443]/85 text-[#a9dfb5] border-[#9ed3aa]/60 shadow-md' 
                            : 'bg-[#18261e] text-[#d9e6d2] hover:bg-[#203328] border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`material-symbols-outlined text-lg ${activeSectors.nyarugenge ? 'text-[#9ed3aa]' : 'text-[#8b938a]'}`}>
                            location_on
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-snug">Nyarugenge Sector</span>
                            <span className="text-xs opacity-80">CBD, Kiyovu, Nyamirambo</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-lg">
                          {activeSectors.nyarugenge ? 'check_circle' : 'add_circle'}
                        </span>
                      </div>

                      {/* Kicukiro */}
                      <div 
                        onClick={() => toggleSector('kicukiro')}
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          activeSectors.kicukiro 
                            ? 'bg-[#336443]/85 text-[#a9dfb5] border-[#9ed3aa]/60 shadow-md' 
                            : 'bg-[#18261e] text-[#d9e6d2] hover:bg-[#203328] border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`material-symbols-outlined text-lg ${activeSectors.kicukiro ? 'text-[#9ed3aa]' : 'text-[#8b938a]'}`}>
                            location_on
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-snug">Kicukiro Sector</span>
                            <span className="text-xs opacity-80">Sonatubes, Gikondo, Niboye</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-lg">
                          {activeSectors.kicukiro ? 'check_circle' : 'add_circle'}
                        </span>
                      </div>

                      {/* Remera Airport Corridor */}
                      <div 
                        onClick={() => toggleSector('remera')}
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          activeSectors.remera 
                            ? 'bg-[#336443]/85 text-[#a9dfb5] border-[#9ed3aa]/60 shadow-md' 
                            : 'bg-[#18261e] text-[#d9e6d2] hover:bg-[#203328] border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`material-symbols-outlined text-lg ${activeSectors.remera ? 'text-[#9ed3aa]' : 'text-[#8b938a]'}`}>
                            flight_takeoff
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-snug">Remera Airport Corridor</span>
                            <span className="text-xs opacity-80">KGL Intl Terminal &amp; BK Arena</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-lg">
                          {activeSectors.remera ? 'check_circle' : 'add_circle'}
                        </span>
                      </div>
                    </div>
                  </section>
                )}

                {/* SECTION E: Recent Trips & EBM History (Visible in Console & Trips) */}
                {(activeNav === 'console' || activeNav === 'trips') && (
                  <section className="p-6 md:p-8 rounded-3xl bg-[#142318]/90 border border-white/10 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#336443]/40 border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
                          <span className="material-symbols-outlined text-2xl">alt_route</span>
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold text-[#d9e6d2]">Active &amp; Past Trips</h2>
                          <p className="text-xs sm:text-sm text-[#c1c9bf]">Track ongoing rides and review RRA tax-compliant trip history.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#336443]/50 border border-[#9ed3aa]/30 text-[#9ed3aa] text-xs font-semibold uppercase">
                        18 Trips Completed
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Trip 1 */}
                      <div className="p-4 rounded-2xl bg-[#18261e] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#336443] text-[#9ed3aa] flex items-center justify-center shrink-0 mt-0.5">
                            <Bike className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#d9e6d2]">Kigali Heights → BK Arena</span>
                            <span className="text-xs text-[#c1c9bf]">Pilot: Jean Claude Mugabo (RAD 829 K)</span>
                            <span className="text-[11px] text-[#9ed3aa] font-mono mt-0.5">Direct Pilot Fare • Settled via Pilot Profile MoMo (Direct)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="px-2 py-0.5 rounded-full bg-[#336443] text-[#a9dfb5] text-[11px] font-semibold">
                            Completed
                          </span>
                          {onOpenEbmModal && (
                            <button
                              type="button"
                              onClick={onOpenEbmModal}
                              className="px-2.5 py-1 rounded-lg bg-[#253d2e] hover:bg-[#2f4d3a] border border-white/10 text-xs text-[#c1c9bf] hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-[#9ed3aa]" />
                              <span>EBM</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Trip 2 */}
                      <div className="p-4 rounded-2xl bg-[#18261e] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#336443] text-[#9ed3aa] flex items-center justify-center shrink-0 mt-0.5">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#d9e6d2]">Express Parcel: Kimihurura → Nyarugenge CBD</span>
                            <span className="text-xs text-[#c1c9bf]">Courier: Eric Nshimiyimana (RAC 412 B)</span>
                            <span className="text-[11px] text-[#9ed3aa] font-mono mt-0.5">Direct Courier Fare • Settled via Courier Profile MoMo (Direct)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="px-2 py-0.5 rounded-full bg-[#336443] text-[#a9dfb5] text-[11px] font-semibold">
                            Delivered
                          </span>
                          {onOpenEbmModal && (
                            <button
                              type="button"
                              onClick={onOpenEbmModal}
                              className="px-2.5 py-1 rounded-lg bg-[#253d2e] hover:bg-[#2f4d3a] border border-white/10 text-xs text-[#c1c9bf] hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-[#9ed3aa]" />
                              <span>EBM</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Trip 3 */}
                      <div className="p-4 rounded-2xl bg-[#18261e] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#336443] text-[#9ed3aa] flex items-center justify-center shrink-0 mt-0.5">
                            <Bike className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[#d9e6d2]">Kacyiru Minagri → Kanombe Airport Terminal</span>
                            <span className="text-xs text-[#c1c9bf]">Pilot: Fabrice Bizimana (RAD 104 M)</span>
                            <span className="text-[11px] text-[#9ed3aa] font-mono mt-0.5">Direct Pilot Fare • Settled via Pilot Profile MoMo (Direct)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="px-2 py-0.5 rounded-full bg-[#336443] text-[#a9dfb5] text-[11px] font-semibold">
                            Completed
                          </span>
                          {onOpenEbmModal && (
                            <button
                              type="button"
                              onClick={onOpenEbmModal}
                              className="px-2.5 py-1 rounded-lg bg-[#253d2e] hover:bg-[#2f4d3a] border border-white/10 text-xs text-[#c1c9bf] hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-[#9ed3aa]" />
                              <span>EBM</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* SAFETY & RURA HUB (Visible in Safety Tab) */}
                {activeNav === 'safety' && (
                  <section className="p-6 md:p-8 rounded-3xl bg-[#142318]/90 border border-white/10 flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#336443]/40 border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
                          <span className="material-symbols-outlined text-2xl">verified_user</span>
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold text-[#d9e6d2]">RURA 2026 Safety &amp; Clean Guarantee</h2>
                          <p className="text-xs sm:text-sm text-[#c1c9bf]">Kigali's strict standard for hygiene, GPS telemetry, and passenger safety.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#336443]/50 border border-[#9ed3aa]/30 text-[#9ed3aa] text-xs font-semibold uppercase">
                        100% Certified
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="p-4 rounded-2xl bg-[#18261e] border border-white/10 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#9ed3aa] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-white">Dual Sanitized Helmets &amp; Disposable Hairnets</p>
                          <p className="text-xs text-[#c1c9bf] mt-0.5 leading-relaxed">Every J&amp;D pilot carries two certified helmets that are UV-sanitized and wiped between rides, plus fresh disposable hairnets for passengers.</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#18261e] border border-white/10 flex items-start gap-3">
                        <Activity className="w-5 h-5 text-[#9ed3aa] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-white">Live GPS Telemetry &amp; Guardian Angel SOS</p>
                          <p className="text-xs text-[#c1c9bf] mt-0.5 leading-relaxed">Share live trip location links with loved ones via WhatsApp or SMS. Real-time 24/7 central dispatch monitoring on hotline 0796569416.</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#18261e] border border-white/10 flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#9ed3aa] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-white">Police Traffic &amp; Category A Licensed Pilots</p>
                          <p className="text-xs text-[#c1c9bf] mt-0.5 leading-relaxed">Zero tolerance for reckless driving. Every driver has at least 3 years clean record, defensive riding training, and valid RURA commercial permit.</p>
                        </div>
                      </div>
                    </div>

                    {onOpenRuraSafetyModal && (
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={onOpenRuraSafetyModal}
                          className="px-4 py-2 rounded-xl bg-[#336443] hover:bg-[#3d7751] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <span>Open Full RURA Safety Hub</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </section>
                )}

              </div>

              {/* RIGHT COLUMN: Holographic VIP Passenger Pass & Perks (5 cols, sticky) */}
              <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28 self-start w-full">
                
                {/* Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#9ed3aa]">credit_card</span>
                    <h3 className="text-lg font-semibold text-[#d9e6d2]">VIP Passenger Credential</h3>
                  </div>
                  <span className="text-xs text-[#8b938a] uppercase tracking-wider font-semibold">Kigali VIP Pass</span>
                </div>

                {/* ANIMATED HOLOGRAPHIC 3D PASS CARD matching Rider Portal */}
                <div className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[#18241b] via-[#1f3024] to-[#0c160e] shadow-2xl border border-white/15 group">
                  {/* Iridescent sweeping light effect */}
                  <div className="absolute -inset-full bg-gradient-to-r from-transparent via-[#9ed3aa]/15 to-transparent rotate-45 pointer-events-none group-hover:translate-x-full transition-all duration-1000"></div>

                  <div className="relative z-10 flex flex-col gap-5">
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#9ed3aa] text-[#02391c] flex items-center justify-center font-bold">
                          <span className="material-symbols-outlined text-[20px]">person</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold tracking-wider text-[#d9e6d2]">J &amp; D SMOOTH RIDE</span>
                          <span className="text-[10px] text-[#9ed3aa] uppercase tracking-widest font-semibold">VIP Passenger Concierge</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10">
                        <span className="material-symbols-outlined text-[#9ed3aa] text-[14px]">shield</span>
                        <span className="text-[11px] font-semibold text-[#d9e6d2]">RURA 2026-KGL</span>
                      </div>
                    </div>

                    {/* Body with Passenger Avatar & Pass Info */}
                    <div className="flex items-start gap-4">
                      <div className="relative w-24 h-32 rounded-2xl overflow-hidden bg-black/60 shrink-0 shadow-md border border-white/10 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-tr from-[#1b3424] to-[#2e593d] flex flex-col items-center justify-center text-white">
                          <span className="material-symbols-outlined text-4xl text-[#9ed3aa]">face</span>
                          <span className="text-[10px] font-bold mt-1 text-[#9ed3aa]">VIP PASS</span>
                        </div>
                        <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#9ed3aa] ring-2 ring-[#182216]"></div>
                      </div>

                      <div className="flex flex-col justify-between h-32 py-1 min-w-0 flex-1">
                        <div>
                          <span className="text-[11px] text-[#9ed3aa] uppercase tracking-widest font-semibold">
                            {accountType.replace('_', ' ').toUpperCase()}
                          </span>
                          <h4 className="text-lg font-bold text-[#d9e6d2] tracking-tight truncate leading-tight mt-0.5">
                            {clientName}
                          </h4>
                          <span className="text-xs text-[#c1c9bf] font-mono">Pass ID: CLIENT-RW-78901</span>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-[#8b938a] tracking-wider font-semibold">Primary Zone</span>
                            <span className="text-sm font-semibold text-[#9ed3aa]">Gasabo Alpha</span>
                          </div>
                          <div className="w-px h-6 bg-white/10"></div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-[#8b938a] tracking-wider font-semibold">Payment</span>
                            <span className="text-xs font-mono font-medium text-[#d9e6d2]">*182*1*1#</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Concierge Moto preview */}
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10">
                          <img 
                            alt="Alpha MK1 Sport" 
                            className="w-full h-full object-cover" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3AdIEkf3oDabvF1ZhGEdl1euT31OVz3rfo0uCq10jiYJ9RXBZvxWNOKlAje7WoaX0ushtlS7L9LwYMQNIa4im9c68y9DY6lwhS3aLw-0mhxPrAnbNjGrAPtJcDoSFqv2jd4-PMgRPdeS2waqUiSzyS330RMbSvsK3AhfSKWcyGsML0UQRt5ZWcDrDh_1tz779Ovtl1zFmLXZZ5tne0VXwZAmmZK5jFVd_N91It7e4_TJj-GpEsuHlgRpOxziOhE8Kpw"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-[#d9e6d2] truncate">Fleet Alpha MK1 (Electric)</span>
                          <span className="text-[11px] text-[#c1c9bf] truncate">Dual Sanitized Helmets • GPS Active</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[#9ed3aa] text-[20px] shrink-0">electric_bolt</span>
                    </div>

                    {/* Checkpoint QR & Holographic Status Strip */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {/* Inline QR Code SVG */}
                        <div className="w-11 h-11 p-1 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full text-[#d9e6d2]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4 0h2v4h-2v-4zm4 4h4v2h-4v-2zm-4 2h2v2h-2v-2zm-2-6h2v2h-2v-2zm0 4h2v2h-2v-2zm6-4h2v2h-2v-2z"></path>
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#8b938a] uppercase tracking-wider font-semibold">Checkpoint Scan</span>
                          <span className="text-xs text-[#c1c9bf] font-mono font-semibold">2026-VIP-PASS-OK</span>
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-[#336443]/70 text-[#a9dfb5] text-right border border-[#9ed3aa]/30">
                        <span className="text-[10px] uppercase font-bold tracking-wider block text-[#9ed3aa]">Pass Status</span>
                        <span className="text-xs font-semibold tracking-wide">
                          VIP ACTIVE ✓
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VIP Clearance & Perks Checklist */}
                <div className="p-6 rounded-3xl bg-[#142318]/90 border border-white/10 flex flex-col gap-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#d9e6d2] font-semibold">Passenger Perks &amp; Safety</span>
                    <span className="text-xs text-[#9ed3aa] font-bold">Active Benefits</span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#18261e] border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#9ed3aa] text-[20px]">sports_motorsports</span>
                        <div className="flex flex-col">
                          <span className="text-sm text-[#d9e6d2] font-medium leading-tight">Sanitized Dual Helmets</span>
                          <span className="text-xs text-[#c1c9bf]">Fresh hairnet provided every ride</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[#9ed3aa]">done_all</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#18261e] border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#9ed3aa] text-[20px]">payments</span>
                        <div className="flex flex-col">
                          <span className="text-sm text-[#d9e6d2] font-medium leading-tight">Direct Pilot MoMo Payment</span>
                          <span className="text-xs text-[#c1c9bf] font-mono">
                            {selectedRiderState?.momoNumber || selectedRiderState?.phone || 'Direct to Rider'}
                          </span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[#9ed3aa]">done_all</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#18261e] border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#9ed3aa] text-[20px]">support_agent</span>
                        <div className="flex flex-col">
                          <span className="text-sm text-[#d9e6d2] font-medium leading-tight">24/7 Central Operations</span>
                          <span className="text-xs text-[#c1c9bf] font-mono">0796569416 (Dispatch)</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[#9ed3aa]">done_all</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Card */}
                <div className="p-6 rounded-3xl bg-[#142318]/90 border border-white/10 flex flex-col gap-3 shadow-2xl">
                  {onOpenBookingTab && (
                    <button 
                      type="button"
                      onClick={() => {
                        onOpenBookingTab('ride');
                        onClose();
                      }}
                      className="w-full relative overflow-hidden group py-4 px-6 rounded-2xl font-bold text-center flex items-center justify-center gap-3 shadow-lg transition-all duration-300 cursor-pointer bg-[#9ed3aa] text-[#02391c] hover:bg-[#b0dfbb] hover:shadow-[#9ed3aa]/25"
                    >
                      <span className="relative z-10 flex items-center gap-2 font-bold text-base">
                        <span>Book Instant Kigali Moto Ride</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                  )}

                  <button 
                    type="button"
                    onClick={() => {
                      showToast('Client preferences & VIP pass saved to local cache.');
                      onClose();
                    }}
                    className="w-full py-3 px-6 rounded-2xl bg-[#1c2d22] hover:bg-[#253d2e] text-[#c1c9bf] hover:text-[#d9e6d2] text-sm font-semibold text-center transition-colors cursor-pointer border border-white/10"
                  >
                    Save &amp; Continue Later
                  </button>

                  <p className="text-center text-xs text-[#8b938a] mt-1 leading-relaxed">
                    Priority dispatch across Kigali with sanitized helmets, zero-fee direct Rider MoMo payments, and RRA digital e-receipts.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Real-Time Rider Message Pop-up Notification in Client Portal */}
      {incomingRiderMessage && (
        <div className="fixed top-5 right-4 sm:right-8 z-[200] max-w-sm w-full bg-[#142617]/95 border-2 border-[#34A853] rounded-3xl p-4 shadow-2xl backdrop-blur-md text-[#d9e6d2] animate-bounce-short">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#34A853]/25 border border-[#34A853] flex items-center justify-center text-[#7de099] shrink-0">
                <MessageSquare className="w-4 h-4 text-[#34A853]" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#86e29b] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping" />
                  <span>Incoming Pilot Message</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {incomingRiderMessage.senderName || incomingRiderMessage.riderName || 'Moto Pilot'}
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncomingRiderMessage(null)}
              className="text-[#8b938a] hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#c1c9bf] bg-[#0c160c] p-2.5 rounded-xl border border-[#233522] mb-3 line-clamp-3">
            &ldquo;{incomingRiderMessage.text}&rdquo;
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const pilot = ridersList.find((r) => r.id === incomingRiderMessage.riderId) || selectedRiderState;
                if (pilot) setTargetChatRider(pilot);
                setIncomingRiderMessage(null);
                setIsChatModalOpen(true);
              }}
              className="flex-1 py-2 bg-[#34A853] hover:bg-[#2c8d46] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply to Pilot</span>
            </button>
            <button
              type="button"
              onClick={() => setIncomingRiderMessage(null)}
              className="px-3 py-2 bg-[#1b2b1a] hover:bg-[#253e24] text-[#a1baa0] text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Direct Chat Modal for Client */}
      <RiderClientChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        currentUserRole="client"
        currentUserName={clientName}
        currentUserPhone={clientPhone}
        targetRider={targetChatRider || selectedRiderState}
        targetClient={{
          id: clientPhone || 'client-vip-1',
          name: clientName,
          phone: clientPhone,
        }}
      />
    </div>
  );
};
