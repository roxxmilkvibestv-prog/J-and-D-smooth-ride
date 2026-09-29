import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  DollarSign, 
  MapPin, 
  Clock, 
  HeartHandshake,
  ArrowRight,
  Headphones
} from 'lucide-react';

interface SmoothGuaranteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookRide: () => void;
}

export const SmoothGuaranteeModal: React.FC<SmoothGuaranteeModalProps> = ({
  isOpen,
  onClose,
  onBookRide,
}) => {
  if (!isOpen) return null;

  const pillars = [
    {
      icon: <Sparkles className="w-6 h-6 text-[#9ed3aa]" />,
      title: 'Sanitized Helmets & Hairnets',
      description: 'Every driver carries hospital-grade sanitized helmets and supplies sealed, fresh disposable hairnets for zero hygiene compromise.'
    },
    {
      icon: <DollarSign className="w-6 h-6 text-[#9ed3aa]" />,
      title: 'Zero Surge & Fair MoMo Pricing',
      description: 'Our rates are strictly calculated per kilometer upfront. No random price doubling during rain or rush hours at Kigali Heights.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#9ed3aa]" />,
      title: 'Passenger Accident Insurance',
      description: 'Every trip booked through J & D MotoElite is backed by comprehensive passenger transit insurance coverage.'
    },
    {
      icon: <Clock className="w-6 h-6 text-[#9ed3aa]" />,
      title: '3-Minute Kigali Average ETA',
      description: 'With hundreds of active vetted riders stationed across Gasabo, Kicukiro, and Nyarugenge, prompt pickup is guaranteed.'
    },
    {
      icon: <Headphones className="w-6 h-6 text-[#9ed3aa]" />,
      title: '24/7 Dedicated Kigali Helpline',
      description: 'Instant resolution for lost items, driver inquiries, or corporate billing from our central operations hub in Kimihurura.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        id="smooth-guarantee-modal-card"
        className="relative w-full max-w-2xl bg-[#141e12] border border-[#85AB8B]/25 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#9ed3aa]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#2c382a] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#222d20] border border-[#9ed3aa]/20 flex items-center justify-center text-[#9ed3aa]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>The Smooth Guarantee™</span>
                <span className="text-[10px] font-semibold bg-[#2b4e34] text-[#b9efc5] px-2 py-0.5 rounded-full uppercase">
                  Our Pledge
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#c1c9bf]">Raising the bar for safety, hygiene, and transparency across Rwanda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#c1c9bf] hover:text-white p-2 rounded-xl bg-[#1f2a1d] hover:bg-[#2c382a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pillars List */}
        <div className="space-y-3.5 mb-6">
          {pillars.map((p, idx) => (
            <div key={idx} className="bg-[#182216] p-4 rounded-2xl border border-[#414942]/30 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#222d20] flex items-center justify-center shrink-0 border border-[#9ed3aa]/20">
                {p.icon}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white mb-0.5">{p.title}</h3>
                <p className="text-xs text-[#c1c9bf] leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#2c382a]">
          <div className="text-xs text-[#85AB8B] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#9ed3aa]" />
            <span>Trusted by over 40,000+ Kigali commuters</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onBookRide();
            }}
            className="w-full sm:w-auto bg-[#336443] hover:bg-[#3d7751] text-white font-bold px-7 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            <span>Experience Smooth Ride</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
