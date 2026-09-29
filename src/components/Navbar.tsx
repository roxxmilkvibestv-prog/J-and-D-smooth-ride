import React from 'react';
import { 
  Bike, 
  Package, 
  Calculator, 
  ShieldCheck, 
  UserPlus, 
  MapPin, 
  Menu, 
  X, 
  PhoneCall,
  Activity,
  LogIn,
  Sparkles,
  Users,
  FileSpreadsheet,
  Smartphone,
  Sliders
} from 'lucide-react';
import { ActiveTab, BookingState } from '../types';
import { JDSmoothLogo } from '../assets/logo';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenBooking: (type: 'ride' | 'delivery') => void;
  onOpenDriverModal: () => void;
  onOpenPricingModal: () => void;
  onOpenGuaranteeModal: () => void;
  activeBooking: BookingState | null;
  onOpenTracker: () => void;
  onOpenAiDispatch?: () => void;
  onOpenParcelScanner?: () => void;
  onOpenTerrainFare?: () => void;
  onOpenKigaliMap?: () => void;
  onOpenSafetyVerifier?: () => void;
  onOpenCorporatePass?: () => void;
  onOpenMomoUssd?: () => void;
  onOpenGuardianAngel?: () => void;
  onOpenRainRadar?: () => void;
  onOpenMultiStop?: () => void;
  onOpenRuraSafety?: () => void;
  onOpenEbmReceipt?: () => void;
  onOpenGoogleSheets?: () => void;
  onOpenSmsAlertSettings?: () => void;
  onOpenPilotPortal?: () => void;
  onOpenPilotLogin?: () => void;
  hasPilotAccount?: boolean;
  isPilotLoggedIn?: boolean;
  onOpenClientPortal?: () => void;
  onOpenClientLogin?: () => void;
  onOpenClientRegister?: () => void;
  hasClientAccount?: boolean;
  isClientLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBooking,
  onOpenDriverModal,
  onOpenPricingModal,
  onOpenGuaranteeModal,
  activeBooking,
  onOpenTracker,
  onOpenAiDispatch,
  onOpenParcelScanner,
  onOpenTerrainFare,
  onOpenKigaliMap,
  onOpenSafetyVerifier,
  onOpenCorporatePass,
  onOpenMomoUssd,
  onOpenGuardianAngel,
  onOpenRainRadar,
  onOpenMultiStop,
  onOpenRuraSafety,
  onOpenEbmReceipt,
  onOpenGoogleSheets,
  onOpenSmsAlertSettings,
  onOpenPilotPortal,
  onOpenPilotLogin,
  hasPilotAccount,
  isPilotLoggedIn,
  onOpenClientPortal,
  onOpenClientLogin,
  onOpenClientRegister,
  hasClientAccount,
  isClientLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      <nav 
        id="main-navbar"
        className="relative z-50 flex items-center justify-between px-5 sm:px-8 py-3 max-w-7xl mx-auto sticky top-3 rounded-full mt-3 w-[96%] sm:w-fit bg-[#182216]/90 backdrop-blur-xl border border-[#414942]/30 shadow-2xl transition-all"
      >
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('rides')}
          className="cursor-pointer flex items-center gap-2.5 select-none"
        >
          <img
            src={JDSmoothLogo}
            alt="J & D Smooth Ride"
            className="w-10 h-10 rounded-full object-cover border border-[#9ed3aa]/40 shadow-md shrink-0 hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
          <span className="font-podium text-xl sm:text-2xl uppercase tracking-wider text-[#d9e6d2] hover:text-[#9ed3aa] transition-colors">
            J & D Smooth Ride
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex gap-5 xl:gap-7 items-center text-sm font-medium">
          <button
            id="nav-tab-rides"
            onClick={() => {
              setActiveTab('rides');
              onOpenBooking('ride');
            }}
            className={`flex items-center gap-1.5 transition-all duration-200 ${
              activeTab === 'rides'
                ? 'text-[#9ed3aa] font-bold border-b-2 border-[#9ed3aa] pb-0.5'
                : 'text-[#c1c9bf] hover:text-[#9ed3aa]'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Rides</span>
          </button>

          <button
            id="nav-tab-deliveries"
            onClick={() => {
              setActiveTab('deliveries');
              onOpenBooking('delivery');
            }}
            className={`flex items-center gap-1.5 transition-all duration-200 ${
              activeTab === 'deliveries'
                ? 'text-[#9ed3aa] font-bold border-b-2 border-[#9ed3aa] pb-0.5'
                : 'text-[#c1c9bf] hover:text-[#9ed3aa]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Deliveries</span>
          </button>

          {/* AI Voice Dispatcher Trigger */}
          {onOpenAiDispatch && (
            <button
              onClick={onOpenAiDispatch}
              className="flex items-center gap-1.5 text-[#9ed3aa] bg-[#202e1e] hover:bg-[#336443] hover:text-white px-3 py-1 rounded-full border border-[#9ed3aa]/30 transition-all text-xs font-semibold"
            >
              <span className="w-2 h-2 rounded-full bg-[#9ed3aa] animate-pulse"></span>
              <span>AI Dispatcher</span>
            </button>
          )}

          {/* Live 3D Map Trigger */}
          {onOpenKigaliMap && (
            <button
              onClick={onOpenKigaliMap}
              className="text-[#c1c9bf] hover:text-[#9ed3aa] flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#85AB8B]" />
              <span>Kigali Map</span>
            </button>
          )}

          {/* Rain Radar Trigger */}
          {onOpenRainRadar && (
            <button
              onClick={onOpenRainRadar}
              className="text-[#c1c9bf] hover:text-[#9ed3aa] flex items-center gap-1.5 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#9ed3aa] animate-ping" />
              <span>Rain Radar</span>
            </button>
          )}

          {/* RURA Safety & Compliance */}
          {onOpenRuraSafety && (
            <button
              onClick={onOpenRuraSafety}
              className="text-[#c1c9bf] hover:text-[#9ed3aa] flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-[#85AB8B]" />
              <span>RURA Safety</span>
            </button>
          )}

          <button
            id="nav-tab-pricing"
            onClick={() => {
              setActiveTab('pricing');
              onOpenPricingModal();
            }}
            className={`flex items-center gap-1.5 transition-all duration-200 ${
              activeTab === 'pricing'
                ? 'text-[#9ed3aa] font-bold border-b-2 border-[#9ed3aa] pb-0.5'
                : 'text-[#c1c9bf] hover:text-[#9ed3aa]'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Pricing</span>
          </button>

          <button
            id="nav-tab-guarantee"
            onClick={() => {
              setActiveTab('guarantee');
              onOpenGuaranteeModal();
            }}
            className="text-[#c1c9bf] hover:text-[#9ed3aa] flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#85AB8B]" />
            <span>Guarantee</span>
          </button>

          <button
            id="nav-tab-about"
            onClick={() => {
              setActiveTab('about');
              const el = document.getElementById('about-us');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 transition-all duration-200 ${
              activeTab === 'about'
                ? 'text-[#9ed3aa] font-bold border-b-2 border-[#9ed3aa] pb-0.5'
                : 'text-[#c1c9bf] hover:text-[#9ed3aa]'
            }`}
          >
            <Users className="w-4 h-4 text-[#85AB8B]" />
            <span>About Us</span>
          </button>
        </div>

        {/* Action Group */}
        <div className="hidden md:flex items-center gap-2.5 ml-3 sm:ml-6">
          {activeBooking ? (
            <button
              id="nav-active-tracker-btn"
              onClick={onOpenTracker}
              className="flex items-center gap-2 bg-[#2b4e34] text-[#b9efc5] text-xs font-semibold px-3.5 py-2 rounded-full border border-[#9ed3aa]/40 hover:bg-[#336443] transition-all animate-pulse"
            >
              <Activity className="w-3.5 h-3.5 text-[#9ed3aa]" />
              <span>Live {activeBooking.type === 'ride' ? 'Ride' : 'Pickup'}</span>
            </button>
          ) : (
            onOpenGuardianAngel && (
              <button
                onClick={onOpenGuardianAngel}
                title="Guardian Angel Live Trip Share"
                className="p-2 rounded-full bg-[#1f2a1d] text-[#9ed3aa] hover:bg-[#336443] hover:text-white border border-[#9ed3aa]/30 transition-all text-xs flex items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden xl:inline text-[11px] font-bold">Guardian SOS</span>
              </button>
            )
          )}

          {isPilotLoggedIn && onOpenPilotPortal ? (
            <button
              id="nav-pilot-portal-btn"
              onClick={onOpenPilotPortal}
              className="bg-[#182216] hover:bg-[#222d20] text-[#9ed3aa] border border-[#9ed3aa]/50 text-xs uppercase tracking-wider font-semibold px-3.5 py-2.5 rounded-full shadow-md transition-all transform active:scale-95 flex items-center gap-1.5"
              title="Open Kigali Pilot Private Portal"
            >
              <span className="w-2 h-2 rounded-full bg-[#9ed3aa] animate-pulse" />
              <span>Pilot Portal</span>
            </button>
          ) : (
            onOpenPilotLogin && (
              <button
                id="nav-pilot-login-btn"
                onClick={onOpenPilotLogin}
                className={`text-xs uppercase tracking-wider font-semibold px-3.5 py-2.5 rounded-full transition-all transform active:scale-95 flex items-center gap-1.5 ${
                  hasPilotAccount
                    ? 'bg-[#182216] hover:bg-[#222d20] text-[#9ed3aa] border border-[#9ed3aa]/40'
                    : 'bg-[#141e12] hover:bg-[#1f2a1d] text-[#c1c9bf] border border-[#414942]/50'
                }`}
                title="Log In to Kigali Pilot Account"
              >
                <LogIn className="w-3.5 h-3.5 text-[#9ed3aa]" />
                <span>Pilot Login</span>
              </button>
            )
          )}

          {/* Client Portal Button */}
          {isClientLoggedIn && onOpenClientPortal ? (
            <button
              id="nav-client-portal-btn"
              onClick={onOpenClientPortal}
              className="bg-[#182216] hover:bg-[#222d20] text-[#9ed3aa] border border-[#9ed3aa]/50 text-xs uppercase tracking-wider font-semibold px-3.5 py-2.5 rounded-full shadow-md transition-all transform active:scale-95 flex items-center gap-1.5"
              title="Open Kigali Client Private Portal"
            >
              <span className="w-2 h-2 rounded-full bg-[#9ed3aa] animate-pulse" />
              <span>Client Portal</span>
            </button>
          ) : (
            (onOpenClientRegister || onOpenClientPortal) && (
              <button
                id="nav-client-login-btn"
                onClick={onOpenClientRegister || onOpenClientPortal}
                className="bg-[#141e12] hover:bg-[#1f2a1d] text-[#c1c9bf] hover:text-[#9ed3aa] border border-[#414942]/50 text-xs uppercase tracking-wider font-semibold px-3.5 py-2.5 rounded-full transition-all transform active:scale-95 flex items-center gap-1.5"
                title="Create Client Account & Access Private Portal"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#9ed3aa]" />
                <span>Client Portal</span>
              </button>
            )
          )}

          {/* Google Sheets Workspace Trigger */}
          {onOpenGoogleSheets && (
            <button
              id="nav-google-sheets-btn"
              onClick={onOpenGoogleSheets}
              className="bg-[#142314] hover:bg-[#1a331a] text-[#86e29b] border border-[#34A853]/40 text-xs uppercase tracking-wider font-semibold px-3 py-2 rounded-full shadow-sm transition-all transform active:scale-95 flex items-center gap-1.5"
              title="Google Sheets Live Fleet & Dispatches"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#34A853]" />
              <span className="hidden xl:inline">Google Sheets</span>
            </button>
          )}

          {/* SMS Alert Settings Trigger */}
          {onOpenSmsAlertSettings && (
            <button
              id="nav-sms-settings-btn"
              onClick={onOpenSmsAlertSettings}
              className="bg-[#182315] hover:bg-[#23341f] text-amber-300 border border-amber-500/40 text-xs uppercase tracking-wider font-semibold px-3 py-2 rounded-full shadow-sm transition-all transform active:scale-95 flex items-center gap-1.5"
              title="SMS Alert Settings & API Consumption Toggles"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">SMS Alerts</span>
            </button>
          )}

          <button
            id="nav-join-rider-btn"
            onClick={onOpenDriverModal}
            className="bg-[#336443] hover:bg-[#3d7751] text-white text-xs uppercase tracking-wider font-semibold px-4 py-2.5 rounded-full hover:shadow-lg hover:shadow-[#336443]/30 transition-all transform active:scale-95 flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Join as Rider</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          id="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-[#9ed3aa] p-1.5 rounded-lg bg-[#1f2a1d] hover:bg-[#2c382a] transition-colors"
          aria-label="Open Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div
        id="mobile-drawer"
        className={`fixed inset-y-0 right-0 z-[70] w-80 bg-[#182216] border-l border-[#414942]/30 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col p-6 space-y-3 overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center pb-3 border-b border-[#2c382a]">
          <div className="flex items-center gap-2 font-bold text-base text-[#9ed3aa]">
            <img
              src={JDSmoothLogo}
              alt="J & D Smooth Ride"
              className="w-8 h-8 rounded-full object-cover border border-[#9ed3aa]/40"
              referrerPolicy="no-referrer"
            />
            <span className="font-podium uppercase tracking-wider text-[#d9e6d2]">J & D Smooth Ride</span>
          </div>
          <button
            id="close-menu-btn"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#9ed3aa] p-1 rounded-lg hover:bg-[#2c382a]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col space-y-2 flex-grow pt-1">
          {/* AI Dispatcher button in mobile */}
          {onOpenAiDispatch && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAiDispatch();
              }}
              className="w-full text-left text-[#02391c] bg-[#9ed3aa] font-bold flex items-center gap-3 p-3 rounded-xl shadow-md"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#02391c] animate-ping" />
              <span>Multilingual AI Dispatcher</span>
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveTab('rides');
              onOpenBooking('ride');
            }}
            className="w-full text-left text-white font-semibold flex items-center gap-3 p-2.5 rounded-xl bg-[#222d20] hover:bg-[#2c382a] transition-colors text-xs"
          >
            <Bike className="w-4 h-4 text-[#9ed3aa]" />
            <span>Book a Ride</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveTab('deliveries');
              onOpenBooking('delivery');
            }}
            className="w-full text-left text-[#d9e6d2] font-semibold flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2c382a] transition-colors text-xs"
          >
            <Package className="w-4 h-4 text-[#9ed3aa]" />
            <span>Request Delivery Pickup</span>
          </button>

          {/* Rain Radar in mobile */}
          {onOpenRainRadar && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRainRadar();
              }}
              className="w-full text-left text-[#d9e6d2] font-semibold flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2c382a] transition-colors text-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#9ed3aa] animate-ping" />
              <span>Kigali Rain Radar & Road Traction</span>
            </button>
          )}

          {/* Multi-Stop in mobile */}
          {onOpenMultiStop && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMultiStop();
              }}
              className="w-full text-left text-[#d9e6d2] font-semibold flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2c382a] transition-colors text-xs"
            >
              <Package className="w-4 h-4 text-[#85AB8B]" />
              <span>Multi-Stop Package Drops (Up to 5)</span>
            </button>
          )}

          {/* RURA Safety in mobile */}
          {onOpenRuraSafety && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRuraSafety();
              }}
              className="w-full text-left text-[#d9e6d2] font-semibold flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2c382a] transition-colors text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#85AB8B]" />
              <span>RURA 2026 Safety & Driver Hub</span>
            </button>
          )}

          {/* EBM Receipt in mobile */}
          {onOpenEbmReceipt && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEbmReceipt();
              }}
              className="w-full text-left text-[#d9e6d2] font-semibold flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2c382a] transition-colors text-xs"
            >
              <Calculator className="w-4 h-4 text-[#85AB8B]" />
              <span>RRA EBM Digital Tax Invoice</span>
            </button>
          )}

          {/* Google Sheets in mobile */}
          {onOpenGoogleSheets && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGoogleSheets();
              }}
              className="w-full text-left text-[#9ed3aa] font-semibold flex items-center gap-3 p-2.5 rounded-xl bg-[#142314] hover:bg-[#1f331f] transition-colors text-xs border border-[#34A853]/30"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#34A853]" />
              <span>Google Sheets Master Fleet & Dispatches</span>
            </button>
          )}

          {/* SMS Alert Settings & API Controls in mobile */}
          {onOpenSmsAlertSettings && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSmsAlertSettings();
              }}
              className="w-full text-left text-amber-300 font-semibold flex items-center gap-3 p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-950/70 transition-colors text-xs border border-amber-500/40 shadow-xs"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>SMS Alert Settings &amp; API Controls</span>
            </button>
          )}

          {/* AI Features list in mobile drawer */}
          {onOpenParcelScanner && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenParcelScanner();
              }}
              className="w-full text-left text-[#d9e6d2] font-semibold flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2c382a] transition-colors text-xs"
            >
              <Package className="w-4 h-4 text-[#85AB8B]" />
              <span>AI Parcel & Moto-Fit Scanner</span>
            </button>
          )}

          {onOpenKigaliMap && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenKigaliMap();
              }}
              className="w-full text-left text-[#d9e6d2] font-semibold flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2c382a] transition-colors text-xs"
            >
              <MapPin className="w-4 h-4 text-[#85AB8B]" />
              <span>Live Kigali Topographic Map</span>
            </button>
          )}

          {onOpenTerrainFare && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTerrainFare();
              }}
              className="w-full text-left text-[#d9e6d2] font-semibold flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2c382a] transition-colors text-xs"
            >
              <Calculator className="w-4 h-4 text-[#85AB8B]" />
              <span>1,000 Hills & Rain Fare Engine</span>
            </button>
          )}

          {onOpenSafetyVerifier && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSafetyVerifier();
              }}
              className="w-full text-left text-[#d9e6d2] font-semibold flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2c382a] transition-colors text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#85AB8B]" />
              <span>Driver Helmet Hygiene Verifier</span>
            </button>
          )}

          {onOpenCorporatePass && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCorporatePass();
              }}
              className="w-full text-left text-[#d9e6d2] font-semibold flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2c382a] transition-colors text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#85AB8B]" />
              <span>Corporate & Commuter Pass</span>
            </button>
          )}

          {onOpenGuardianAngel && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGuardianAngel();
              }}
              className="w-full text-left text-[#d9e6d2] font-semibold flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#2c382a] transition-colors text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#85AB8B]" />
              <span>Guardian Angel Live Safety</span>
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setActiveTab('about');
              const el = document.getElementById('about-us');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full text-left text-[#9ed3aa] font-semibold flex items-center gap-3 p-2.5 rounded-xl bg-[#1b2719] hover:bg-[#222d20] border border-[#9ed3aa]/30 transition-colors text-xs"
          >
            <Users className="w-4 h-4 text-[#9ed3aa]" />
            <span>About Us &amp; Leadership</span>
          </button>

          <div className="mt-auto pt-4 border-t border-[#2c382a] space-y-2">
            {isPilotLoggedIn && onOpenPilotPortal ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPilotPortal();
                }}
                className="w-full bg-[#182216] border border-[#9ed3aa]/50 text-[#9ed3aa] py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#222d20] transition-colors shadow-lg text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#9ed3aa] animate-pulse" />
                <span>Open Pilot Private Portal</span>
              </button>
            ) : (
              onOpenPilotLogin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPilotLogin();
                  }}
                  className="w-full bg-[#182216] border border-[#414942]/70 text-[#9ed3aa] py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#222d20] transition-colors shadow-lg text-xs"
                >
                  <LogIn className="w-4 h-4 text-[#9ed3aa]" />
                  <span>Pilot Login</span>
                </button>
              )
            )}

            {/* Mobile Client Portal option */}
            {isClientLoggedIn && onOpenClientPortal ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenClientPortal();
                }}
                className="w-full bg-[#182216] border border-[#9ed3aa]/50 text-[#9ed3aa] py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#222d20] transition-colors shadow-lg text-xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#9ed3aa] animate-pulse" />
                <span>Open Client Private Portal</span>
              </button>
            ) : (
              (onOpenClientRegister || onOpenClientPortal) && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenClientRegister) onOpenClientRegister();
                    else if (onOpenClientPortal) onOpenClientPortal();
                  }}
                  className="w-full bg-[#141e12] border border-[#414942]/70 text-[#9ed3aa] py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#222d20] transition-colors shadow-lg text-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#9ed3aa]" />
                  <span>Client Private Portal</span>
                </button>
              )
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDriverModal();
              }}
              className="w-full bg-[#336443] text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#3d7751] transition-colors shadow-lg text-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Join as Rider</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:0796569416"
                className="border border-[#414942] text-[#c1c9bf] py-2 rounded-xl font-medium flex items-center justify-center gap-1.5 text-[11px] hover:text-[#9ed3aa]"
              >
                <PhoneCall className="w-3 h-3 text-[#9ed3aa]" />
                <span>Call Hotline</span>
              </a>
              <a
                href={`sms:+250796569416?body=${encodeURIComponent("Muraho J&D Support!\nName: [Your Name]\nPhone: [Your Phone]\nInquiry: ")}`}
                className="border border-amber-500/40 bg-amber-950/20 text-amber-300 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 text-[11px] hover:text-white"
                title="Direct SMS to dispatch desk with Name & Number template"
              >
                <Smartphone className="w-3 h-3 text-amber-400" />
                <span>Direct SMS</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] md:hidden"
        />
      )}
    </>
  );
};
