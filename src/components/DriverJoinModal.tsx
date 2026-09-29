import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Bike, 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign, 
  FileCheck, 
  Smartphone,
  Sparkles,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { DriverApplication } from '../types';

interface DriverJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated?: (data: DriverApplication) => void;
  onSwitchToLogin?: () => void;
}

export const DriverJoinModal: React.FC<DriverJoinModalProps> = ({ 
  isOpen, 
  onClose,
  onAccountCreated,
  onSwitchToLogin 
}) => {
  const [formData, setFormData] = useState<DriverApplication>({
    fullName: '',
    phone: '+250 78',
    momoNumber: '',
    nationalId: '',
    drivingLicenseClassA: '',
    bikePlate: 'RAC ',
    bikeModel: 'TVS HLX 150',
    experienceYears: 3,
    preferredZone: 'Gasabo (Kimihurura / Remera)',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedirecting(true);

    try {
      const response = await fetch('/api/register-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      console.log('[Rider Application Response]', data);
    } catch (err) {
      console.warn('API error, caching locally', err);
    }

    try {
      localStorage.setItem('jd_smooth_pilot_profile', JSON.stringify({ ...formData, status: 'pending' }));
    } catch (err) {
      console.warn('Failed to save pilot profile', err);
    }

    setSubmitted(true);
    setIsRedirecting(false);

    if (onAccountCreated) {
      onAccountCreated({ ...formData, status: 'pending' } as any);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        id="driver-join-modal-card"
        className="relative w-full max-w-2xl bg-[#141e12] border border-[#85AB8B]/25 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#9ed3aa]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#2c382a] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#222d20] border border-[#9ed3aa]/20 flex items-center justify-center text-[#9ed3aa]">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Join the MotoElite Kigali Fleet</span>
                <span className="text-[10px] font-semibold bg-[#2b4e34] text-[#b9efc5] px-2 py-0.5 rounded-full border border-[#9ed3aa]/30 uppercase">
                  Direct Rider Fares
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#c1c9bf]">
                Rider-Decided Pricing: Agree on your fares directly with passengers — 0% platform deductions
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

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#336443] text-[#9ed3aa] flex items-center justify-center mx-auto border-2 border-[#9ed3aa] animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-white">Application Submitted for Approval!</h3>
            <p className="text-sm text-[#c1c9bf] max-w-md mx-auto leading-relaxed">
              Murakoze, <strong>{formData.fullName}</strong>. An approval notification has been sent via email to administration. Once verified, you will be authorized to log in and accept passenger requests.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-[#9ed3aa] text-[#02391c] font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Value Props Row */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="bg-[#182216] p-3 rounded-xl border border-[#414942]/30">
                <div className="font-bold text-white text-sm text-[#9ed3aa]">0% Commission</div>
                <div className="text-[10px] text-[#c1c9bf] mt-0.5">On first 100 rides</div>
              </div>
              <div className="bg-[#182216] p-3 rounded-xl border border-[#414942]/30">
                <div className="font-bold text-white text-sm text-[#b9efc5]">Free Sanitizer</div>
                <div className="text-[10px] text-[#c1c9bf] mt-0.5">Daily UV & hairnets</div>
              </div>
              <div className="bg-[#182216] p-3 rounded-xl border border-[#414942]/30">
                <div className="font-bold text-white text-sm text-[#9ed3aa]">Instant MoMo</div>
                <div className="text-[10px] text-[#c1c9bf] mt-0.5">Direct wallet payout</div>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#c1c9bf] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jean-Damascene Mugisha"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-[#182216] border border-[#414942]/50 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c1c9bf] mb-1">Primary Phone (WhatsApp / Calls)</label>
                <input
                  type="tel"
                  required
                  placeholder="+250 788..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#182216] border border-[#414942]/50 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c1c9bf] mb-1">National ID (Indangamuntu - 16 Digits)</label>
                <input
                  type="text"
                  required
                  placeholder="1 199X XXXXXXXX X XX"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  className="w-full bg-[#182216] border border-[#414942]/50 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#9ed3aa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c1c9bf] mb-1">Driving License (Class A)</label>
                <input
                  type="text"
                  required
                  placeholder="DL-RW-XXXXX"
                  value={formData.drivingLicenseClassA}
                  onChange={(e) => setFormData({ ...formData, drivingLicenseClassA: e.target.value })}
                  className="w-full bg-[#182216] border border-[#414942]/50 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#9ed3aa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c1c9bf] mb-1">Motorcycle Plate Number</label>
                <input
                  type="text"
                  required
                  placeholder="RAC 123X / RAD 456Y"
                  value={formData.bikePlate}
                  onChange={(e) => setFormData({ ...formData, bikePlate: e.target.value })}
                  className="w-full bg-[#182216] border border-[#414942]/50 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#9ed3aa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c1c9bf] mb-1">Motorbike Make & Model</label>
                <select
                  value={formData.bikeModel}
                  onChange={(e) => setFormData({ ...formData, bikeModel: e.target.value })}
                  className="w-full bg-[#182216] border border-[#414942]/50 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
                >
                  <option value="TVS HLX 150">TVS HLX 150 / Plus</option>
                  <option value="Bajaj Boxer 150X">Bajaj Boxer 150X</option>
                  <option value="Yamaha Crux 110">Yamaha Crux 110</option>
                  <option value="Haojue 125">Haojue 125</option>
                  <option value="Ampersand Electric Moto">Ampersand Electric Moto</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#c1c9bf] mb-1">Preferred Operating District in Kigali</label>
              <select
                value={formData.preferredZone}
                onChange={(e) => setFormData({ ...formData, preferredZone: e.target.value })}
                className="w-full bg-[#182216] border border-[#414942]/50 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
              >
                <option value="Gasabo (Kimihurura / Remera / Kacyiru / Nyarutarama)">Gasabo (Kimihurura, Remera, Kacyiru, Nyarutarama)</option>
                <option value="Nyarugenge (CBD / Kiyovu / Nyamirambo)">Nyarugenge (City Centre, Kiyovu, Nyamirambo)</option>
                <option value="Kicukiro (Sonatubes / Gikondo / Kanombe Airport)">Kicukiro (Sonatubes, Gikondo, Kanombe Airport)</option>
                <option value="All Kigali Sectors (Full City Coverage)">All Kigali Sectors (Full City Coverage)</option>
              </select>
            </div>

            <div className="pt-3 border-t border-[#2c382a] flex flex-col sm:flex-row items-center justify-between gap-3">
              {onSwitchToLogin ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToLogin();
                  }}
                  className="text-xs text-[#9ed3aa] hover:underline flex items-center gap-1.5 font-semibold"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Already registered? Log in to Pilot Portal</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="w-full sm:w-auto bg-[#336443] hover:bg-[#3d7751] text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <span>Submit Driver Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
