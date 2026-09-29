import React, { useState, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTopic, setActiveTopic] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen) return null;

  const topics = [
    { title: 'Sanitized Helmets & UV Care', desc: 'Each helmet is treated with hospital-grade disinfectant between trips. Passengers receive individual sealed disposable hairnets.' },
    { title: 'Fixed Fair MoMo Rates', desc: 'Pre-calculated distance pricing without street negotiation or surge inflation. Instant cashless payment with MTN/Airtel MoMo.' },
    { title: 'Vetted Kigali Drivers', desc: '100% Class A licensed Rwandan drivers with clean police records, defensive riding certification, and daily bike safety audits.' }
  ];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="video-explainer-modal-card"
        className="relative w-full max-w-3xl bg-[#141e12] border border-[#85AB8B]/25 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#9ed3aa]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2c382a] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#222d20] border border-[#9ed3aa]/20 flex items-center justify-center text-[#9ed3aa]">
              <Play className="w-5 h-5 fill-[#9ed3aa]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>How MotoElite Operates</span>
                <span className="text-[10px] font-semibold bg-[#2b4e34] text-[#b9efc5] px-2 py-0.5 rounded-full uppercase">
                  Safety Tour
                </span>
              </h2>
              <p className="text-xs text-[#c1c9bf]">Kigali's cleanest & most dependable two-wheel transit standard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#c1c9bf] hover:text-white p-2 rounded-xl bg-[#1f2a1d] hover:bg-[#2c382a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-[#414942]/40 shadow-2xl mb-5 group aspect-video">
          <video
            ref={videoRef}
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4"
            className="w-full h-full object-cover"
            autoPlay
            loop
            playsInline
            muted={isMuted}
          />

          {/* Video Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 pointer-events-none">
            <div className="flex justify-between items-center pointer-events-auto">
              <span className="text-xs font-semibold bg-[#182216]/80 text-[#9ed3aa] px-2.5 py-1 rounded-full border border-[#9ed3aa]/30">
                HD 1080p • Kigali Fleet
              </span>
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-[#182216]/80 text-white hover:text-[#9ed3aa] transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between pointer-events-auto">
              <button
                onClick={togglePlay}
                className="p-3 rounded-full bg-[#336443] text-white hover:bg-[#3d7751] transition-transform hover:scale-110 shadow-lg"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              <div className="text-xs text-white/80 font-mono">
                0:45 / 1:35
              </div>
            </div>
          </div>
        </div>

        {/* Operating Standards Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topics.map((t, idx) => (
            <div
              key={idx}
              onClick={() => setActiveTopic(idx)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                activeTopic === idx
                  ? 'bg-[#2b4e34] border-[#9ed3aa] text-white shadow-md'
                  : 'bg-[#182216] border-[#414942]/30 text-[#c1c9bf] hover:border-[#85AB8B]/40'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-[#9ed3aa] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.title}</span>
              </div>
              <p className="text-[11px] text-[#c1c9bf] leading-relaxed line-clamp-3">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
