import React, { useRef, useEffect, useState } from 'react';
import { 
  Bike, 
  Package2, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Calculator,
  Mic,
  Camera,
  Mountain,
  MapPin,
  Smartphone,
  ShieldAlert,
  Building2,
  Radio
} from 'lucide-react';
import { JDSmoothLogo } from '../assets/logo';

interface HeroSectionProps {
  onOpenBooking: (type: 'ride' | 'delivery') => void;
  onOpenGuaranteeModal: () => void;
  onOpenPricingModal: () => void;
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
  isPaused?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBooking,
  onOpenGuaranteeModal,
  onOpenPricingModal,
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
  isPaused = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Pause video if portal modal is open to free GPU/CPU
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPaused) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [isPaused]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const playVideo = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
          })
          .catch(() => {
            // Autoplay might be deferred until user interacts with document
          });
      }
    };

    // Attempt autoplay immediately
    playVideo();

    // Also trigger on ready events
    video.addEventListener('loadeddata', playVideo);
    video.addEventListener('canplay', playVideo);
    video.addEventListener('playing', () => setIsVideoPlaying(true));

    const handleEnded = () => {
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    video.addEventListener('ended', handleEnded);

    // Fallback trigger if browser restricts silent autoplay until user touch or scroll
    const handleFirstInteraction = () => {
      playVideo();
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('scroll', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });

    return () => {
      if (video) {
        video.removeEventListener('loadeddata', playVideo);
        video.removeEventListener('canplay', playVideo);
        video.removeEventListener('ended', handleEnded);
      }
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-100px)] flex flex-col justify-center overflow-hidden">
      {/* Dynamic Background System: Motion Video, Animated Transit Beams & Topography */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Stationary, Hardware-Accelerated Video Layer (60fps stutter-free video playback) */}
        <div className="absolute inset-0 w-full h-full transform-gpu">
          {/* Instant-load High-Definition Kigali Nightscape Base Image */}
          <img
            src="/hero-bg.jpg"
            alt="Kigali Night City Transit"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${
              isVideoPlaying ? 'opacity-40' : 'opacity-85'
            }`}
            loading="eager"
          />

          {/* Ambient Motion Video (Streams smoothly with zero frame-dropping) */}
          <video
            ref={videoRef}
            id="bg-video"
            poster="/hero-bg.jpg"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-75 transform-gpu"
            muted
            playsInline
            autoPlay
            loop
            preload="metadata"
          >
            <source src="/hero-bg.webm" type="video/webm" />
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Clean Kigali Transit Road & Topographic Elevation Vectors (Static & GPU-optimized) */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="contourGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9ed3aa" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#336443" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#85AB8B" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="neonTransitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9ed3aa" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#b9efc5" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#336443" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Calm contour loops */}
          <circle cx="20%" cy="38%" r="22%" fill="none" stroke="url(#contourGrad)" strokeWidth="1.2" strokeDasharray="10 6" />
          <circle cx="20%" cy="38%" r="35%" fill="none" stroke="#9ed3aa" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="14 10" />
          <circle cx="82%" cy="28%" r="26%" fill="none" stroke="url(#contourGrad)" strokeWidth="1.2" strokeDasharray="8 6" />

          {/* Highway Light Streams */}
          <path 
            d="M -50 220 C 320 130, 620 300, 940 170 S 1420 250, 1980 190" 
            fill="none" 
            stroke="url(#contourGrad)" 
            strokeWidth="1.5" 
            strokeDasharray="16 12"
          />
          <path 
            d="M -50 220 C 320 130, 620 300, 940 170 S 1420 250, 1980 190" 
            fill="none" 
            stroke="url(#neonTransitGrad)" 
            strokeWidth="2" 
            strokeDasharray="80 320"
          />

          <path 
            d="M -50 380 C 360 260, 780 440, 1140 310 S 1640 400, 1980 330" 
            fill="none" 
            stroke="#85AB8B" 
            strokeOpacity="0.4" 
            strokeWidth="1.2" 
            strokeDasharray="20 10"
          />
          <path 
            d="M -50 380 C 360 260, 780 440, 1140 310 S 1640 400, 1980 330" 
            fill="none" 
            stroke="url(#neonTransitGrad)" 
            strokeWidth="1.8" 
            strokeDasharray="70 280"
          />

          <path 
            d="M -50 560 C 420 440, 840 620, 1260 480 S 1740 580, 1980 500" 
            fill="none" 
            stroke="#336443" 
            strokeOpacity="0.5" 
            strokeWidth="1.8" 
            strokeDasharray="14 8"
          />
        </svg>

        {/* Kigali Central Radar Scanner Sweep Ring - Clean & Fast */}
        <div className="absolute top-[35%] left-[22%] -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 pointer-events-none opacity-20">
          <div className="w-full h-full rounded-full border border-[#9ed3aa]/40" />
          <div className="absolute inset-0 rounded-full border border-[#9ed3aa]/20" />
        </div>

        {/* Subtle Ambient Transit Light Accents */}
        <div className="absolute top-[45%] left-[18%] w-2 h-2 rounded-full bg-[#9ed3aa]/70 pointer-events-none" />
        <div className="absolute top-[60%] left-[35%] w-1.5 h-1.5 rounded-full bg-[#b9efc5]/60 pointer-events-none" />
        <div className="absolute top-[30%] right-[25%] w-2 h-2 rounded-full bg-[#9ed3aa]/70 pointer-events-none" />
        <div className="absolute top-[70%] right-[15%] w-1.5 h-1.5 rounded-full bg-[#85AB8B]/60 pointer-events-none" />

        {/* Topographic GPS Dot Matrix Grid */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(158, 211, 170, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Ambient Emerald & Mint Atmospheric Radial Gradients */}
        <div 
          className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-30" 
          style={{ background: 'radial-gradient(circle, rgba(51, 100, 67, 0.35) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute top-1/3 right-10 w-[420px] h-[420px] rounded-full pointer-events-none opacity-25" 
          style={{ background: 'radial-gradient(circle, rgba(158, 211, 170, 0.25) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute bottom-10 left-10 w-[360px] h-[360px] rounded-full pointer-events-none opacity-25" 
          style={{ background: 'radial-gradient(circle, rgba(43, 78, 52, 0.3) 0%, transparent 70%)' }}
        />

        {/* Depth Vignette & Text Readability Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b160a]/75 via-[#0b160a]/40 to-[#0b160a]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#0b160a_92%)] pointer-events-none opacity-70" />
      </div>

      {/* Main Content */}
      <main 
        id="main-hero-container"
        className="relative z-10 flex-grow flex flex-col justify-center px-4 sm:px-8 md:px-12 w-full max-w-7xl mx-auto py-10 lg:py-14"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
          {/* Left Column: Hero Copy & Main CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center z-20">
            {/* Logo Badge & Live GPS Tag */}
            <div className="flex items-center gap-4 mb-5 animate-fade-up">
              <img 
                src={JDSmoothLogo} 
                alt="J & D Smooth Ride Logo" 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-[0_0_35px_rgba(158,211,170,0.35)] border-2 border-[#9ed3aa]/50 hover:scale-105 transition-transform cursor-pointer shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#9ed3aa] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#9ed3aa] animate-ping" />
                  Kigali Premier AI Moto Network
                </span>
                <span className="text-xs text-[#c1c9bf]">Zero Surge • Sanitized Gear • RURA Certified</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="custom-font-heading mb-4 text-[#d9e6d2] tracking-tight animate-fade-up delay-200">
              The smoothest way to{' '}
              <span className="text-[#85AB8B] bg-gradient-to-r from-[#9ed3aa] via-[#85AB8B] to-[#b9efc5] bg-clip-text text-transparent">
                ride and deliver across Kigali.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-[#c1c9bf] max-w-2xl mb-7 leading-relaxed font-normal animate-fade-up delay-300">
              Professional moto and instant package delivery with multilingual AI dispatch, sanitized fresh helmets, live topographic tracking, and instant MTN/Airtel MoMo checkout.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 animate-fade-up delay-400 mb-6">
              <button
                id="hero-book-ride-btn"
                onClick={() => onOpenBooking('ride')}
                className="bg-[#9ed3aa] hover:bg-[#b9efc5] text-[#02391c] font-bold px-6 sm:px-7 py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-xl flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
              >
                <Bike className="w-4 h-4 text-[#02391c]" />
                <span>Book a Ride</span>
              </button>

              <button
                id="hero-request-pickup-btn"
                onClick={() => onOpenBooking('delivery')}
                className="bg-[#2b4e34] hover:bg-[#336443] text-white border border-[#9ed3aa]/30 px-6 sm:px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
              >
                <Package2 className="w-4 h-4 text-[#9ed3aa]" />
                <span>Request Pickup</span>
              </button>

              {onOpenAiDispatch && (
                <button
                  onClick={onOpenAiDispatch}
                  className="bg-[#182216] hover:bg-[#202e1e] text-[#9ed3aa] hover:text-white border border-[#9ed3aa]/40 px-5 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
                >
                  <Mic className="w-4 h-4 text-[#9ed3aa]" />
                  <span>AI Voice Dispatch</span>
                </button>
              )}
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#414942]/30 max-w-xl">
              <div>
                <div className="font-podium text-2xl sm:text-3xl text-[#9ed3aa] font-bold">187+</div>
                <div className="text-[11px] uppercase tracking-wider text-[#c1c9bf] font-semibold">Active Riders</div>
              </div>
              <div>
                <div className="font-podium text-2xl sm:text-3xl text-[#9ed3aa] font-bold">2.1 min</div>
                <div className="text-[11px] uppercase tracking-wider text-[#c1c9bf] font-semibold">Average Pickup</div>
              </div>
              <div>
                <div className="font-podium text-2xl sm:text-3xl text-[#9ed3aa] font-bold">100%</div>
                <div className="text-[11px] uppercase tracking-wider text-[#c1c9bf] font-semibold">Sanitized Helmets</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive AI & Feature Suite Cards */}
          <div className="lg:col-span-5 flex flex-col gap-3 z-20 animate-fade-up delay-300">
            <div className="text-xs font-bold text-[#85AB8B] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#9ed3aa]" />
              <span>Next-Gen Kigali Smart Moto Features</span>
            </div>

            {/* Feature 1: Multilingual AI Voice Dispatcher */}
            <div 
              onClick={onOpenAiDispatch}
              className="bg-[#141e12]/90 hover:bg-[#1b2918] border border-[#85AB8B]/30 hover:border-[#9ed3aa] p-3.5 rounded-2xl cursor-pointer transition-all duration-200 shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#202e1e] flex items-center justify-center text-[#9ed3aa] group-hover:scale-105 transition-transform">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#9ed3aa] transition-colors flex items-center gap-1.5">
                      <span>Multilingual AI Voice Dispatcher</span>
                      <span className="text-[9px] bg-[#336443] text-white px-1.5 py-0.2 rounded font-bold">🇷🇼 Kinyarwanda / EN / FR</span>
                    </div>
                    <div className="text-[11px] text-[#c1c9bf]">Speak or type natural Kigali landmarks for instant dispatch</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#85AB8B] group-hover:text-white transition-colors shrink-0" />
              </div>
            </div>

            {/* Feature 2: AI Parcel & Luggage Scanner */}
            <div 
              onClick={onOpenParcelScanner}
              className="bg-[#141e12]/90 hover:bg-[#1b2918] border border-[#85AB8B]/30 hover:border-[#9ed3aa] p-3.5 rounded-2xl cursor-pointer transition-all duration-200 shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#202e1e] flex items-center justify-center text-[#9ed3aa] group-hover:scale-105 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#9ed3aa] transition-colors flex items-center gap-1.5">
                      <span>AI Luggage & Parcel Moto-Fit Scanner</span>
                      <span className="text-[9px] bg-[#9ed3aa] text-[#02391c] px-1.5 py-0.2 rounded font-extrabold">Vision AI</span>
                    </div>
                    <div className="text-[11px] text-[#c1c9bf]">Photo inspection for moto luggage rack safety & e-Waybill</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#85AB8B] group-hover:text-white transition-colors shrink-0" />
              </div>
            </div>

            {/* Feature 3: Live Kigali Topographic Map */}
            <div 
              onClick={onOpenKigaliMap}
              className="bg-[#141e12]/90 hover:bg-[#1b2918] border border-[#85AB8B]/30 hover:border-[#9ed3aa] p-3.5 rounded-2xl cursor-pointer transition-all duration-200 shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#202e1e] flex items-center justify-center text-[#9ed3aa] group-hover:scale-105 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#9ed3aa] transition-colors flex items-center gap-1.5">
                      <span>Live Kigali Topographic Cluster Map</span>
                      <span className="text-[9px] bg-[#2b4e34] text-[#9ed3aa] px-1.5 py-0.2 rounded font-bold">187+ GPS Nodes</span>
                    </div>
                    <div className="text-[11px] text-[#c1c9bf]">Explore real-time rider density across Gasabo, Kicukiro & Nyarugenge</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#85AB8B] group-hover:text-white transition-colors shrink-0" />
              </div>
            </div>

            {/* 2-Column Grid for Secondary Features */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Feature 4: Live Kigali Rain Radar */}
              <div 
                onClick={onOpenRainRadar}
                className="bg-[#141e12]/90 hover:bg-[#1b2918] border border-[#85AB8B]/30 hover:border-[#9ed3aa] p-3 rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#9ed3aa] animate-ping" />
                  <span className="text-xs font-bold text-white group-hover:text-[#9ed3aa] truncate">Rain Radar & Traction</span>
                </div>
                <p className="text-[10px] text-[#c1c9bf] line-clamp-2">Live precipitation map & free rain poncho auto-dispatch</p>
              </div>

              {/* Feature 5: Multi-Stop Drop Builder */}
              <div 
                onClick={onOpenMultiStop}
                className="bg-[#141e12]/90 hover:bg-[#1b2918] border border-[#85AB8B]/30 hover:border-[#9ed3aa] p-3 rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Package2 className="w-4 h-4 text-[#9ed3aa]" />
                  <span className="text-xs font-bold text-white group-hover:text-[#9ed3aa] truncate">Multi-Stop Drops</span>
                </div>
                <p className="text-[10px] text-[#c1c9bf] line-clamp-2">Deliver to up to 5 Kigali clients in a single hop</p>
              </div>

              {/* Feature 6: RURA Safety & Compliance Hub */}
              <div 
                onClick={onOpenRuraSafety}
                className="bg-[#141e12]/90 hover:bg-[#1b2918] border border-[#85AB8B]/30 hover:border-[#9ed3aa] p-3 rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#9ed3aa]" />
                  <span className="text-xs font-bold text-white group-hover:text-[#9ed3aa] truncate">RURA 2026 Safety</span>
                </div>
                <p className="text-[10px] text-[#c1c9bf] line-clamp-2">UV-C helmet hygiene, police record & license lookup</p>
              </div>

              {/* Feature 7: RRA EBM Tax Invoice */}
              <div 
                onClick={onOpenEbmReceipt}
                className="bg-[#141e12]/90 hover:bg-[#1b2918] border border-[#85AB8B]/30 hover:border-[#9ed3aa] p-3 rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-[#9ed3aa]" />
                  <span className="text-xs font-bold text-white group-hover:text-[#9ed3aa] truncate">RRA EBM Receipt</span>
                </div>
                <p className="text-[10px] text-[#c1c9bf] line-clamp-2">Instant certified VAT tax invoice with QR code</p>
              </div>

              {/* Feature 8: 1,000 Hills Fare Engine */}
              <div 
                onClick={onOpenTerrainFare}
                className="bg-[#141e12]/90 hover:bg-[#1b2918] border border-[#85AB8B]/30 hover:border-[#9ed3aa] p-3 rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Mountain className="w-4 h-4 text-[#9ed3aa]" />
                  <span className="text-xs font-bold text-white group-hover:text-[#9ed3aa] truncate">1,000 Hills Fare</span>
                </div>
                <p className="text-[10px] text-[#c1c9bf] line-clamp-2">Gradient & rain predictive transparent pricing</p>
              </div>

              {/* Feature 9: One-Tap MoMo USSD */}
              <div 
                onClick={onOpenMomoUssd}
                className="bg-[#141e12]/90 hover:bg-[#1b2918] border border-[#85AB8B]/30 hover:border-[#9ed3aa] p-3 rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-[#9ed3aa]" />
                  <span className="text-xs font-bold text-white group-hover:text-[#9ed3aa] truncate">One-Tap MoMo</span>
                </div>
                <p className="text-[10px] text-[#c1c9bf] line-clamp-2">Direct pilot MoMo payment to rider&apos;s verified profile</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
