import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Check, 
  Sparkles, 
  ArrowRight,
  Handshake,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { KIGALI_LOCATIONS, calculateDistanceKm } from '../data/kigaliLocations';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRouteForBooking: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onSelectRouteForBooking,
}) => {
  const [pickupId, setPickupId] = useState('kcc');
  const [dropoffId, setDropoffId] = useState('airport');

  if (!isOpen) return null;

  const distance = calculateDistanceKm(pickupId, dropoffId);

  const popularRoutes = [
    { from: 'Kigali Convention Centre', to: 'Kigali International Airport', km: 6.8 },
    { from: 'Kiyovu (City Centre)', to: 'Nyarutarama (MTN Centre)', km: 5.4 },
    { from: 'BK Arena (Remera)', to: 'Kimihurura (KCC)', km: 3.8 },
    { from: 'Downtown CHIC', to: 'Kacyiru (Embassies)', km: 4.2 },
    { from: 'Gishushu (RDB)', to: 'Nyamirambo Stadium', km: 7.5 },
    { from: 'Kagugu / SOS', to: 'Kigali Heights', km: 8.2 }
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        id="pricing-modal-card"
        className="relative w-full max-w-3xl bg-[#141e12] border border-[#85AB8B]/25 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#9ed3aa]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#2c382a] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#222d20] border border-[#9ed3aa]/20 flex items-center justify-center text-[#9ed3aa]">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Rider-Decided Fare Policy</span>
                <span className="text-[10px] font-semibold bg-[#2b4e34] text-[#b9efc5] px-2 py-0.5 rounded-full border border-[#9ed3aa]/30 uppercase">
                  Direct Agreement
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#c1c9bf]">
                In Kigali, the rider decides how much to charge based on the route — 0% platform cuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#c1c9bf] hover:text-white p-2 rounded-xl bg-[#1f2a1d] hover:bg-[#2c382a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Route Distance Sandbox */}
        <div className="bg-[#182216] p-5 sm:p-6 rounded-2xl border border-[#414942]/30 mb-6">
          <div className="text-xs uppercase font-bold text-[#85AB8B] tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Route Distance Estimator (Kigali Sectors)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-[#c1c9bf] mb-1">From (Sector)</label>
              <select
                value={pickupId}
                onChange={(e) => setPickupId(e.target.value)}
                className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9ed3aa]"
              >
                {KIGALI_LOCATIONS.map((loc) => (
                  <option key={`price-from-${loc.id}`} value={loc.id}>
                    {loc.name} ({loc.sector})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#c1c9bf] mb-1">To (Destination)</label>
              <select
                value={dropoffId}
                onChange={(e) => setDropoffId(e.target.value)}
                className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9ed3aa]"
              >
                {KIGALI_LOCATIONS.map((loc) => (
                  <option key={`price-to-${loc.id}`} value={loc.id}>
                    {loc.name} ({loc.sector})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fare Policy Banner */}
          <div className="p-4 rounded-xl bg-[#222d20] border border-[#9ed3aa]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#336443] text-[#9ed3aa] flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase font-bold text-[#9ed3aa]">Estimated Driving Distance</div>
                <div className="text-xl font-bold text-white">{distance} km <span className="text-xs text-[#c1c9bf] font-normal">via paved Kigali transit</span></div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-[#414942]/50 sm:pl-4">
              <div className="text-xs uppercase font-bold text-[#9ed3aa]">Pricing Model</div>
              <div className="text-sm font-bold text-white">Rider Decides Directly</div>
              <div className="text-[11px] text-[#c1c9bf]">Agreed upon booking</div>
            </div>
          </div>
        </div>

        {/* Popular Routes List */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#85AB8B] mb-3">
            Common Kigali Sectors &amp; Kilometers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {popularRoutes.map((r, i) => (
              <div 
                key={`common-route-${i}`}
                className="flex items-center justify-between p-3 rounded-xl bg-[#182216] border border-[#414942]/20 hover:border-[#9ed3aa]/40 transition-colors"
              >
                <div className="truncate pr-2">
                  <div className="font-semibold text-white truncate">{r.from}</div>
                  <div className="text-[#85AB8B] text-[11px] truncate">➔ {r.to} ({r.km} km)</div>
                </div>
                <span className="font-bold text-[#9ed3aa] shrink-0 text-xs px-2 py-1 rounded bg-[#336443]/40 border border-[#9ed3aa]/20">
                  Rider-Decided
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#182216] border border-[#414942]/20">
            <Check className="w-4 h-4 text-[#9ed3aa] shrink-0" />
            <span className="text-[#c1c9bf]">Direct MoMo: <strong className="text-white">Pay to Rider&apos;s Profile Number</strong></span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#182216] border border-[#414942]/20">
            <ShieldCheck className="w-4 h-4 text-[#9ed3aa] shrink-0" />
            <span className="text-[#c1c9bf]">Dual sanitized helmets on every moto</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#182216] border border-[#414942]/20">
            <Sparkles className="w-4 h-4 text-[#9ed3aa] shrink-0" />
            <span className="text-[#c1c9bf]">Zero hidden platform commission</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            onClose();
            onSelectRouteForBooking();
          }}
          className="w-full bg-[#9ed3aa] hover:bg-[#b0dfbb] text-[#02391c] py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[#9ed3aa]/20"
        >
          <span>Request Moto Ride &amp; Agree on Fare</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
