import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Share2, 
  PhoneCall, 
  MapPin, 
  Bike, 
  Radio, 
  CheckCircle2, 
  ExternalLink, 
  BatteryCharging, 
  Gauge, 
  Copy,
  Sparkles
} from 'lucide-react';
import { BookingState } from '../types';

interface GuardianAngelModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: BookingState | null;
}

export const GuardianAngelModal: React.FC<GuardianAngelModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [copied, setCopied] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);

  if (!isOpen) return null;

  const driverName = booking?.driver?.name || 'Jean-Damascene Mugisha';
  const plateNumber = booking?.driver?.plateNumber || 'RAC 412B';
  const pickup = booking?.pickup || 'Kigali Heights, Kimihurura';
  const dropoff = booking?.dropoff || 'Kigali International Airport';
  const shareTrackingUrl = `https://jdsmooth.rw/live-track/${booking?.id || 'RW-89210'}`;

  const shareText = `🛡️ J&D Smooth Ride - Guardian Angel Live Safety Share\n\nI am currently riding with verified driver ${driverName} (${plateNumber}).\n📍 From: ${pickup}\n🏁 To: ${dropoff}\n📡 Track my live moto GPS here: ${shareTrackingUrl}\n🚨 Rwanda Police: 112 | J&D Smooth SOS: +250 788 349 102`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleTriggerSOS = () => {
    setSosTriggered(true);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="guardian-angel-card"
        className="relative w-full max-w-xl bg-[#141e12] border border-[#85AB8B]/30 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#b9efc5]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2c382a] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#202e1e] border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa] shadow-inner">
              <ShieldAlert className="w-6 h-6 text-[#9ed3aa]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-podium uppercase">
                  Guardian Angel Live Safety Share
                </h2>
                <span className="text-[10px] bg-[#9ed3aa] text-[#02391c] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  24/7 Monitored
                </span>
              </div>
              <p className="text-xs text-[#c1c9bf]">
                Share your live moto trip with loved ones with 1 tap on WhatsApp or SMS.
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

        {/* Live Trip Telemetry Card */}
        <div className="bg-[#0b160a] border border-[#9ed3aa]/40 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2c382a] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#336443] flex items-center justify-center text-white font-bold text-xs">
                {driverName.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{driverName}</div>
                <div className="text-[10px] text-[#9ed3aa]">Plate: {plateNumber} • 4.95 ★</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#9ed3aa]">
              <Radio className="w-3.5 h-3.5 text-[#9ed3aa] animate-ping" />
              <span>Live GPS Broadcast</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#141e12] rounded-xl border border-[#2c382a]">
              <div className="text-[10px] text-[#85AB8B] uppercase font-bold">Current Speed</div>
              <div className="font-bold text-white mt-0.5 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-[#9ed3aa]" /> 42 km/h (Safe Zone)
              </div>
            </div>
            <div className="p-2.5 bg-[#141e12] rounded-xl border border-[#2c382a]">
              <div className="text-[10px] text-[#85AB8B] uppercase font-bold">Rider Phone Battery</div>
              <div className="font-bold text-[#9ed3aa] mt-0.5 flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5" /> 92% (Online)
              </div>
            </div>
          </div>
        </div>

        {/* Quick Share Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            onClick={handleShareWhatsApp}
            className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via WhatsApp</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="bg-[#1f2a1d] hover:bg-[#2c382a] text-white border border-[#9ed3aa]/30 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Copy className="w-4 h-4 text-[#9ed3aa]" />
            <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Live Link'}</span>
          </button>
        </div>

        {/* Emergency SOS Trigger */}
        <div className="bg-red-950/30 border border-red-800/40 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-red-300 uppercase">
              <PhoneCall className="w-4 h-4 text-red-400" />
              <span>Emergency 112 Hotline / Fast Dispatch</span>
            </div>
            <span className="text-[10px] text-red-400">Instant Alert</span>
          </div>

          <p className="text-xs text-red-200/80">
            Pressing SOS triggers instant Rwanda Police & J&D Control Room priority alert with your GPS coordinates.
          </p>

          {sosTriggered ? (
            <div className="p-3 bg-red-900/60 border border-red-500 rounded-xl text-center text-xs font-bold text-white animate-pulse">
              🚨 SOS Broadcasted to J&D Central Command & RNP (Rwanda National Police). Assistance dispatched.
            </div>
          ) : (
            <button
              onClick={handleTriggerSOS}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xl"
            >
              🚨 Trigger Immediate Emergency SOS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
