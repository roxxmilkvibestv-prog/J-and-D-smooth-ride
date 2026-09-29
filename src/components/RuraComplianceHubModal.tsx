import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Award, 
  FileCheck, 
  CheckCircle2, 
  Lock, 
  Users, 
  PhoneCall, 
  Sparkles,
  Search,
  Bike,
  Download
} from 'lucide-react';

interface RuraComplianceHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuraComplianceHubModal: React.FC<RuraComplianceHubModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchPlate, setSearchPlate] = useState('RAC 412B');
  const [searchedRider, setSearchedRider] = useState<{
    name: string;
    plate: string;
    ruraBadge: string;
    licenseClass: string;
    insuranceProvider: string;
    insuranceExpiry: string;
    criminalClearanceDate: string;
    uvSterilizationTime: string;
    rating: number;
    status: 'ACTIVE_COMPLIANT' | 'NEEDS_RENEWAL';
  } | null>({
    name: 'Jean-Damascene Mugisha',
    plate: 'RAC 412B',
    ruraBadge: 'RURA-KGL-2026-8841',
    licenseClass: 'Class A (Full Heavy Moto Endorsement)',
    insuranceProvider: 'Sanlam / Radiant Rwanda Comprehensive',
    insuranceExpiry: '31 Dec 2026 (Active)',
    criminalClearanceDate: 'Rwanda National Police (RNP) Verified - Jan 2026',
    uvSterilizationTime: 'Today, 06:15 AM (UV-C Chamber 100% Pass)',
    rating: 4.98,
    status: 'ACTIVE_COMPLIANT',
  });

  const handleSearchDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchPlate.trim().toUpperCase();
    if (!query) return;

    // Simulate real-time RURA / Police database lookup
    setSearchedRider({
      name: query.includes('842') ? 'Eric Nshimiyimana' : 'Jean-Damascene Mugisha',
      plate: query,
      ruraBadge: `RURA-KGL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      licenseClass: 'Class A Commercial Passenger Transport',
      insuranceProvider: 'Radiant Insurance Co. Ltd (Third Party & Passenger)',
      insuranceExpiry: '15 Nov 2026 (Active & Paid)',
      criminalClearanceDate: 'RNP Judicial Record Good Conduct Clear',
      uvSterilizationTime: 'Today at Shift Start (Pass)',
      rating: 4.96,
      status: 'ACTIVE_COMPLIANT',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="rura-compliance-hub-card"
        className="relative w-full max-w-3xl bg-[#141e12] border border-[#85AB8B]/30 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#ffd700]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2c382a] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#202e1e] border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa] shadow-inner">
              <ShieldCheck className="w-6 h-6 text-[#9ed3aa]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-podium uppercase">
                  RURA Compliance & Safety Hub
                </h2>
                <span className="text-[10px] bg-[#9ed3aa] text-[#02391c] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  Official 2026 Standards
                </span>
              </div>
              <p className="text-xs text-[#c1c9bf]">
                Rwanda Utilities Regulatory Authority (RURA) standards, verified rider credentials, and passenger insurance.
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

        {/* 4 Pillars of J&D Safety */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <div className="p-3 bg-[#0d160c] border border-[#2c382a] rounded-2xl text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#182216] mx-auto flex items-center justify-center text-[#9ed3aa]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">UV-C Sterilization</div>
            <div className="text-[10px] text-[#85AB8B]">100% daily sanitized helmets</div>
          </div>

          <div className="p-3 bg-[#0d160c] border border-[#2c382a] rounded-2xl text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#182216] mx-auto flex items-center justify-center text-[#9ed3aa]">
              <FileCheck className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">Class A License</div>
            <div className="text-[10px] text-[#85AB8B]">RURA & Police Certified</div>
          </div>

          <div className="p-3 bg-[#0d160c] border border-[#2c382a] rounded-2xl text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#182216] mx-auto flex items-center justify-center text-[#9ed3aa]">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">Full Insurance</div>
            <div className="text-[10px] text-[#85AB8B]">Comprehensive passenger cover</div>
          </div>

          <div className="p-3 bg-[#0d160c] border border-[#2c382a] rounded-2xl text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#182216] mx-auto flex items-center justify-center text-[#9ed3aa]">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white">112 Police SOS</div>
            <div className="text-[10px] text-[#85AB8B]">Instant dispatch link</div>
          </div>
        </div>

        {/* Real-time Rider License & Helmet Verification Lookup */}
        <div className="p-4 bg-[#0d160c] border border-[#2c382a] rounded-2xl mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#9ed3aa]" />
              <span>Verify Any Kigali Rider or License Plate</span>
            </div>
            <span className="text-[10px] text-[#85AB8B]">Live RURA Database Sync</span>
          </div>

          <form onSubmit={handleSearchDriver} className="flex gap-2">
            <input
              type="text"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value)}
              placeholder="e.g. RAC 412B or RAD 842X"
              className="flex-grow bg-[#182216] border border-[#2c382a] focus:border-[#9ed3aa] rounded-xl px-3 py-2 text-xs font-bold text-white uppercase placeholder-[#616c5e] focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#336443] hover:bg-[#3d7751] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verify Credentials</span>
            </button>
          </form>

          {/* Searched Rider Certificate Card */}
          {searchedRider && (
            <div className="p-3.5 bg-[#141e12] border border-[#9ed3aa]/40 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#2c382a] pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#1f2a1d] border border-[#9ed3aa]/40 flex items-center justify-center text-[#9ed3aa] font-bold text-xs">
                    JD
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{searchedRider.name}</div>
                    <div className="text-[10px] text-[#85AB8B] font-mono">{searchedRider.plate} • {searchedRider.ruraBadge}</div>
                  </div>
                </div>

                <span className="text-[10px] bg-[#9ed3aa] text-[#02391c] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  100% Compliant
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-[#0b160a] rounded-lg border border-[#2c382a]/60">
                  <span className="text-[#85AB8B] block text-[10px]">License & Permit:</span>
                  <span className="font-semibold text-white">{searchedRider.licenseClass}</span>
                </div>
                <div className="p-2 bg-[#0b160a] rounded-lg border border-[#2c382a]/60">
                  <span className="text-[#85AB8B] block text-[10px]">Insurance Policy:</span>
                  <span className="font-semibold text-[#b9efc5]">{searchedRider.insuranceProvider} ({searchedRider.insuranceExpiry})</span>
                </div>
                <div className="p-2 bg-[#0b160a] rounded-lg border border-[#2c382a]/60">
                  <span className="text-[#85AB8B] block text-[10px]">Criminal Record Check:</span>
                  <span className="font-semibold text-white">{searchedRider.criminalClearanceDate}</span>
                </div>
                <div className="p-2 bg-[#0b160a] rounded-lg border border-[#2c382a]/60">
                  <span className="text-[#85AB8B] block text-[10px]">Daily UV Helmet Sanitization:</span>
                  <span className="font-semibold text-white">{searchedRider.uvSterilizationTime}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RURA Guarantee Statement */}
        <div className="p-3 bg-[#182216] border border-[#2c382a] rounded-2xl text-[11px] text-[#c1c9bf] flex items-center justify-between gap-3">
          <span>Official RURA Transportation License No: <strong>RURA/TR/2026/0491</strong></span>
          <a
            href="tel:112"
            className="text-[#9ed3aa] font-bold hover:underline shrink-0"
          >
            Emergency 112
          </a>
        </div>
      </div>
    </div>
  );
};
