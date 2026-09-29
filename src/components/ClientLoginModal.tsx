import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  LogIn, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  Lock,
  User
} from 'lucide-react';
import { ClientAccount } from '../types';

interface ClientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (client: ClientAccount) => void;
  onSwitchToRegister?: () => void;
}

export const ClientLoginModal: React.FC<ClientLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
}) => {
  const [phone, setPhone] = useState('');
  const [passcode, setPasscode] = useState('');
  const [savedClient, setSavedClient] = useState<ClientAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('jd_smooth_client_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSavedClient(parsed);
          if (parsed.phone) setPhone(parsed.phone);
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone) {
      setLoading(false);
      setError('Please enter your registered phone number.');
      return;
    }

    try {
      const response = await fetch('/api/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await response.json();

      setLoading(false);
      if (data.success && data.client) {
        try {
          localStorage.setItem('jd_smooth_client_profile', JSON.stringify(data.client));
          localStorage.setItem('jd_smooth_client_session', 'true');
        } catch (err) {}
        onLoginSuccess(data.client);
        onClose();
      } else if (savedClient && (savedClient.phone.replace(/\s+/g, '').includes(cleanPhone) || cleanPhone.includes(savedClient.phone.replace(/\s+/g, '')))) {
        onLoginSuccess(savedClient);
        onClose();
      } else {
        setError(data.error || 'No client account found with this phone number. Please register below.');
      }
    } catch (err) {
      setLoading(false);
      if (savedClient) {
        onLoginSuccess(savedClient);
        onClose();
      } else {
        setError('No account found. Please register a new client profile.');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-login-title"
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
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9ed3aa] px-2 py-0.5 rounded bg-[#336443]/30 border border-[#9ed3aa]/30 inline-block">
                Kigali VIP Concierge
              </span>
              <h2 id="client-login-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Client Portal Log In
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#c1c9bf] leading-relaxed">
            Access your VIP passenger pass, fast-track dispatch, trip receipts, and zero-fee direct Rider MoMo checkout.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Saved profile quick entry */}
          {savedClient && (
            <div className="mb-5 p-4 rounded-xl bg-[#1b2b1a] border border-[#336443]/60 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#336443] text-white flex items-center justify-center font-bold text-xs border border-[#9ed3aa]/40 shrink-0">
                  {savedClient.fullName.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{savedClient.fullName}</p>
                  <p className="text-[11px] text-[#9ed3aa]">{savedClient.phone} • VIP Passenger</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess(savedClient);
                  onClose();
                }}
                className="px-3.5 py-1.5 bg-[#9ed3aa] hover:bg-[#b0dfbb] text-[#02391c] font-bold text-xs rounded-full shrink-0 flex items-center gap-1 active:scale-95 transition-all shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#c1c9bf] mb-1.5 font-semibold">
                Registered Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85AB8B]" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+250 78X XXX XXX"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(18,30,23,0.85)] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#9ed3aa] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#c1c9bf] mb-1.5 font-semibold">
                Security PIN or Passcode (Optional)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85AB8B]" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(18,30,23,0.85)] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#9ed3aa] font-mono"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#9ed3aa] hover:bg-[#b0dfbb] text-[#02391c] font-bold px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Verifying Client Account...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Enter Client Portal</span>
                  </>
                )}
              </button>
            </div>

            {onSwitchToRegister && (
              <div className="pt-4 border-t border-[#2c382a] text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToRegister();
                  }}
                  className="text-xs text-[#c1c9bf] hover:text-white hover:underline"
                >
                  Don't have a Client Account yet? <span className="text-[#9ed3aa] font-bold">Register Now</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
