import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  Bike, 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Zap,
  Lock
} from 'lucide-react';
import { DriverApplication } from '../types';

interface DriverLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (pilot: DriverApplication) => void;
  onSwitchToRegister?: () => void;
}

export const DriverLoginModal: React.FC<DriverLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedPilot, setSavedPilot] = useState<DriverApplication | null>(null);

  // Check for any previously registered or active pilot in localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('jd_smooth_pilot_profile');
        if (stored) {
          const parsed = JSON.parse(stored);
          setSavedPilot(parsed);
          // Pre-fill phone if available
          if (parsed.phone) {
            setIdentifier(parsed.phone);
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved pilot profile', e);
      }
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your Kigali Pilot Phone number or National ID.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/driver-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, phone: cleanId })
      });
      const data = await response.json();

      setIsSubmitting(false);

      if (data.success && data.driver) {
        if (rememberMe) {
          try {
            localStorage.setItem('jd_smooth_pilot_profile', JSON.stringify(data.driver));
            localStorage.setItem('jd_smooth_pilot_session', 'true');
          } catch (err) {}
        }
        onLoginSuccess(data.driver);
        onClose();
      } else if (data.pending) {
        setErrorMessage(data.error || 'Your application is awaiting administrative email approval. An email has been sent to the manager.');
      } else if (savedPilot && (savedPilot.phone?.includes(cleanId) || savedPilot.nationalId?.includes(cleanId))) {
        onLoginSuccess(savedPilot);
        onClose();
      } else {
        setErrorMessage(data.error || 'No registered driver account found. Please submit your application below to join.');
      }
    } catch (err) {
      setIsSubmitting(false);
      if (savedPilot && (savedPilot.phone?.includes(cleanId) || savedPilot.nationalId?.includes(cleanId))) {
        onLoginSuccess(savedPilot);
        onClose();
      } else {
        setErrorMessage('Unable to verify pilot account. Please register your account below.');
      }
    }
  };

  const handleQuickLogin = (pilot: DriverApplication) => {
    setIsSubmitting(true);
    setTimeout(() => {
      try {
        localStorage.setItem('jd_smooth_pilot_profile', JSON.stringify(pilot));
      } catch (err) {
        console.warn('Failed to update session', err);
      }
      setIsSubmitting(false);
      onLoginSuccess(pilot);
      onClose();
    }, 450);
  };

  return (
    <div 
      className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="driver-login-title"
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
                Kigali Pilot Dispatch
              </span>
              <h2 id="driver-login-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Pilot Portal Log In
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#c1c9bf] leading-relaxed">
            Injira muri Konti: Access your Kigali telemetry, active trip dispatch queue, and MTN MoMo wallet payouts.
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Quick 1-Click Login Card for Last Active/Registered Pilot */}
          {savedPilot && (
            <div className="p-4 rounded-2xl bg-[#1c2a1a] border border-[#9ed3aa]/40 shadow-md">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs text-[#9ed3aa] font-bold uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 fill-[#9ed3aa]" />
                  <span>Quick Re-Login</span>
                </div>
                <span className="text-[10px] text-[#8b938a] bg-[#141e12] px-2 py-0.5 rounded-full border border-[#414942]/40">
                  Active On Device
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#336443] text-white flex items-center justify-center font-bold text-sm border border-[#9ed3aa]/50 shrink-0">
                    {savedPilot.fullName.charAt(0) || 'P'}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-white truncate">
                      {savedPilot.fullName}
                    </p>
                    <p className="text-xs text-[#c1c9bf] truncate">
                      {savedPilot.phone} • {savedPilot.bikePlate || 'Kigali Moto'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickLogin(savedPilot)}
                  className="bg-[#336443] hover:bg-[#3d7751] active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
              </div>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleFormLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#c1c9bf] uppercase tracking-wider mb-1.5">
                Pilot Phone Number or National ID (NIDA)
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-[#9ed3aa] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="+250 788 123 456 or 1 199X X..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#0b160a] border border-[#414942]/60 focus:border-[#9ed3aa] focus:ring-1 focus:ring-[#9ed3aa] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-[#5d675b] transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#c1c9bf] uppercase tracking-wider">
                  Pilot Security PIN / Passcode
                </label>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#9ed3aa] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-[#0b160a] border border-[#414942]/60 focus:border-[#9ed3aa] focus:ring-1 focus:ring-[#9ed3aa] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-[#5d675b] transition-all outline-none tracking-widest"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#c1c9bf] hover:text-white">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#414942] bg-[#0b160a] text-[#336443] focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember me on this phone/browser</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#336443] hover:bg-[#3d7751] active:scale-[0.99] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-[#336443]/30 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Kigali Pilot Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Private Pilot Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Registration */}
          <div className="pt-3 border-t border-[#2c382a] flex items-center justify-between text-xs">
            <span className="text-[#8b938a]">New Kigali moto rider?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onSwitchToRegister) onSwitchToRegister();
              }}
              className="text-[#9ed3aa] font-bold hover:underline flex items-center gap-1"
            >
              <span>Join as Rider (Register Moto)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
