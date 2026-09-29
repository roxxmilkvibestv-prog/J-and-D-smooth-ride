import React from 'react';
import { Bike, ShieldCheck, MapPin, Phone, Mail, Clock, Heart, Smartphone, Sliders } from 'lucide-react';
import { JDSmoothLogo } from '../assets/logo';

interface FooterProps {
  onOpenGuarantee: () => void;
  onOpenDriverModal: () => void;
  onOpenPricing: () => void;
  onOpenAiDispatch?: () => void;
  onOpenParcelScanner?: () => void;
  onOpenTerrainFare?: () => void;
  onOpenKigaliMap?: () => void;
  onOpenSafetyVerifier?: () => void;
  onOpenCorporatePass?: () => void;
  onOpenRainRadar?: () => void;
  onOpenMultiStop?: () => void;
  onOpenRuraSafety?: () => void;
  onOpenEbmReceipt?: () => void;
  onOpenSmsAlertSettings?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenGuarantee,
  onOpenDriverModal,
  onOpenPricing,
  onOpenAiDispatch,
  onOpenParcelScanner,
  onOpenTerrainFare,
  onOpenKigaliMap,
  onOpenSafetyVerifier,
  onOpenCorporatePass,
  onOpenRainRadar,
  onOpenMultiStop,
  onOpenRuraSafety,
  onOpenEbmReceipt,
  onOpenSmsAlertSettings,
}) => {
  return (
    <footer 
      id="main-footer"
      className="relative z-10 w-full border-t border-[#414942]/20 bg-[#141e12] text-[#d9e6d2] mt-auto"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 font-bold text-xl text-[#9ed3aa]">
              <img
                src={JDSmoothLogo}
                alt="J & D Smooth Ride"
                className="w-10 h-10 rounded-full object-cover border border-[#9ed3aa]/40 shadow-inner shrink-0"
                referrerPolicy="no-referrer"
              />
              <span className="text-white font-podium uppercase tracking-wider">J & D Smooth</span>
            </div>
            <p className="text-xs text-[#c1c9bf] leading-relaxed">
              J & D Smooth Ride and Instant Pickup Logistics. Kigali’s premier high-hygiene moto transit network with guaranteed fixed MoMo tariffs.
            </p>
            <div className="text-[11px] text-[#85AB8B] flex items-center gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>KG 674 St, Kimihurura, Kigali, Rwanda</span>
            </div>
          </div>

          {/* Quick AI & Innovation Links */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#85AB8B]">AI & Innovation Suite</div>
            <ul className="space-y-2 text-xs text-[#c1c9bf]">
              {onOpenAiDispatch && (
                <li>
                  <button onClick={onOpenAiDispatch} className="hover:text-[#9ed3aa] transition-colors text-left">
                    Multilingual Voice Dispatcher
                  </button>
                </li>
              )}
              {onOpenParcelScanner && (
                <li>
                  <button onClick={onOpenParcelScanner} className="hover:text-[#9ed3aa] transition-colors text-left">
                    AI Parcel & Luggage Scanner
                  </button>
                </li>
              )}
              {onOpenKigaliMap && (
                <li>
                  <button onClick={onOpenKigaliMap} className="hover:text-[#9ed3aa] transition-colors text-left">
                    Live Kigali Topographic Map
                  </button>
                </li>
              )}
              {onOpenTerrainFare && (
                <li>
                  <button onClick={onOpenTerrainFare} className="hover:text-[#9ed3aa] transition-colors text-left">
                    1,000 Hills & Rain Fare Engine
                  </button>
                </li>
              )}
              {onOpenSafetyVerifier && (
                <li>
                  <button onClick={onOpenSafetyVerifier} className="hover:text-[#9ed3aa] transition-colors text-left">
                    Driver Helmet Hygiene Verifier
                  </button>
                </li>
              )}
              {onOpenRainRadar && (
                <li>
                  <button onClick={onOpenRainRadar} className="hover:text-[#9ed3aa] transition-colors text-left">
                    Live Rain Radar & Road Traction
                  </button>
                </li>
              )}
              {onOpenMultiStop && (
                <li>
                  <button onClick={onOpenMultiStop} className="hover:text-[#9ed3aa] transition-colors text-left">
                    Multi-Stop Kigali Package Drops
                  </button>
                </li>
              )}
              {onOpenRuraSafety && (
                <li>
                  <button onClick={onOpenRuraSafety} className="hover:text-[#9ed3aa] transition-colors text-left">
                    RURA 2026 Compliance Hub
                  </button>
                </li>
              )}
              {onOpenEbmReceipt && (
                <li>
                  <button onClick={onOpenEbmReceipt} className="hover:text-[#9ed3aa] transition-colors text-left">
                    RRA EBM Digital Tax Invoices
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Corporate & Fleet */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#85AB8B]">Services & Plans</div>
            <ul className="space-y-2 text-xs text-[#c1c9bf]">
              <li>
                <button onClick={onOpenGuarantee} className="hover:text-[#9ed3aa] transition-colors">
                  Smooth Guarantee™
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const el = document.getElementById('about-us');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-[#9ed3aa] transition-colors"
                >
                  About Us &amp; Leadership
                </button>
              </li>
              <li>
                <button onClick={onOpenPricing} className="hover:text-[#9ed3aa] transition-colors">
                  Kigali Fare Matrix
                </button>
              </li>
              {onOpenCorporatePass && (
                <li>
                  <button onClick={onOpenCorporatePass} className="hover:text-[#9ed3aa] transition-colors">
                    Corporate & Commuter Pass
                  </button>
                </li>
              )}
              <li>
                <button onClick={onOpenDriverModal} className="hover:text-[#9ed3aa] transition-colors">
                  Join Driver Fleet (Class A)
                </button>
              </li>
            </ul>
          </div>

          {/* Operations & Hotline */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#85AB8B]">Operations & Help</div>
            <ul className="space-y-2 text-xs text-[#c1c9bf]">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#9ed3aa]" />
                <a href="tel:0796569416" className="hover:text-white">0796569416 (24/7)</a>
              </li>
              <li className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <a 
                  href={`sms:+250796569416?body=${encodeURIComponent("Muraho J&D Support!\nName: [Your Name]\nPhone: [Your Phone]\nInquiry: ")}`} 
                  className="text-amber-300 hover:text-white font-semibold"
                  title="Direct SMS to live dispatch desk (Remember to include your Name & Phone)"
                >
                  Direct SMS: 0796569416
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#9ed3aa]" />
                <a 
                  href={`mailto:corneliustch@gmail.com?subject=${encodeURIComponent("J&D Customer Care Inquiry")}&body=${encodeURIComponent("Muraho Support Team,\n\nName: [Your Name]\nPhone: [Your Phone]\n\nInquiry: ")}`} 
                  className="hover:text-white"
                  title="Email Customer Care (Remember to include your Name & Phone)"
                >
                  corneliustch@gmail.com
                </a>
              </li>
              {onOpenSmsAlertSettings && (
                <li>
                  <button 
                    onClick={onOpenSmsAlertSettings} 
                    className="text-amber-300 hover:text-white transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                    title="Configure SMS Alert Settings & API Consumption Toggles"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>SMS Alert Settings (API Quota)</span>
                  </button>
                </li>
              )}
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#9ed3aa]" />
                <span>Operating 24/7 across Kigali</span>
              </li>
              <li className="text-[11px] text-[#85AB8B]">
                Direct MoMo: <strong className="text-white">Pay directly to selected rider&apos;s verified profile</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-[#414942]/20 flex flex-col md:flex-row justify-between items-center text-xs text-[#c1c9bf] gap-4">
          <div>
            © {new Date().getFullYear()} J & D Smooth Ride & Pickup (MotoElite Logistics Rwanda Ltd). All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenGuarantee(); }} className="hover:text-[#9ed3aa] transition-colors">
              Privacy Policy
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenGuarantee(); }} className="hover:text-[#9ed3aa] transition-colors">
              Terms of Service
            </a>
            <a href="tel:0796569416" className="hover:text-[#9ed3aa] transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
