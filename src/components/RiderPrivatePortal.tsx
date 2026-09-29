import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  LogOut, 
  Menu, 
  X, 
  Upload, 
  RefreshCw,
  MessageSquare,
  Bell,
  Send,
  User,
  Smartphone,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { DriverApplication, DirectChatMessage } from '../types';
import { updateRiderProfile } from '../utils/riderDirectory';
import { getSocket, playNotificationChime } from '../utils/directChat';
import { RiderClientChatModal } from './RiderClientChatModal';

interface RiderPrivatePortalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  pilotData?: DriverApplication | null;
}

export const RiderPrivatePortal: React.FC<RiderPrivatePortalProps> = ({
  isOpen,
  onClose,
  onLogout,
  pilotData,
}) => {
  // Pilot Profile state with fallback to Jean Claude Mugabo or data passed from account creation
  const [pilotName, setPilotName] = useState(pilotData?.fullName || 'Jean Claude Mugabo');
  const [nationalId, setNationalId] = useState(pilotData?.nationalId || '1 1992 8 0048291 0 45');
  const [phone, setPhone] = useState(pilotData?.phone || '+250 788 123 456');
  const [emergencyName, setEmergencyName] = useState('Aline Mukamana (Spouse)');
  const [emergencyPhone, setEmergencyPhone] = useState('+250 788 987 654');

  // Bike & Specs
  const [bikeModel, setBikeModel] = useState(pilotData?.bikeModel ? `${pilotData.bikeModel} • Electric (9 kW peak)` : 'Alpha MK1 Sport • Electric (9 kW peak)');
  const [bikePlate, setBikePlate] = useState(pilotData?.bikePlate || 'RAD 829 K');
  const [bikeLivery, setBikeLivery] = useState('Crimson & Gloss Black Concierge Livery');
  const [bikeYear, setBikeYear] = useState('2023 Fleet Batch');

  // MoMo & Banking
  const [momoNumber, setMomoNumber] = useState(pilotData?.momoNumber || pilotData?.phone || '0788123456');
  const [momoHolder, setMomoHolder] = useState(pilotData?.fullName || 'Jean Claude Mugabo');
  const [pingState, setPingState] = useState<'verified' | 'pinging' | 'success'>('verified');

  // Direct Client-Rider Chat & Popup Notification State
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [activeChatClient, setActiveChatClient] = useState<{ id: string; name: string; phone?: string } | null>({
    id: 'client-vip-1',
    name: 'Live Kigali Passenger',
    phone: '0788 349 102',
  });
  const [incomingNotification, setIncomingNotification] = useState<{
    id: string;
    clientId: string;
    clientName: string;
    clientPhone?: string;
    text: string;
    timestamp: number;
  } | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Sync state when pilotData changes (e.g., login or account switch)
  useEffect(() => {
    if (pilotData) {
      if (pilotData.fullName) {
        setPilotName(pilotData.fullName);
        setMomoHolder(pilotData.fullName);
      }
      if (pilotData.nationalId) setNationalId(pilotData.nationalId);
      if (pilotData.phone) setPhone(pilotData.phone);
      if (pilotData.bikeModel) setBikeModel(`${pilotData.bikeModel} • Electric (9 kW peak)`);
      if (pilotData.bikePlate) setBikePlate(pilotData.bikePlate);
      if (pilotData.momoNumber) setMomoNumber(pilotData.momoNumber);
    }
  }, [pilotData]);

  // Real-time listener for incoming client messages with audio-visual popup
  useEffect(() => {
    if (!isOpen) return;

    const socket = getSocket();

    const handleIncomingMessage = (msg: DirectChatMessage) => {
      if (msg.sender === 'client') {
        setIncomingNotification({
          id: msg.id,
          clientId: msg.clientId,
          clientName: msg.clientName || 'Passenger',
          clientPhone: msg.senderPhone,
          text: msg.text,
          timestamp: msg.timestamp,
        });
        setUnreadChatCount((prev) => prev + 1);
        playNotificationChime();
      }
    };

    socket.on('direct-message-received', handleIncomingMessage);

    const handleLocalMessage = (e: Event) => {
      const customEvent = e as CustomEvent<DirectChatMessage>;
      if (customEvent.detail && customEvent.detail.sender === 'client') {
        const msg = customEvent.detail;
        setIncomingNotification({
          id: msg.id,
          clientId: msg.clientId,
          clientName: msg.clientName || 'Passenger',
          clientPhone: msg.senderPhone,
          text: msg.text,
          timestamp: msg.timestamp,
        });
        setUnreadChatCount((prev) => prev + 1);
        playNotificationChime();
      }
    };

    window.addEventListener('jd_new_direct_message', handleLocalMessage);

    return () => {
      socket.off('direct-message-received', handleIncomingMessage);
      window.removeEventListener('jd_new_direct_message', handleLocalMessage);
    };
  }, [isOpen]);

  // Auto-dismiss incoming message notification after 9s if unattended
  useEffect(() => {
    if (!incomingNotification) return;
    const timer = setTimeout(() => {
      setIncomingNotification(null);
    }, 9000);
    return () => clearTimeout(timer);
  }, [incomingNotification]);

  // Active Kigali Patrol Sectors toggle state
  const [activeSectors, setActiveSectors] = useState<{ [key: string]: boolean }>({
    gasabo: true,
    nyarugenge: true,
    kicukiro: false,
    remera: true,
  });

  // Onboarding & activation state
  const [isActivating, setIsActivating] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [progressPercent, setProgressPercent] = useState(65);

  // Active navigation tab
  const [activeNav, setActiveNav] = useState<'verification' | 'console' | 'dispatch' | 'telemetry' | 'wallet'>('verification');

  // Mobile sidebar open state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Notification toast inside portal
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveMomoProfile = () => {
    updateRiderProfile({
      id: pilotData?.phone || 'pilot-jean-claude',
      name: pilotName,
      phone,
      momoNumber,
      bikePlate,
      bikeModel,
    });
    const socket = getSocket();
    socket.emit('rider-profile-update', {
      id: pilotData?.phone || 'pilot-jean-claude',
      name: pilotName,
      phone,
      momoNumber,
      bikePlate,
      bikeModel,
    });
    showToast(`✅ Profile & MoMo (${momoNumber}) Saved! Clients will pay directly to your number.`);
  };

  const handleOpenChatWithClient = (client?: { id: string; name: string; phone?: string }) => {
    if (client) {
      setActiveChatClient(client);
    }
    setUnreadChatCount(0);
    setIncomingNotification(null);
    setIsChatModalOpen(true);
  };

  const handleTestPing = () => {
    setPingState('pinging');
    setTimeout(() => {
      setPingState('success');
      showToast('MTN Rwanda MoMo ping verified: 50 RWF test transaction confirmed.');
    }, 1100);
  };

  const handleCompleteOnboarding = () => {
    setIsActivating(true);
    setTimeout(() => {
      setIsActivating(false);
      setIsActivated(true);
      setProgressPercent(100);
      showToast('🎉 Pilot Profile Activated! You are now live on the Kigali VIP Dispatch Network.');
    }, 1300);
  };

  const toggleSector = (sectorKey: string) => {
    setActiveSectors((prev) => ({
      ...prev,
      [sectorKey]: !prev[sectorKey],
    }));
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b160a]/90 via-[#0b160a]/75 to-[#0b160a]/95" />
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[rgba(18,30,23,0.85)] backdrop-blur-[12px] border border-[#9ed3aa] text-[#b9efc5] px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-[#9ed3aa]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ASIDE SIDEBAR (Desktop Fixed & Mobile Responsive) */}
      <aside 
        className={`fixed left-0 top-0 h-full w-72 bg-[rgba(18,30,23,0.75)] backdrop-blur-[12px] z-50 flex flex-col justify-between shadow-2xl border-r border-white/10 transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="flex flex-col">
          {/* Logo & Brand Header */}
          <div className="h-20 flex items-center justify-between px-6 bg-black/20 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#336443] text-[#9ed3aa]">
                <span className="material-symbols-outlined text-2xl">two_wheeler</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-[#d9e6d2]">J &amp; D PILOT</span>
                  <span className="h-2 w-2 rounded-full bg-[#9ed3aa] animate-pulse"></span>
                </div>
                <span className="text-xs uppercase tracking-widest text-[#9ed3aa] font-semibold">Kigali Hub</span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-[#c1c9bf] hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Pilot Status Card */}
          <div className="px-6 py-4">
            <div className="p-3 rounded-xl bg-[rgba(18,30,23,0.65)] backdrop-blur-[12px] border border-white/10 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#9ed3aa] ring-4 ring-[#9ed3aa]/20"></div>
                <span className="text-xs uppercase text-[#d9e6d2] tracking-wider font-semibold">
                  {isActivated ? 'Active Pilot (Live)' : 'Active Pilot'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#336443] text-[#a9dfb5] text-xs font-semibold">
                {isActivated ? 'Online' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Nav List */}
          <div className="px-4 py-2">
            <nav className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveNav('console');
                  setMobileSidebarOpen(false);
                  showToast('Pilot Console: Telemetry link active.');
                }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group text-left cursor-pointer ${
                  activeNav === 'console'
                    ? 'bg-[#336443] text-[#a9dfb5] font-medium shadow-sm'
                    : 'text-[#c1c9bf] hover:bg-[#222d20] hover:text-[#d9e6d2]'
                }`}
              >
                <span className="material-symbols-outlined text-[#8b938a] group-hover:text-[#9ed3aa] transition-colors">
                  speed
                </span>
                <span className="text-sm font-medium">Pilot Console</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNav('dispatch');
                  setMobileSidebarOpen(false);
                  showToast('Trip Dispatch: Listening for Kigali airport & VIP orders.');
                }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group text-left cursor-pointer ${
                  activeNav === 'dispatch'
                    ? 'bg-[#336443] text-[#a9dfb5] font-medium shadow-sm'
                    : 'text-[#c1c9bf] hover:bg-[#222d20] hover:text-[#d9e6d2]'
                }`}
              >
                <span className="material-symbols-outlined text-[#8b938a] group-hover:text-[#9ed3aa] transition-colors">
                  alt_route
                </span>
                <span className="text-sm font-medium">Trip Dispatch</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNav('telemetry');
                  setMobileSidebarOpen(false);
                  showToast('Vehicle Telemetry: Battery 92% • GPS Signal High.');
                }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group text-left cursor-pointer ${
                  activeNav === 'telemetry'
                    ? 'bg-[#336443] text-[#a9dfb5] font-medium shadow-sm'
                    : 'text-[#c1c9bf] hover:bg-[#222d20] hover:text-[#d9e6d2]'
                }`}
              >
                <span className="material-symbols-outlined text-[#8b938a] group-hover:text-[#9ed3aa] transition-colors">
                  electric_moped
                </span>
                <span className="text-sm font-medium">Vehicle Telemetry</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNav('verification');
                  setMobileSidebarOpen(false);
                }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group text-left cursor-pointer ${
                  activeNav === 'verification'
                    ? 'bg-[#336443] text-[#a9dfb5] font-medium shadow-sm'
                    : 'text-[#c1c9bf] hover:bg-[#222d20] hover:text-[#d9e6d2]'
                }`}
              >
                <span className="material-symbols-outlined text-[#8b938a] group-hover:text-[#9ed3aa] transition-colors">
                  verified_user
                </span>
                <span className="text-sm font-medium">Verification Hub</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveNav('wallet');
                  setMobileSidebarOpen(false);
                  showToast('Wallet & Payouts: Zero-fee instant MTN MoMo settlement.');
                }}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all group text-left cursor-pointer ${
                  activeNav === 'wallet'
                    ? 'bg-[#336443] text-[#a9dfb5] font-medium shadow-sm'
                    : 'text-[#c1c9bf] hover:bg-[#222d20] hover:text-[#d9e6d2]'
                }`}
              >
                <span className="material-symbols-outlined text-[#8b938a] group-hover:text-[#9ed3aa] transition-colors">
                  payments
                </span>
                <span className="text-sm font-medium">Wallet &amp; Payouts</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleOpenChatWithClient();
                  setMobileSidebarOpen(false);
                }}
                className="flex items-center justify-between px-4 py-3 rounded-xl transition-all group text-left cursor-pointer text-[#c1c9bf] hover:bg-[#222d20] hover:text-[#d9e6d2]"
              >
                <div className="flex items-center gap-3.5">
                  <MessageSquare className="w-5 h-5 text-[#8b938a] group-hover:text-[#9ed3aa] transition-colors" />
                  <span className="text-sm font-medium">Passenger Texts</span>
                </div>
                {unreadChatCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34A853] text-white animate-pulse">
                    {unreadChatCount} new
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Operational Area Widget */}
        <div className="p-4 mx-4 mb-3 rounded-2xl bg-[rgba(18,30,23,0.65)] backdrop-blur-[12px] border border-white/10 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#c1c9bf] uppercase tracking-wider font-semibold">Operational Area</span>
            <span className="text-xs text-[#9ed3aa] font-semibold">Zone Alpha</span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#9ed3aa] h-full rounded-full w-4/5"></div>
          </div>
          <span className="text-xs text-[#8b938a]">Gasabo • Nyarugenge Direct</span>
        </div>

        {/* Pilot Account & Logout Bar in Sidebar */}
        <div className="mx-4 mb-6 p-3 rounded-2xl bg-[rgba(18,30,23,0.75)] backdrop-blur-[12px] border border-white/15 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#336443] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#9ed3aa]/40">
              {pilotName.charAt(0) || 'P'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-[#d9e6d2] truncate">{pilotName}</span>
              <span className="text-[10px] text-[#9ed3aa] flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9ed3aa] animate-pulse" />
                <span>Pilot Active</span>
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
            title="Log Out of Pilot Account"
            aria-label="Log Out of Pilot Account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen">
        {/* HEADER BAR */}
        <header 
          className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-[rgba(18,30,23,0.7)] backdrop-blur-[12px] z-40 shadow-md border-b border-white/10"
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        >
          <div className="h-20 w-full px-4 sm:px-8 md:px-12 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-[rgba(18,30,23,0.8)] border border-white/10 text-[#9ed3aa]"
                aria-label="Open Pilot Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#9ed3aa]"></div>
                <span className="text-sm sm:text-base md:text-lg tracking-tight font-bold text-[#d9e6d2] uppercase">
                  J &amp; D SMOOTH RIDE
                </span>
              </div>

              <div className="hidden sm:flex items-center">
                <span className="px-2.5 py-1 rounded-md bg-[#2b4e34]/80 text-[#98bf9e] text-xs font-semibold tracking-wider uppercase border border-[#9ed3aa]/20">
                  KIGALI PILOT PORTAL
                </span>
              </div>

              <span className="hidden lg:inline text-[#414942]">/</span>
              <span className="hidden lg:inline text-xs sm:text-sm text-[#c1c9bf]">
                Account Onboarding / Profile Setup
              </span>
            </div>

            {/* Right Header: Notification + Pilot Details + Exit Portal Button */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Return to Main Site Button */}
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(18,30,23,0.65)] hover:bg-[rgba(18,30,23,0.9)] border border-white/10 text-xs text-[#c1c9bf] hover:text-white transition-all shadow-sm backdrop-blur-md"
                title="Return to Passenger Main Site"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden md:inline font-semibold">Exit Portal</span>
              </button>

              {/* Log Out Button */}
              <button
                type="button"
                onClick={() => {
                  if (onLogout) onLogout();
                  else onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2b1616]/80 hover:bg-[#421d1d] border border-red-500/40 text-xs text-red-300 hover:text-white transition-all shadow-sm active:scale-95"
                title="Log Out of Pilot Account"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="font-semibold">Log Out</span>
              </button>

              {/* Notification Bell with Ping */}
              <button 
                type="button"
                onClick={() => showToast('Dispatch Desk: System running normal. Ready for duty.')}
                className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#222d20]/70 hover:bg-[#2c382a] text-[#d9e6d2] transition-colors"
              >
                <span className="material-symbols-outlined text-lg">notifications</span>
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9ed3aa] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#9ed3aa]"></span>
                </span>
              </button>

              <div className="h-7 w-px bg-[#2c382a] hidden sm:block"></div>

              {/* Pilot Avatar & Badge */}
              <div className="flex items-center gap-2.5 pl-1">
                <div className="flex flex-col text-right hidden md:block">
                  <span className="text-xs sm:text-sm font-medium text-[#d9e6d2] leading-none">
                    {pilotName}
                  </span>
                  <span className="text-[11px] text-[#9ed3aa] leading-tight font-semibold mt-0.5">
                    Class-A Moto Concierge
                  </span>
                </div>
                <img 
                  alt="Pilot Profile" 
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-[#9ed3aa]/40" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKatAexE_jKfNAgrS5tZEftOu-IV2FY3H2JzMZe3Up4O74L1UCz8n5M11z-LOtgRcsEERucMUvYQMu3LAi9k6yKhSpCX5micV2MYB-TFzYneGXqlE0Zx3M4fDW4nzyuLqKNBZxecL0DS5Rfwb00NAsjrkDyZPhW4-cWIbDDa9n1a9EqcNz3NUlZxztTwyMRX8wbWKfBHwCDEDbA3UNqQReHu9ielGiqSpwHsVCwYtp1mBVrxtN-4UC"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="relative w-full pt-20 bg-transparent flex-1 pb-16">
          <div className="px-4 sm:px-8 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
            
            {/* Top Onboarding Header & Status Card */}
            <div 
              className="relative overflow-hidden rounded-3xl bg-[rgba(18,30,23,0.65)] backdrop-blur-[12px] p-6 md:p-8 shadow-2xl border border-white/10"
              style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
              <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#9ed3aa]/5 blur-3xl pointer-events-none"></div>
              <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#2b4e34]/10 blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#336443] text-[#a9dfb5] text-xs font-semibold uppercase tracking-wider border border-[#9ed3aa]/30">
                        Kigali Dispatch Fleet
                      </span>
                      <span className="text-[#414942] text-xs">•</span>
                      <span className="text-[#9ed3aa] text-xs flex items-center gap-1 font-semibold">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#9ed3aa] animate-ping"></span>
                        Fast-Track Verification
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-medium text-[#d9e6d2] tracking-tight">
                      Welcome to J &amp; D Smooth Ride, {pilotName.split(' ')[0]}! Let's set up your Pilot Profile.
                    </h1>
                    <p className="text-sm sm:text-base text-[#c1c9bf] max-w-3xl">
                      Complete your profile setup to unlock Kigali VIP dispatch requests and instant MoMo payouts. Progress: <span className="text-[#9ed3aa] font-semibold">{progressPercent}% completed</span>.
                    </p>
                  </div>

                  {/* Circular Progress Indicator */}
                  <div className="flex items-center gap-3 bg-[rgba(18,30,23,0.7)] border border-white/10 p-3 rounded-2xl self-start lg:self-center shadow-md">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                        <circle 
                          className="text-black/40" 
                          cx="24" 
                          cy="24" 
                          fill="none" 
                          r="20" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                        />
                        <circle 
                          className="text-[#9ed3aa] transition-all duration-1000" 
                          cx="24" 
                          cy="24" 
                          fill="none" 
                          r="20" 
                          stroke="currentColor" 
                          strokeDasharray="125.6" 
                          strokeDashoffset={isActivated ? "0" : "44"} 
                          strokeWidth="4" 
                        />
                      </svg>
                      <span className="absolute text-xs font-bold text-[#d9e6d2]">{progressPercent}%</span>
                    </div>
                    <div className="flex flex-col pr-2">
                      <span className="text-xs text-[#c1c9bf] uppercase tracking-wider font-semibold">Setup Status</span>
                      <span className="text-sm font-medium text-[#d9e6d2]">
                        {isActivated ? 'Completed' : 'Stage 2 of 3'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Tracker Bar & Steps */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-[#336443] via-[#9ed3aa] to-[#b9efc5] rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Step 1 */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(18,30,23,0.6)] border border-white/10 shadow-sm">
                      <div className="w-7 h-7 rounded-full bg-[#9ed3aa] flex items-center justify-center text-[#02391c]">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-[#c1c9bf] uppercase tracking-wider font-semibold">Step 1</span>
                        <span className="text-sm font-medium text-[#d9e6d2] truncate">Account Created</span>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#336443]/40 border border-[#9ed3aa]/40 shadow-md relative overflow-hidden">
                      <div className="absolute inset-0 bg-[#9ed3aa]/5 animate-pulse"></div>
                      <div className="relative z-10 w-7 h-7 rounded-full bg-[#336443] text-[#a9dfb5] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">sports_motorsports</span>
                      </div>
                      <div className="relative z-10 flex flex-col min-w-0">
                        <span className="text-xs text-[#9ed3aa] font-semibold uppercase tracking-wider">
                          {isActivated ? 'Step 2 • Approved' : 'Step 2 • Active'}
                        </span>
                        <span className="text-sm font-medium text-[#d9e6d2] truncate">Driver Photo &amp; Moto Specs</span>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border border-white/10 ${isActivated ? 'bg-[#336443]/40 text-[#d9e6d2]' : 'bg-[rgba(18,30,23,0.5)] opacity-80'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isActivated ? 'bg-[#9ed3aa] text-[#02391c]' : 'bg-black/30 text-[#8b938a]'}`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {isActivated ? 'check' : 'payments'}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#8b938a]">
                          {isActivated ? 'Step 3 • Verified' : 'Step 3 • Pending'}
                        </span>
                        <span className="text-sm font-medium text-[#c1c9bf] truncate">Payout &amp; Kigali Sectors</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN TWO-COLUMN SETUP AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Multi-part Registration Form (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                
                {/* Section A: Pilot Identity */}
                <section 
                  className="p-6 md:p-8 rounded-3xl bg-[rgba(18,30,23,0.65)] backdrop-blur-[12px] border border-white/10 flex flex-col gap-6 shadow-2xl"
                  style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#336443]/40 border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
                        <span className="material-symbols-outlined text-2xl">badge</span>
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-medium text-[#d9e6d2]">Pilot Identity &amp; Personal Details</h2>
                        <p className="text-xs sm:text-sm text-[#c1c9bf]">Verify legal identification per RURA Kigali transport protocols.</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-[#336443]/50 border border-[#9ed3aa]/30 text-[#9ed3aa] text-xs font-semibold uppercase">
                      Verified NIDA
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Full Legal Name (as on ID)</label>
                      <div className="relative flex items-center">
                        <input 
                          className="w-full bg-[rgba(18,30,23,0.85)] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-[rgba(26,42,32,0.95)] focus:border-[#9ed3aa]/60 border border-white/10 transition-colors font-medium" 
                          type="text" 
                          value={pilotName}
                          onChange={(e) => setPilotName(e.target.value)}
                        />
                        <span className="material-symbols-outlined absolute right-4 text-[#9ed3aa]">check_circle</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">NIDA National ID Number</label>
                      <input 
                        className="w-full bg-[rgba(18,30,23,0.85)] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-[rgba(26,42,32,0.95)] focus:border-[#9ed3aa]/60 border border-white/10 transition-colors font-mono" 
                        type="text" 
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Phone / WhatsApp Line</label>
                      <input 
                        className="w-full bg-[rgba(18,30,23,0.85)] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-[rgba(26,42,32,0.95)] focus:border-[#9ed3aa]/60 border border-white/10 transition-colors font-mono" 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Emergency Contact Name</label>
                      <input 
                        className="w-full bg-[rgba(18,30,23,0.85)] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-[rgba(26,42,32,0.95)] focus:border-[#9ed3aa]/60 border border-white/10 transition-colors" 
                        type="text" 
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Emergency Contact Phone</label>
                      <input 
                        className="w-full bg-[rgba(18,30,23,0.85)] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-[rgba(26,42,32,0.95)] focus:border-[#9ed3aa]/60 border border-white/10 transition-colors font-mono" 
                        type="tel" 
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                {/* Section B: Driver Portrait Upload */}
                <section 
                  className="p-6 md:p-8 rounded-3xl bg-[rgba(18,30,23,0.65)] backdrop-blur-[12px] border border-white/10 flex flex-col gap-6 shadow-2xl"
                  style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#336443]/40 border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
                      <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-medium text-[#d9e6d2]">Driver Portrait (Official Pilot Badge Photo)</h2>
                      <p className="text-xs sm:text-sm text-[#c1c9bf]">Shown to Kigali VIP passengers during trip matching and gate security.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Active Preview Card */}
                    <div className="md:col-span-5 flex flex-col items-center bg-[rgba(18,30,23,0.7)] border border-white/10 p-4 rounded-2xl shadow-sm group">
                      <div className="relative w-36 h-44 rounded-xl overflow-hidden bg-black/40 border border-white/10">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          alt="Professional pilot portrait" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKatAexE_jKfNAgrS5tZEftOu-IV2FY3H2JzMZe3Up4O74L1UCz8n5M11z-LOtgRcsEERucMUvYQMu3LAi9k6yKhSpCX5micV2MYB-TFzYneGXqlE0Zx3M4fDW4nzyuLqKNBZxecL0DS5Rfwb00NAsjrkDyZPhW4-cWIbDDa9n1a9EqcNz3NUlZxztTwyMRX8wbWKfBHwCDEDbA3UNqQReHu9ielGiqSpwHsVCwYtp1mBVrxtN-4UC" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-2 left-2 right-2 bg-[#071106]/90 rounded-lg py-1 px-2 flex items-center justify-center gap-1.5 border border-white/10">
                          <span className="material-symbols-outlined text-[#9ed3aa] text-[14px]">verified</span>
                          <span className="text-[11px] text-[#d9e6d2] uppercase tracking-wider font-semibold">Photo Approved</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => showToast('Badge photo updated and synced with RURA police safety registry.')}
                        className="mt-3 text-[#9ed3aa] hover:text-[#b9efc5] text-xs uppercase tracking-wider font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">cached</span> Change Photo
                      </button>
                    </div>

                    {/* Upload dropzone & visual requirements checklist */}
                    <div className="md:col-span-7 flex flex-col gap-4">
                      <div className="p-4 rounded-2xl bg-[rgba(18,30,23,0.6)] border border-white/10 flex flex-col gap-2.5">
                        <span className="text-xs uppercase tracking-wider text-[#d9e6d2] font-semibold">Photo Requirements Checklist</span>
                        <div className="flex items-center gap-2 text-[#c1c9bf] text-xs sm:text-sm">
                          <span className="material-symbols-outlined text-[#9ed3aa] text-base">check_circle</span>
                          <span>White or neutral high-contrast background</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#c1c9bf] text-xs sm:text-sm">
                          <span className="material-symbols-outlined text-[#9ed3aa] text-base">check_circle</span>
                          <span>Clear facial view without helmet or tinted visor</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#c1c9bf] text-xs sm:text-sm">
                          <span className="material-symbols-outlined text-[#9ed3aa] text-base">check_circle</span>
                          <span>Professional pilot polo or uniform jacket</span>
                        </div>
                      </div>

                      <div 
                        onClick={() => showToast('Select high-resolution pilot image (PNG/JPG up to 10MB)')}
                        className="p-4 rounded-2xl bg-[rgba(18,30,23,0.5)] hover:bg-[rgba(18,30,23,0.8)] border border-dashed border-white/20 cursor-pointer transition-all flex items-center justify-center gap-3 text-center shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[#9ed3aa] text-xl">cloud_upload</span>
                        <span className="text-xs sm:text-sm text-[#d9e6d2]">Drag and drop replacement JPG/PNG or browse files</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section C: Motorbike Details & Moto Photo */}
                <section 
                  className="p-6 md:p-8 rounded-3xl bg-[rgba(18,30,23,0.65)] backdrop-blur-[12px] border border-white/10 flex flex-col gap-6 shadow-2xl"
                  style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#336443]/40 border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
                        <span className="material-symbols-outlined text-2xl">two_wheeler</span>
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-medium text-[#d9e6d2]">Motorbike Details &amp; Moto Photo</h2>
                        <p className="text-xs sm:text-sm text-[#c1c9bf]">Assigned vehicle telemetry profile for airport &amp; VIP priority runs.</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-[#2b4e34]/80 border border-[#9ed3aa]/30 text-[#98bf9e] text-xs uppercase font-semibold">
                      Class A EV
                    </span>
                  </div>

                  {/* Featured Motorbike Photo Box */}
                  <div className="relative rounded-2xl overflow-hidden bg-black/40 shadow-inner border border-white/10">
                    <div className="relative w-full h-64 sm:h-80 overflow-hidden">
                      <img 
                        alt="Alpha MK1 Sport Motorbike" 
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-700" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3ZZYMNgHcXCOOcO9U9QWLZq0vn0fI9qGrob_vqmySAa6WKeFBv7NojrPxrjwzFpw5EXw-QPe3jw2sExT8QtvtvBPGkAD8tpup3ZjKd6ZhRLE3o-HdVCtjsJgR5ntKSPvQPXckyPLBxPpVdywmPJWSXOn_fro0pxV2QuhuRYxUPQOcrjefjGrsvKrq88ji9R_Svc8z-xwHQ-Wm_zBqdfAhpKvlPggFtG5KPtsGfNQw2W4yjgo2_lH1AXC-L2V40KESyg"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,22,10,0.95)] via-transparent to-transparent"></div>

                      {/* Badges inside vehicle frame */}
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[#9ed3aa] text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 border border-[#9ed3aa]/30">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Kigali City Approved
                        </span>
                        <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[#d9e6d2] text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 border border-white/10">
                          <span className="material-symbols-outlined text-[#9ed3aa] text-[14px]">bolt</span>
                          Electric Telemetry Linked
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-[#d9e6d2]">Alpha MK1 Sport</h3>
                          <p className="text-xs text-[#9ed3aa] uppercase tracking-widest font-semibold">
                            Plate: {bikePlate} • Rwanda EV Registry
                          </p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => showToast('Vehicle livery & plate photo updated.')}
                          className="px-3 py-2 rounded-xl bg-[rgba(18,30,23,0.85)] hover:bg-[rgba(26,42,32,0.95)] text-[#d9e6d2] text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all border border-white/10 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                          Replace Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Moto specs inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Motorcycle Model &amp; Powertrain</label>
                      <input 
                        className="w-full bg-[rgba(18,30,23,0.85)] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-[rgba(26,42,32,0.95)] focus:border-[#9ed3aa]/60 border border-white/10 transition-colors font-medium" 
                        type="text" 
                        value={bikeModel}
                        onChange={(e) => setBikeModel(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Registration License Plate</label>
                      <input 
                        className="w-full bg-[rgba(18,30,23,0.85)] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-[rgba(26,42,32,0.95)] focus:border-[#9ed3aa]/60 border border-white/10 transition-colors uppercase font-semibold font-mono" 
                        type="text" 
                        value={bikePlate}
                        onChange={(e) => setBikePlate(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Motorbike Finish / Livery</label>
                      <input 
                        className="w-full bg-[rgba(18,30,23,0.85)] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-[rgba(26,42,32,0.95)] focus:border-[#9ed3aa]/60 border border-white/10 transition-colors font-medium" 
                        type="text" 
                        value={bikeLivery}
                        onChange={(e) => setBikeLivery(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Year of Manufacture</label>
                      <input 
                        className="w-full bg-[rgba(18,30,23,0.85)] text-[#d9e6d2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-[rgba(26,42,32,0.95)] focus:border-[#9ed3aa]/60 border border-white/10 transition-colors font-medium" 
                        type="text" 
                        value={bikeYear}
                        onChange={(e) => setBikeYear(e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                {/* Section D: Kigali Operating Zones & Payout Details */}
                <section 
                  className="p-6 md:p-8 rounded-3xl bg-[rgba(18,30,23,0.65)] backdrop-blur-[12px] border border-white/10 flex flex-col gap-6 shadow-2xl"
                  style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#336443]/40 border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
                      <span className="material-symbols-outlined text-2xl">map</span>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-medium text-[#d9e6d2]">Operating Zones &amp; Payout Account</h2>
                      <p className="text-xs sm:text-sm text-[#c1c9bf]">Select preferred patrol sectors and specify your direct MoMo withdrawal account.</p>
                    </div>
                  </div>

                  {/* Zone chips */}
                  <div className="flex flex-col gap-3">
                    <span className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Active Kigali Patrol Sectors</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="zone-chips">
                      {/* Gasabo */}
                      <div 
                        onClick={() => toggleSector('gasabo')}
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          activeSectors.gasabo 
                            ? 'bg-[#336443]/85 text-[#a9dfb5] border-[#9ed3aa]/60 shadow-md' 
                            : 'bg-[rgba(18,30,23,0.6)] text-[#d9e6d2] hover:bg-[rgba(18,30,23,0.85)] border-white/10'
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
                            : 'bg-[rgba(18,30,23,0.6)] text-[#d9e6d2] hover:bg-[rgba(18,30,23,0.85)] border-white/10'
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
                            : 'bg-[rgba(18,30,23,0.6)] text-[#d9e6d2] hover:bg-[rgba(18,30,23,0.85)] border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`material-symbols-outlined text-lg ${activeSectors.kicukiro ? 'text-[#9ed3aa]' : 'text-[#8b938a]'}`}>
                            location_on
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-snug">Kicukiro Sector</span>
                            <span className="text-xs text-[#c1c9bf]">Sonatubes, Gikondo, Niboye</span>
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
                            : 'bg-[rgba(18,30,23,0.6)] text-[#d9e6d2] hover:bg-[rgba(18,30,23,0.85)] border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`material-symbols-outlined text-lg ${activeSectors.remera ? 'text-[#9ed3aa]' : 'text-[#8b938a]'}`}>
                            flight_takeoff
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-snug">Remera Airport Corridor</span>
                            <span className="text-xs opacity-80">KGL Intl Terminal &amp; Convention Ctr</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-lg">
                          {activeSectors.remera ? 'check_circle' : 'add_circle'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MTN MoMo Configuration */}
                  <div className="p-5 rounded-2xl bg-[rgba(18,30,23,0.7)] backdrop-blur-[12px] border border-white/10 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#ffcc00] flex items-center justify-center font-bold text-black text-xs shadow-sm">
                          MoMo
                        </div>
                        <div>
                          <span className="text-sm sm:text-base font-medium text-[#d9e6d2]">MTN Rwanda Mobile Money Payout</span>
                          <p className="text-xs text-[#c1c9bf]">Instant trip earnings settlement at 0% transfer commission</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-[#336443] text-[#9ed3aa] text-xs font-semibold flex items-center gap-1 border border-[#9ed3aa]/30 shadow-sm">
                        {pingState === 'pinging' ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                            Pinging MTN...
                          </>
                        ) : pingState === 'success' ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-[#9ed3aa]"></span>
                            50 RWF Verified ✓
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-[#9ed3aa]"></span>
                            Ping Verified
                          </>
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">MoMo Registered MSISDN</label>
                        <input 
                          className="bg-[rgba(18,30,23,0.85)] text-[#d9e6d2] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-[rgba(26,42,32,0.95)] focus:border-[#9ed3aa]/60 border border-white/10 font-mono font-medium" 
                          type="text" 
                          value={momoNumber}
                          onChange={(e) => setMomoNumber(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs uppercase tracking-wider text-[#c1c9bf] font-semibold">Account Holder Name</label>
                        <input 
                          className="bg-[rgba(18,30,23,0.85)] text-[#d9e6d2] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:bg-[rgba(26,42,32,0.95)] focus:border-[#9ed3aa]/60 border border-white/10 font-medium" 
                          type="text" 
                          value={momoHolder}
                          onChange={(e) => setMomoHolder(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                      <button 
                        type="button"
                        onClick={handleSaveMomoProfile}
                        className="px-5 py-2.5 rounded-xl bg-[#34A853] hover:bg-[#2c8d46] text-white text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save &amp; Broadcast MoMo Number</span>
                      </button>

                      <button 
                        type="button"
                        onClick={handleTestPing}
                        className="px-4 py-2 rounded-xl bg-[rgba(18,30,23,0.75)] hover:bg-[rgba(26,42,32,0.9)] text-[#9ed3aa] text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors border border-white/10 cursor-pointer shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">network_ping</span>
                        Send Test MoMo Ping (50 RWF)
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN: Holographic Pilot Credential Pass & Verification Checklist (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
                
                {/* Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#9ed3aa]">credit_card</span>
                    <h3 className="text-lg font-medium text-[#d9e6d2]">Live Credential Preview</h3>
                  </div>
                  <span className="text-xs text-[#8b938a] uppercase tracking-wider font-semibold">Hologram ID Pass</span>
                </div>

                {/* ANIMATED HOLOGRAPHIC 3D CARD */}
                <div 
                  className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[rgba(24,34,22,0.75)] via-[rgba(34,45,32,0.65)] to-[rgba(7,17,6,0.8)] backdrop-blur-[12px] shadow-2xl transition-all duration-500 hover:shadow-[#9ed3aa]/10 border border-white/15 group"
                  style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                  {/* Iridescent sweeping light effect */}
                  <div className="absolute -inset-full bg-gradient-to-r from-transparent via-[#9ed3aa]/15 to-transparent rotate-45 pointer-events-none group-hover:translate-x-full transition-all duration-1000"></div>

                  <div className="relative z-10 flex flex-col gap-6">
                    {/* ID Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#9ed3aa] text-[#02391c] flex items-center justify-center font-bold">
                          <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold tracking-wider text-[#d9e6d2]">J &amp; D SMOOTH RIDE</span>
                          <span className="text-[10px] text-[#9ed3aa] uppercase tracking-widest font-semibold">VIP Moto Pilot Concierge</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                        <span className="material-symbols-outlined text-[#9ed3aa] text-[14px]">shield</span>
                        <span className="text-[11px] font-semibold text-[#d9e6d2]">RURA 2024-KGL</span>
                      </div>
                    </div>

                    {/* ID Body with Pilot Headshot and Motorbike Thumbnail */}
                    <div className="flex items-start gap-4">
                      <div className="relative w-24 h-32 rounded-2xl overflow-hidden bg-black/60 flex-shrink-0 shadow-md border border-white/10">
                        <img 
                          className="w-full h-full object-cover" 
                          alt="Pilot Headshot" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuUk-vox_IZG80kti7zv9RuNeJhO7YrPAxv9W_rY7sUQN3XuzwlR9Bxr-W3GHPXHttpIWSjaWLe45iStQ6Arjy2JCjzgwDfYJkbth6ZvYuEcxJwrG54n2nXWaCP2-ibfjPbc1oq8hMBUbc4smmuLlXTCBNqRLOxxXiqhpU8GuzSkzqq_cJkolPU8qBxjQ8rq7h-X1Aaier2eHPJ12TlJSoP2ny8cwltibpXLHfZoTxHtwOqMfmsmxy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#9ed3aa] ring-2 ring-[#182216]"></div>
                      </div>

                      <div className="flex flex-col justify-between h-32 py-1 min-w-0 flex-1">
                        <div>
                          <span className="text-[11px] text-[#9ed3aa] uppercase tracking-widest font-semibold">Class A Concierge</span>
                          <h4 className="text-lg font-bold text-[#d9e6d2] tracking-tight truncate leading-tight mt-0.5">
                            {pilotName}
                          </h4>
                          <span className="text-xs text-[#c1c9bf] font-mono">Pilot ID: KGL-PILOT-8902</span>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-[#8b938a] tracking-wider font-semibold">Vehicle Assigned</span>
                            <span className="text-sm font-semibold text-[#9ed3aa] font-mono">{bikePlate}</span>
                          </div>
                          <div className="w-px h-6 bg-white/10"></div>
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-[#8b938a] tracking-wider font-semibold">Sector Hub</span>
                            <span className="text-sm font-medium text-[#d9e6d2]">Gasabo Alpha</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Moto thumbnail preview inside ID Card */}
                    <div className="p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-black/40 border border-white/10">
                          <img 
                            alt="Alpha MK1 Sport" 
                            className="w-full h-full object-cover" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3AdIEkf3oDabvF1ZhGEdl1euT31OVz3rfo0uCq10jiYJ9RXBZvxWNOKlAje7WoaX0ushtlS7L9LwYMQNIa4im9c68y9DY6lwhS3aLw-0mhxPrAnbNjGrAPtJcDoSFqv2jd4-PMgRPdeS2waqUiSzyS330RMbSvsK3AhfSKWcyGsML0UQRt5ZWcDrDh_1tz779Ovtl1zFmLXZZ5tne0VXwZAmmZK5jFVd_N91It7e4_TJj-GpEsuHlgRpOxziOhE8Kpw"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-[#d9e6d2] truncate">Alpha MK1 Sport (EV)</span>
                          <span className="text-[11px] text-[#c1c9bf] truncate">Telemetry Active • Kigali Fast Dispatch</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[#9ed3aa] text-[20px]">electric_bolt</span>
                    </div>

                    {/* Checkpoint QR & Holographic Status Strip */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {/* Inline QR Code SVG Mockup */}
                        <div className="w-12 h-12 p-1 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center">
                          <svg className="w-full h-full text-[#d9e6d2]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4 0h2v4h-2v-4zm4 4h4v2h-4v-2zm-4 2h2v2h-2v-2zm-2-6h2v2h-2v-2zm0 4h2v2h-2v-2zm6-4h2v2h-2v-2z"></path>
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#8b938a] uppercase tracking-wider font-semibold">Checkpoint Scan</span>
                          <span className="text-xs text-[#c1c9bf] font-mono font-semibold">2024-KGL-VERIF-OK</span>
                        </div>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-[#336443]/70 backdrop-blur-md text-[#a9dfb5] text-right border border-[#9ed3aa]/30">
                        <span className="text-[10px] uppercase font-bold tracking-wider block text-[#9ed3aa]">Credential State</span>
                        <span className="text-xs font-semibold tracking-wide">
                          {isActivated ? 'PILOT ACTIVE ✓' : 'PENDING FINAL CHECK'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance & Regulatory Checklist */}
                <div 
                  className="p-6 rounded-3xl bg-[rgba(18,30,23,0.65)] backdrop-blur-[12px] border border-white/10 flex flex-col gap-4 shadow-2xl"
                  style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[#d9e6d2] font-semibold">Onboarding Clearance Checklist</span>
                    <span className="text-xs text-[#9ed3aa] font-bold">3 of 3 Verified</span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(18,30,23,0.7)] border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#9ed3aa] text-[20px]">verified</span>
                        <div className="flex flex-col">
                          <span className="text-sm text-[#d9e6d2] font-medium leading-tight">Driving License Category A</span>
                          <span className="text-xs text-[#c1c9bf]">RURA &amp; Police Traffic verified</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[#9ed3aa]">done_all</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(18,30,23,0.7)] border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#9ed3aa] text-[20px]">sports_motorsports</span>
                        <div className="flex flex-col">
                          <span className="text-sm text-[#d9e6d2] font-medium leading-tight">Dual Sanitized Helmet Confirmation</span>
                          <span className="text-xs text-[#c1c9bf]">Pilot &amp; passenger headgear approved</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[#9ed3aa]">done_all</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(18,30,23,0.7)] border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#9ed3aa] text-[20px]">folder_shared</span>
                        <div className="flex flex-col">
                          <span className="text-sm text-[#d9e6d2] font-medium leading-tight">Criminal Record Clearance</span>
                          <span className="text-xs text-[#c1c9bf]">Irembo judicial extract certified</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[#9ed3aa]">done_all</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Card */}
                <div 
                  className="p-6 rounded-3xl bg-[rgba(18,30,23,0.65)] backdrop-blur-[12px] border border-white/10 flex flex-col gap-3 shadow-2xl"
                  style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                >
                  <button 
                    type="button"
                    disabled={isActivating}
                    onClick={handleCompleteOnboarding}
                    className={`w-full relative overflow-hidden group py-4 px-6 rounded-2xl font-semibold text-center flex items-center justify-center gap-3 shadow-lg transition-all duration-300 cursor-pointer ${
                      isActivated
                        ? 'bg-[#336443] text-[#a9dfb5] border border-[#9ed3aa]'
                        : 'bg-[#9ed3aa] text-[#02391c] hover:bg-[#b0dfbb] hover:shadow-[#9ed3aa]/25'
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2 font-medium text-base">
                      {isActivating ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                          <span>Syncing with Kigali Hub...</span>
                        </>
                      ) : isActivated ? (
                        <>
                          <span className="material-symbols-outlined text-xl">check_circle</span>
                          <span>Pilot Account Active!</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Profile &amp; Activate Account</span>
                          <span className="material-symbols-outlined group-hover:translate-x-1.5 transition-transform">arrow_forward</span>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      showToast('Draft progress saved to local Kigali dispatch cache.');
                      onClose();
                    }}
                    className="w-full py-3 px-6 rounded-2xl bg-[rgba(18,30,23,0.75)] hover:bg-[rgba(26,42,32,0.9)] text-[#c1c9bf] hover:text-[#d9e6d2] text-sm font-medium text-center transition-colors cursor-pointer border border-white/10"
                  >
                    Save &amp; Continue Later
                  </button>

                  <p className="text-center text-xs text-[#8b938a] mt-1 leading-relaxed">
                    By activating, you agree to the Kigali VIP Moto Pilot Service Standard Agreement and 24/7 GPS dispatch telemetry.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Real-Time Client Message Pop-up Notification in Rider Portal */}
      {incomingNotification && (
        <div className="fixed top-5 right-4 sm:right-8 z-[200] max-w-sm w-full bg-[#142617]/95 border-2 border-[#34A853] rounded-3xl p-4 shadow-2xl backdrop-blur-md animate-bounce-short text-[#d9e6d2]">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#34A853]/25 border border-[#34A853] flex items-center justify-center text-[#7de099] shrink-0">
                <MessageSquare className="w-4 h-4 text-[#34A853]" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[#86e29b] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping" />
                  <span>Incoming Passenger Message</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">{incomingNotification.clientName}</h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncomingNotification(null)}
              className="text-[#8b938a] hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#c1c9bf] bg-[#0c160c] p-2.5 rounded-xl border border-[#233522] mb-3 line-clamp-3">
            &ldquo;{incomingNotification.text}&rdquo;
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenChatWithClient({
                id: incomingNotification.clientId,
                name: incomingNotification.clientName,
                phone: incomingNotification.clientPhone,
              })}
              className="flex-1 py-2 bg-[#34A853] hover:bg-[#2c8d46] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply Now</span>
            </button>
            <button
              type="button"
              onClick={() => setIncomingNotification(null)}
              className="px-3 py-2 bg-[#1b2b1a] hover:bg-[#253e24] text-[#a1baa0] text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Direct Chat Modal for Rider */}
      <RiderClientChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        currentUserRole="rider"
        currentUserName={pilotName}
        currentUserPhone={phone}
        targetRider={{
          id: pilotData?.phone || 'pilot-jean-claude',
          name: pilotName,
          phone,
          momoNumber,
          bikePlate,
          bikeModel,
          sector: 'Kimihurura',
          district: 'Gasabo',
          rating: 4.98,
          tripsCount: 1420,
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          status: 'available',
          verified: true,
          sanitizedDualHelmets: true,
        }}
        targetClient={activeChatClient}
      />
    </div>
  );
};
