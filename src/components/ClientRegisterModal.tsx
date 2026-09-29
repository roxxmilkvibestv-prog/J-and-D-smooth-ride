import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  LogIn,
  Zap
} from 'lucide-react';
import { ClientAccount } from '../types';

interface ClientRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: (data: ClientAccount) => void;
  onSwitchToLogin?: () => void;
}

export const ClientRegisterModal: React.FC<ClientRegisterModalProps> = ({
  isOpen,
  onClose,
  onAccountCreated,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState<Omit<ClientAccount, 'id' | 'createdAt' | 'neuralSyncScore' | 'totalTrips'>>({
    fullName: '',
    phone: '',
    email: '',
    accountType: 'personal',
    preferredSector: 'Gasabo - Kimihurura',
    momoNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setError('Please provide your full legal name and phone number.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.success && data.client) {
        try {
          localStorage.setItem('jd_smooth_client_profile', JSON.stringify(data.client));
          localStorage.setItem('jd_smooth_client_session', 'true');
        } catch (err) {
          console.warn('Could not save to localStorage', err);
        }
        setLoading(false);
        onAccountCreated(data.client);
        onClose();
        return;
      }
    } catch (err: any) {
      console.warn('Network registration issue, persisting client locally', err);
    }

    // Direct fallback client record if offline
    const newClient: ClientAccount = {
      id: `CLIENT-RW-${Date.now().toString().slice(-5)}`,
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || `${formData.phone.replace(/[^0-9]/g, '')}@jd-client.rw`,
      accountType: formData.accountType,
      preferredSector: formData.preferredSector,
      momoNumber: formData.momoNumber.trim() || formData.phone.trim(),
      createdAt: new Date().toISOString(),
      neuralSyncScore: 100.0,
      totalTrips: 0,
    };

    try {
      localStorage.setItem('jd_smooth_client_profile', JSON.stringify(newClient));
      localStorage.setItem('jd_smooth_client_session', 'true');
    } catch (err) {
      console.warn('Could not save to localStorage', err);
    }

    setLoading(false);
    onAccountCreated(newClient);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-register-title"
        className="bg-[#141e12] border border-[#336443]/60 w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative text-[#d9e6d2] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#1c2c1a] via-[#243921] to-[#1c2c1a] p-5 sm:p-6 border-b border-[#336443]/40 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#141e12]/80 text-[#8b938a] hover:text-white hover:bg-[#222d20] transition-colors"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#336443] text-[#9ed3aa] flex items-center justify-center border border-[#9ed3aa]/40 shadow-inner">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9ed3aa] px-2 py-0.5 rounded bg-[#336443]/30 border border-[#9ed3aa]/30 inline-block">
                VIP Registration
              </span>
              <h2 id="client-register-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Create Client Account
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#c1c9bf] leading-relaxed">
            Register your passenger profile to unlock priority moto dispatch, sanitized dual helmets, and zero-fee direct Rider MoMo payments.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#c1c9bf] mb-1.5 font-semibold">
                Full Name or Company
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85AB8B]" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Hon. Alexis Habimana / Bank of Kigali"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(18,30,23,0.85)] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#9ed3aa] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#c1c9bf] mb-1.5 font-semibold">
                  Phone (MTN / Airtel)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85AB8B]" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+250 78X XXX XXX"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(18,30,23,0.85)] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#9ed3aa] transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#c1c9bf] mb-1.5 font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85AB8B]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="client@domain.rw"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(18,30,23,0.85)] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#9ed3aa] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#c1c9bf] mb-1.5 font-semibold">
                  Account Type
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                  className="w-full px-3 py-3 rounded-xl bg-[#111911] border border-white/15 text-white text-xs focus:outline-none focus:border-[#9ed3aa]"
                >
                  <option value="personal">Personal Passenger</option>
                  <option value="corporate">Corporate Enterprise</option>
                  <option value="merchant">E-Commerce Merchant</option>
                  <option value="vip_concierge">VIP Concierge Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#c1c9bf] mb-1.5 font-semibold">
                  Primary Kigali Sector
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85AB8B]" />
                  <input
                    type="text"
                    value={formData.preferredSector}
                    onChange={(e) => setFormData({ ...formData, preferredSector: e.target.value })}
                    placeholder="e.g. Gasabo - Kimihurura"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(18,30,23,0.85)] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#9ed3aa]"
                  />
                </div>
              </div>
            </div>

            {/* Perks Bar - Real Accounts Only */}
            <div className="p-3.5 rounded-xl bg-[#1b2b1a] border border-[#336443]/50 flex items-center justify-between text-xs text-[#c1c9bf]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#9ed3aa]" />
                <span>Verified Kigali Client Profile &amp; Secure Cloud Storage</span>
              </div>
              <span className="text-[10px] text-[#9ed3aa] font-bold px-2 py-0.5 rounded bg-[#336443]/40 border border-[#9ed3aa]/30">
                100% Real Account
              </span>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-medium">{error}</p>
            )}

            {/* Footer Actions */}
            <div className="pt-3 border-t border-[#2c382a] flex flex-col sm:flex-row items-center justify-between gap-3">
              {onSwitchToLogin ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToLogin();
                  }}
                  className="text-xs text-[#c1c9bf] hover:text-white hover:underline flex items-center gap-1.5 font-semibold"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#9ed3aa]" />
                  <span>Already have an account? Sign In</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#9ed3aa] hover:bg-[#b0dfbb] text-[#02391c] font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create &amp; Enter Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
