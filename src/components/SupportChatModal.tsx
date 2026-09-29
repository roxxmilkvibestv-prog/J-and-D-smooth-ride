import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  UserCheck, 
  User,
  ArrowDown,
  Phone, 
  AlertCircle, 
  Sparkles, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  Minimize2,
  Maximize2,
  RefreshCw,
  MapPin,
  Coins,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Headphones,
  MessageCircle,
  ExternalLink,
  Minus,
  Zap,
  Info,
  ArrowUpRight,
  Bike,
  Package2,
  Mail,
  Copy,
  Check,
  Smartphone,
  Sliders
} from 'lucide-react';
import { studioAudio } from '../utils/studioAudio';

export const WHATSAPP_SUPPORT_URL = 'https://wa.me/message/ILBNJCGAXZL3I1';
export const CUSTOMER_CARE_EMAIL = 'corneliustch@gmail.com';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'human_dispatch' | 'care_email';
  content: string;
  timestamp: string;
  isSms?: boolean;
  smsRecipient?: string;
  smsUrl?: string;
  isEmail?: boolean;
  emailRecipient?: string;
  mailtoUrl?: string;
  isEmailError?: boolean;
}

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRideBooking?: () => void;
  onOpenDeliveryBooking?: () => void;
  onOpenSmsAlertSettings?: () => void;
  userPhone?: string;
  userName?: string;
  initialFullscreen?: boolean;
}

const QUICK_QUESTIONS = [
  { label: 'Fares Kigali Heights to Kimironko', query: 'How much is a moto ride from Kigali Heights to Kimironko?' },
  { label: 'MoMo Payment Guide', query: 'How do I pay my driver or delivery with MTN Mobile Money (MoMo)?' },
  { label: 'Package Delivery Limits', query: 'What are the weight and item limits for express package delivery?' },
  { label: 'Sanitized Helmets & Safety', query: 'How do you ensure sanitized helmets and passenger safety?' },
  { label: 'RRA EBM Tax Invoices', query: 'How do I get an official RRA EBM tax invoice for my corporate expense?' },
  { label: 'Multi-Stop Parcel Drops', query: 'Can a rider deliver packages to multiple locations in one run?' },
];

const KIGALI_POPULAR_FARES = [
  { from: 'Downtown CBD', to: 'Kigali Heights', fare: 'Direct Rider Agreement' },
  { from: 'Kigali Heights', to: 'Kimironko Market', fare: 'Direct Rider Agreement' },
  { from: 'Remera (Giporoso)', to: 'Kanombe Airport', fare: 'Direct Rider Agreement' },
  { from: 'Kicukiro (Sonatubes)', to: 'Downtown CBD', fare: 'Direct Rider Agreement' },
  { from: 'Nyamirambo', to: 'Kimihurura', fare: 'Direct Rider Agreement' },
  { from: 'Nyarutarama', to: 'Gishushu / RDB', fare: 'Direct Rider Agreement' },
];

export const SupportChatModal: React.FC<SupportChatModalProps> = ({
  isOpen,
  onClose,
  onOpenRideBooking,
  onOpenDeliveryBooking,
  onOpenSmsAlertSettings,
  userPhone = '',
  userName = '',
  initialFullscreen = false,
}) => {
  const [mode, setMode] = useState<'ai' | 'human' | 'email'>('ai');
  const [clientName, setClientName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('jd_client_name');
      if (saved) return saved;
    } catch {}
    return userName || '';
  });
  const [clientPhone, setClientPhone] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('jd_client_phone');
      if (saved) return saved;
    } catch {}
    return userPhone || '';
  });
  const [clientEmail, setClientEmail] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('jd_client_email');
      if (saved) return saved;
    } catch {}
    return '';
  });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('jd_support_fullscreen');
      return saved !== null ? saved === 'true' : initialFullscreen;
    } catch {
      return initialFullscreen;
    }
  });
  const [showInfoSidebarMobile, setShowInfoSidebarMobile] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Muraho! 👋 Welcome to J&D Smooth Ride & Customer Care.

I am your 24/7 Kigali Assistant. Ask me anything about:
• **Rider-Decided Fares**: Riders negotiate and agree directly with clients (0% middleman fees)
• **Express Parcel Delivery**: Fast courier dispatch across all Kigali sectors
• **MTN Mobile Money**: Direct wallet payments to your selected rider's own registered MoMo number
• **Clean sanitized helmets**, hairnets & passenger safety

You can also reach our live team directly:
• **Text or SMS Live Dispatch**: +250796569416 *(Please include your **Name and Phone Number** in your message so our team can easily identify you and get back to you!)*
• **Email Customer Care directly**: corneliustch@gmail.com *(Please include your **Name and Phone Number** in your email so we can follow up easily)*
• **WhatsApp Support**: https://wa.me/message/ILBNJCGAXZL3I1`,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    },
  ]);

  // Rate limiting for human SMS: 30 seconds cooldown
  const [lastHumanSmsTimestamp, setLastHumanSmsTimestamp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jd_support_last_human_sms');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (instant = false) => {
    if (chatContainerRef.current) {
      if (instant) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      } else {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
    messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'end' });
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jd_support_fullscreen', String(next));
      } catch {}
      return next;
    });
    setIsMinimized(false);
  };

  // Global ESC key to exit fullscreen or close modal
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFullscreen) {
          toggleFullscreen();
        } else if (!isMinimized) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [isOpen, isFullscreen, isMinimized]);

  // Update cooldown timer every second
  useEffect(() => {
    const checkCooldown = () => {
      if (!lastHumanSmsTimestamp) {
        setCooldownRemaining(0);
        return;
      }
      const elapsedSeconds = Math.floor((Date.now() - lastHumanSmsTimestamp) / 1000);
      const remaining = 30 - elapsedSeconds;
      setCooldownRemaining(remaining > 0 ? remaining : 0);
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastHumanSmsTimestamp]);

  // Auto-scroll to bottom of chat whenever messages, loading, or window states update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom(false);
      // Double check after DOM re-render / layout calculation
      const timer = setTimeout(() => scrollToBottom(true), 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, isMinimized, loading, isFullscreen]);

  // Focus input when modal opens or mode changes
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, mode, isMinimized, isFullscreen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    // Check rate limit if in human mode
    if (mode === 'human' && cooldownRemaining > 0) {
      return;
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: currentTime,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setLoading(true);
    // Instant scroll to bottom so client sees their typed message immediately
    setTimeout(() => scrollToBottom(true), 30);

    try {
      // Build conversation history for AI mode
      const historyPayload = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          content: m.content,
        }));

      const trimmedName = clientName.trim();
      const trimmedPhone = clientPhone.trim();
      const trimmedEmail = clientEmail.trim();

      // Persist contact details for quick reuse
      if (trimmedName) {
        try { localStorage.setItem('jd_client_name', trimmedName); } catch {}
      }
      if (trimmedPhone) {
        try { localStorage.setItem('jd_client_phone', trimmedPhone); } catch {}
      }
      if (trimmedEmail) {
        try { localStorage.setItem('jd_client_email', trimmedEmail); } catch {}
      }

      const response = await fetch('/api/support/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          message: text,
          clientName: trimmedName || undefined,
          clientPhone: trimmedPhone || undefined,
          clientEmail: trimmedEmail || undefined,
          history: historyPayload,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (mode === 'ai') {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: data.reply || 'Muraho! How else can we assist your trip across Kigali today?',
              timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            },
          ]);
        } else if (mode === 'email') {
          try {
            studioAudio.playChime();
          } catch {}

          setMessages((prev) => [
            ...prev,
            {
              id: `email-${Date.now()}`,
              role: 'care_email',
              content: `${data.message || `Your inquiry has been emailed directly to Customer Care at ${CUSTOMER_CARE_EMAIL}.`}\n\n📬 *Note: If you are checking ${CUSTOMER_CARE_EMAIL} and do not see the message in your primary inbox, please check your **Spam / Junk** folder as automated dispatch notifications may be filtered there.*`,
              timestamp: currentTime,
              isEmail: true,
              emailRecipient: data.recipient || CUSTOMER_CARE_EMAIL,
              mailtoUrl: data.mailtoUrl,
            },
          ]);
        } else {
          // Human mode successful SMS dispatch
          const nowMs = Date.now();
          setLastHumanSmsTimestamp(nowMs);
          try {
            localStorage.setItem('jd_support_last_human_sms', nowMs.toString());
          } catch {}

          try {
            studioAudio.playChime();
          } catch {}

          const nameTag = trimmedName ? `Name: ${trimmedName}` : 'Name: [Your Name]';
          const phoneTag = trimmedPhone ? `Phone: ${trimmedPhone}` : 'Phone: [Your Phone]';
          const prefilledSms = `[J&D Support]\n${nameTag}\n${phoneTag}\nMessage: ${text}`;

          setMessages((prev) => [
            ...prev,
            {
              id: `human-${Date.now()}`,
              role: 'human_dispatch',
              content: data.message || `Your inquiry has been delivered directly to our live dispatch phone (+250796569416) and Customer Care at ${CUSTOMER_CARE_EMAIL}.`,
              timestamp: data.sentAt || currentTime,
              isSms: true,
              smsRecipient: data.dispatchedTo || '+250796569416',
              smsUrl: data.smsUrl || `sms:+250796569416?body=${encodeURIComponent(prefilledSms)}`,
            },
          ]);
        }
      } else {
        const errorText = data.error || 'Unable to complete dispatch at this moment.';
        const fallbackMailto = data.mailtoUrl || `mailto:${CUSTOMER_CARE_EMAIL}?subject=${encodeURIComponent(`[J&D Support] Inquiry from ${trimmedName || trimmedPhone || 'Kigali Client'}`)}&body=${encodeURIComponent(`Client Name: ${trimmedName || 'Valued Client'}\nPhone: ${trimmedPhone || 'Not provided'}\nEmail: ${trimmedEmail || 'Not provided'}\n\nMessage:\n${text}`)}`;

        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `Notice: ${errorText}\n\n${data.loggedLocally ? '✅ *Your message has also been logged in our dispatch database.* ' : ''}You can also transmit your inquiry immediately via 1-tap email, WhatsApp, or direct call:`,
            timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            mailtoUrl: fallbackMailto,
            isEmailError: mode === 'email',
          },
        ]);
      }
    } catch (err: any) {
      const fallbackMailto = `mailto:${CUSTOMER_CARE_EMAIL}?subject=${encodeURIComponent(`[J&D Support] Client Inquiry`)}&body=${encodeURIComponent(`Name: ${clientName || 'Client'}\nPhone: ${clientPhone || 'None'}\n\nMessage:\n${text}`)}`;
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Network connection issue. Your message can still be delivered directly to corneliustch@gmail.com or via our live Kigali Operations Desk at 0796569416 (24/7).',
          timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          mailtoUrl: fallbackMailto,
          isEmailError: mode === 'email',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = (emailStr: string) => {
    try {
      navigator.clipboard.writeText(emailStr);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Parse inline markdown tokens such as **bold**, USSD codes, phone numbers, and WhatsApp links
   */
  const formatInlineText = (text: string) => {
    const tokenRegex = /(\*\*[^*]+\*\*|https:\/\/wa\.me\/[^\s)]+|\*182\*(?:8\*1|1)?#|(?:\+?250\s?)?0?796\s?569\s?416)/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, idx) => {
      if (!part) return null;

      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return (
          <strong key={idx} className="font-bold text-[#bcedc7] mx-0.5 tracking-normal">
            {inner}
          </strong>
        );
      }

      if (part.startsWith('https://wa.me/')) {
        return (
          <a
            key={idx}
            href={WHATSAPP_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs rounded-lg mx-1 align-middle transition-transform hover:scale-105"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-black text-black" />
            <span>WhatsApp Live</span>
          </a>
        );
      }

      if (/^\*182\*(?:8\*1|1)?#$/.test(part)) {
        return (
          <span
            key={idx}
            className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#1d351b] text-[#9ed3aa] font-mono text-xs font-bold border border-[#85AB8B]/50 mx-1 align-middle shadow-xs"
          >
            {part}
          </span>
        );
      }

      if (/(?:\+?250\s?)?0?796\s?569\s?416/.test(part)) {
        return (
          <span key={idx} className="inline-flex items-center gap-1.5 align-middle mx-1">
            <a
              href="tel:0796569416"
              className="text-emerald-300 hover:text-white underline font-mono font-bold"
              title="Call 24/7 Kigali Dispatch"
            >
              {part}
            </a>
            <a
              href={`sms:+250796569416?body=${encodeURIComponent('Muraho J&D Support! ')}`}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-black font-mono text-[10px] font-bold border border-amber-400/40 transition-colors"
              title="Send direct SMS to dispatch"
            >
              <Smartphone className="w-2.5 h-2.5" />
              <span>SMS</span>
            </a>
          </span>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  /**
   * Formats chat message content with generous paragraph spacing, list bullets, and high-contrast typography
   */
  const renderFormattedContent = (content: string, isUser: boolean) => {
    if (isUser) {
      return (
        <div className="text-sm sm:text-base leading-relaxed tracking-normal whitespace-pre-wrap break-words text-white font-medium">
          {content}
        </div>
      );
    }

    const paragraphs = content.split(/\n{2,}/);

    return (
      <div className="text-sm sm:text-base leading-relaxed tracking-normal space-y-3 break-words text-[#f2f7f1]">
        {paragraphs.map((para, pIdx) => {
          const trimmed = para.trim();
          if (!trimmed) return null;

          const lines = trimmed.split('\n');
          const isAllBullets = lines.length > 1 && lines.every((line) => /^[*•\-]\s|^\d+\.\s/.test(line.trim()));

          if (isAllBullets) {
            return (
              <ul key={pIdx} className="space-y-2 pl-1 my-2">
                {lines.map((line, lIdx) => {
                  const clean = line.replace(/^[*•\-]\s+|^\d+\.\s+/, '').trim();
                  return (
                    <li key={lIdx} className="flex items-start gap-2.5 text-sm sm:text-base leading-relaxed">
                      <span className="w-2 h-2 rounded-full bg-[#9ed3aa] mt-2 shrink-0 shadow-[0_0_6px_rgba(158,211,170,0.6)]" />
                      <span className="flex-1">{formatInlineText(clean)}</span>
                    </li>
                  );
                })}
              </ul>
            );
          }

          return (
            <p key={pIdx} className="leading-relaxed sm:leading-loose">
              {lines.map((line, lIdx) => {
                const isBullet = /^[*•\-]\s+|^\d+\.\s+/.test(line.trim());
                if (isBullet) {
                  const clean = line.replace(/^[*•\-]\s+|^\d+\.\s+/, '').trim();
                  return (
                    <span key={lIdx} className="flex items-start gap-2.5 my-1.5 pl-1">
                      <span className="w-2 h-2 rounded-full bg-[#9ed3aa] mt-2 shrink-0 shadow-[0_0_6px_rgba(158,211,170,0.6)]" />
                      <span className="flex-1">{formatInlineText(clean)}</span>
                    </span>
                  );
                }

                return (
                  <React.Fragment key={lIdx}>
                    {lIdx > 0 && <br />}
                    {formatInlineText(line)}
                  </React.Fragment>
                );
              })}
            </p>
          );
        })}
      </div>
    );
  };

  // Reusable Dispatch & Assistance Info Hub component (used in full-screen sidebar and mobile drawer)
  const renderDispatchInfoHub = () => (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-4 text-white bg-[#0e160e]">
      {/* 24/7 Operations Desk Status Badge */}
      <div className="p-3.5 bg-[#172416] border border-[#85AB8B]/40 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Kigali Operations Desk</span>
          </div>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/40">
            24/7 LIVE
          </span>
        </div>
        <p className="text-[11px] text-[#c1c9bf] mt-1.5 leading-relaxed">
          Direct dispatch monitoring across Nyarugenge, Gasabo, & Kicukiro sectors.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href="tel:0796569416"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#233822] hover:bg-[#2d472c] text-[#9ed3aa] border border-[#85AB8B]/40 rounded-lg text-xs font-bold transition-all active:scale-95 text-center"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>0796569416</span>
          </a>
          <a
            href={WHATSAPP_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold rounded-lg text-xs transition-all active:scale-95 text-center shadow"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-black text-black shrink-0" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Customer Care Email & Text Desk */}
      <div className="p-3.5 bg-[#172416] border border-[#85AB8B]/50 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#9ed3aa]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Customer Care Desk</span>
          </div>
          <span className="text-[10px] bg-[#223621] text-[#9ed3aa] font-mono font-bold px-2 py-0.5 rounded border border-[#85AB8B]/40">
            EMAIL &amp; TEXT
          </span>
        </div>
        <p className="text-[11px] text-[#c1c9bf] mt-1.5 leading-relaxed">
          Clients and riders can email or text directly for quotes, enterprise billing, or dedicated assistance.
        </p>

        <div className="mt-2.5 p-2 bg-[#090f09] rounded-lg border border-[#2b382a] flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5 text-[#9ed3aa] shrink-0" />
            <span className="text-xs font-mono text-white truncate">{CUSTOMER_CARE_EMAIL}</span>
          </div>
          <button
            type="button"
            onClick={() => handleCopyEmail(CUSTOMER_CARE_EMAIL)}
            className="text-[10px] px-2 py-1 rounded bg-[#223621] text-[#9ed3aa] hover:text-white border border-[#85AB8B]/40 shrink-0 ml-1 transition-colors cursor-pointer"
            title="Copy email address"
          >
            {copiedEmail ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <a
            href={`mailto:${CUSTOMER_CARE_EMAIL}?subject=J%26D%20Smooth%20Ride%20Client%20Inquiry`}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#233822] hover:bg-[#2d472c] text-[#9ed3aa] border border-[#85AB8B]/40 rounded-lg text-xs font-bold transition-all active:scale-95 text-center"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>Open Email</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setMode('email');
              if (inputRef.current) inputRef.current.focus();
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#336443] hover:bg-[#3d7751] text-white font-bold rounded-lg text-xs transition-all active:scale-95 text-center shadow cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>Write Email</span>
          </button>
        </div>
      </div>

      {/* MTN MoMo Official Payment Guide */}
      <div className="p-3.5 bg-[#172216] border border-[#414942] rounded-xl">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1.5">
          <Coins className="w-4 h-4 text-amber-400 shrink-0" />
          <span>MTN MoMo Direct Pay</span>
        </div>
        <div className="bg-[#0b120b] p-2.5 rounded-lg border border-[#313b30] font-mono text-xs text-[#9ed3aa] flex items-center justify-between">
          <span>*182*1*1*[RIDER_MOMO]#</span>
          <span className="text-[11px] text-[#c1c9bf]">Rider Profile Wallet</span>
        </div>
        <p className="text-[11px] text-[#85AB8B] mt-1.5">
          Zero extra fee. Riders put their own personal MoMo number on their profile; clients pay directly to the rider.
        </p>
      </div>

      {/* Popular Kigali Moto Fares Matrix */}
      <div className="p-3.5 bg-[#172216] border border-[#414942] rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#9ed3aa]" />
            Standard Kigali Fares
          </span>
          <span className="text-[10px] text-[#85AB8B] font-mono">Guaranteed</span>
        </div>
        <div className="space-y-1.5">
          {KIGALI_POPULAR_FARES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(`What is the fare from ${item.from} to ${item.to}?`)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#0c130b] hover:bg-[#1a2919] border border-[#2b382a] text-left text-[11px] transition-colors group cursor-pointer"
              title="Click to ask about this route"
            >
              <span className="text-[#d9e6d2] group-hover:text-white truncate mr-2">
                {item.from} → {item.to}
              </span>
              <span className="text-[#9ed3aa] font-mono font-bold shrink-0">
                {item.fare}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Passenger Safety & Guarantee */}
      <div className="p-3.5 bg-[#172216] border border-[#414942] rounded-xl">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>High-Hygiene Standard</span>
        </div>
        <p className="text-[11px] text-[#c1c9bf] leading-relaxed">
          Every rider carries fresh sanitized hairnets and dual DOT-certified safety helmets sanitized before every passenger boarding.
        </p>
      </div>

      {/* Quick Booking Shortcuts */}
      <div className="pt-2 border-t border-[#313b30] flex flex-col gap-2">
        <span className="text-[11px] font-bold text-[#85AB8B] uppercase tracking-wider">Quick Actions</span>
        <div className="grid grid-cols-2 gap-2">
          {onOpenRideBooking && (
            <button
              type="button"
              onClick={onOpenRideBooking}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#233822] hover:bg-[#2d472c] text-white rounded-lg text-xs font-semibold border border-[#85AB8B]/40 transition-colors cursor-pointer"
            >
              <Bike className="w-3.5 h-3.5 text-[#9ed3aa]" />
              <span>Book Moto Ride</span>
            </button>
          )}
          {onOpenDeliveryBooking && (
            <button
              type="button"
              onClick={onOpenDeliveryBooking}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#233822] hover:bg-[#2d472c] text-white rounded-lg text-xs font-semibold border border-[#85AB8B]/40 transition-colors cursor-pointer"
            >
              <Package2 className="w-3.5 h-3.5 text-[#9ed3aa]" />
              <span>Send Parcel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Minimized Tray Pill (when user clicks minimize) */}
      {isMinimized && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div 
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-3 bg-[#152214] hover:bg-[#1d2f1c] text-white px-4 py-3 rounded-full border-2 border-[#85AB8B] shadow-2xl cursor-pointer transition-all hover:scale-105 active:scale-95 select-none"
            role="button"
            title="Restore Support Chat Window"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#9ed3aa] text-[#101710] flex items-center justify-center font-bold">
                {mode === 'ai' ? <Bot className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#152214] rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#152214] rounded-full" />
            </div>

            <div className="text-left">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>J&D Support</span>
                <span className="text-[10px] font-mono text-[#9ed3aa]">({mode === 'ai' ? 'AI' : 'SMS'})</span>
              </p>
              <p className="text-[10px] text-[#c1c9bf]">Click to expand conversation</p>
            </div>

            <div className="flex items-center gap-1 pl-2 border-l border-[#313b30]">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(false);
                  setIsFullscreen(true);
                }}
                className="p-1 text-[#9ed3aa] hover:text-white rounded hover:bg-[#233522]"
                title="Expand directly to Full Screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 text-[#c1c9bf] hover:text-white rounded hover:bg-[#233522]"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Support Chat Dialog */}
      {!isMinimized && (
        <div 
          className={
            isFullscreen
              ? 'fixed inset-0 z-50 p-0 sm:p-3 md:p-6 lg:p-8 flex items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-300'
              : 'fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 z-50 flex items-end justify-center sm:justify-end max-w-full'
          }
        >
          {/* Backdrop for standard floating mode on mobile */}
          {!isFullscreen && (
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm sm:hidden z-[-1]"
              onClick={onClose}
            />
          )}

          <div 
            className={`bg-[#0d140c] border-2 border-[#3c4b3b] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
              isFullscreen
                ? 'w-full h-full max-w-7xl max-h-[100vh] sm:max-h-[96vh] rounded-none sm:rounded-2xl md:rounded-3xl border-[#85AB8B]/60 shadow-[0_0_80px_rgba(0,0,0,0.95)]'
                : 'w-full sm:w-[580px] md:w-[640px] lg:w-[680px] h-[92vh] sm:h-[680px] md:h-[720px] max-h-[100dvh] sm:max-h-[94vh] rounded-t-3xl sm:rounded-2xl'
            }`}
            role="dialog"
            aria-label="Client Support Chat"
            style={{ color: '#ffffff' }}
          >
            {/* Top Navigation & Window Header - Streamlined Single Row */}
            <div 
              onDoubleClick={toggleFullscreen}
              className="bg-[#141d13] border-b border-[#364435] px-3.5 sm:px-5 py-2.5 flex items-center justify-between gap-2 shrink-0 select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div 
                    onClick={() => setMode(mode === 'ai' ? 'human' : 'ai')}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold shadow-inner cursor-pointer transition-all active:scale-95 ${
                      mode === 'ai' 
                        ? 'bg-[#213320] text-[#9ed3aa] border border-[#85AB8B]' 
                        : 'bg-amber-400 text-black border border-white'
                    }`}
                    title="Click to toggle mode"
                  >
                    {mode === 'ai' ? <Bot className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#141d13] rounded-full animate-pulse" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                      J&D Support Desk
                    </h3>

                    {/* Compact Mode Switcher Pill */}
                    <div className="flex items-center bg-[#090f09] p-0.5 rounded-lg border border-[#2b382a] shrink-0">
                      <button
                        type="button"
                        onClick={() => setMode('ai')}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] transition-all cursor-pointer ${
                          mode === 'ai'
                            ? 'bg-[#223621] text-[#9ed3aa] font-bold border border-[#85AB8B]/60 shadow-xs'
                            : 'text-[#81917f] hover:text-white'
                        }`}
                      >
                        <Bot className="w-3 h-3" />
                        <span className="hidden xs:inline">AI Assistant</span>
                        <span className="xs:hidden">AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('human')}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] transition-all cursor-pointer ${
                          mode === 'human'
                            ? 'bg-amber-400 text-black font-extrabold shadow-xs'
                            : 'text-[#81917f] hover:text-white'
                        }`}
                      >
                        <UserCheck className="w-3 h-3" />
                        <span className="hidden xs:inline">Human SMS</span>
                        <span className="xs:hidden">SMS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('email')}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] transition-all cursor-pointer ${
                          mode === 'email'
                            ? 'bg-[#336443] text-white font-bold border border-[#9ed3aa]/60 shadow-xs'
                            : 'text-[#81917f] hover:text-white'
                        }`}
                      >
                        <Mail className="w-3 h-3 text-[#9ed3aa]" />
                        <span className="hidden xs:inline">Email Care</span>
                        <span className="xs:hidden">Email</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#93a691] truncate hidden sm:block">
                    {mode === 'ai' 
                      ? 'Instant Kigali moto fares, MoMo billing & logistics guide' 
                      : mode === 'email'
                      ? 'Email customer care directly at corneliustch@gmail.com'
                      : 'Live SMS to Kigali Operations Desk (+250796569416)'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: WhatsApp, SMS Settings, Fullscreen Toggle, Minimize, Close */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

                {/* Prominent WhatsApp Live Chat Link in Header */}
                <a
                  href={WHATSAPP_SUPPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-[11px] rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Chat directly with our dispatch desk on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-black text-black shrink-0" />
                  <span className="hidden md:inline font-bold">WhatsApp</span>
                </a>

                {/* SMS Alert Settings & API Controls Trigger */}
                {onOpenSmsAlertSettings && (
                  <button
                    type="button"
                    onClick={onOpenSmsAlertSettings}
                    className="p-1.5 text-amber-300 hover:text-white hover:bg-[#233522] rounded-lg transition-colors cursor-pointer"
                    title="SMS Alert Settings & API Quota Controls"
                    aria-label="SMS Alert Settings"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                )}

                {/* Mobile Info Hub Toggle Button (visible in full screen on small screens) */}
                {isFullscreen && (
                  <button
                    type="button"
                    onClick={() => setShowInfoSidebarMobile(!showInfoSidebarMobile)}
                    className="lg:hidden p-1.5 text-[#9ed3aa] hover:text-white hover:bg-[#233522] rounded-lg transition-colors cursor-pointer"
                    title="Toggle Hotline & Fare Guide"
                    aria-label="Toggle Info"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                )}

                {/* FULL SCREEN TOGGLE BUTTON */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className={`flex items-center gap-1 p-1.5 rounded-lg transition-all cursor-pointer ${
                    isFullscreen
                      ? 'text-[#9ed3aa] bg-[#233822] hover:bg-[#2d472c] border border-[#85AB8B]/40'
                      : 'text-[#c1c9bf] hover:text-white hover:bg-[#233522]'
                  }`}
                  title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Open Full Screen'}
                  aria-label={isFullscreen ? 'Exit Full Screen' : 'Open Full Screen'}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      <span className="hidden md:inline text-xs font-semibold">Exit Full Screen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span className="hidden md:inline text-xs font-semibold">Full Screen</span>
                    </>
                  )}
                </button>

                {/* MINIMIZE BUTTON */}
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 text-[#c1c9bf] hover:text-white hover:bg-[#233522] rounded-lg transition-colors cursor-pointer"
                  title="Minimize to bottom bar"
                  aria-label="Minimize"
                >
                  <Minus className="w-4 h-4" />
                </button>

                {/* CLOSE BUTTON */}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-[#c1c9bf] hover:text-white hover:bg-[#233522] rounded-lg transition-colors cursor-pointer"
                  title="Close Support Chat (Esc)"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Alert Banner in Human Mode - Explicit Name & Phone instructions */}
            {mode === 'human' && (
              <div className="bg-amber-950/95 border-b border-amber-500/60 p-3 sm:px-5 sm:py-3 text-amber-200 text-xs shrink-0 animate-fadeIn space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs sm:text-sm block">
                        Direct SMS to Live Dispatch Phone (+250796569416)
                      </span>
                      <span className="text-[11px] text-amber-300/90 block">
                        Messages are dispatched directly to the live operations phone via the httpSMS Gateway.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('ai')}
                    className="text-[11px] px-2.5 py-1 rounded bg-[#1f2a1d] text-amber-300 hover:text-white border border-amber-400/40 cursor-pointer font-medium"
                  >
                    Switch to AI Assistant
                  </button>
                </div>

                {/* Prominent requirement note */}
                <div className="bg-amber-900/50 border border-amber-500/40 rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-amber-100 leading-relaxed shadow-xs">
                  <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Notice for SMS Support:</strong> When texting client support, please put your <strong className="underline text-amber-300">Name</strong> and <strong className="underline text-amber-300">Phone Number</strong> in the fields below or in your message text, so our support team knows who you are and can easily respond and call you right back!
                  </div>
                </div>

                {/* Dedicated Name & Phone input fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <div className="flex items-center gap-1.5 bg-[#101710] border border-amber-500/50 rounded-lg px-2.5 py-1.5">
                    <span className="text-[11px] text-amber-300 font-bold whitespace-nowrap">Your Name:</span>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        try { localStorage.setItem('jd_client_name', e.target.value); } catch {}
                      }}
                      placeholder="e.g. Jean Pierre / Marie"
                      style={{ color: '#ffffff', backgroundColor: 'transparent' }}
                      className="text-xs text-white placeholder-amber-200/40 font-medium focus:outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#101710] border border-amber-500/50 rounded-lg px-2.5 py-1.5">
                    <span className="text-[11px] text-amber-300 font-bold whitespace-nowrap">Your Phone:</span>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => {
                        setClientPhone(e.target.value);
                        try { localStorage.setItem('jd_client_phone', e.target.value); } catch {}
                      }}
                      placeholder="078X XXX XXX / 079X XXX XXX"
                      style={{ color: '#ffffff', backgroundColor: 'transparent' }}
                      className="text-xs text-white placeholder-amber-200/40 font-mono focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Alert Banner in Email Mode - Explicit Name & Phone instructions */}
            {mode === 'email' && (
              <div className="bg-[#122416] border-b border-[#85AB8B]/60 p-3 sm:px-5 sm:py-3 text-[#d2e8d6] text-xs shrink-0 animate-fadeIn space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#9ed3aa] shrink-0" />
                    <div>
                      <span className="font-bold text-white text-xs sm:text-sm block">
                        Direct Email to Customer Care ({CUSTOMER_CARE_EMAIL})
                      </span>
                      <span className="text-[11px] text-[#9ed3aa]/90 block">
                        Direct email dispatch for client quotes, enterprise inquiries, and official support.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('ai')}
                    className="text-[11px] px-2.5 py-1 rounded bg-[#182317] text-[#9ed3aa] hover:text-white border border-[#85AB8B]/40 cursor-pointer font-medium"
                  >
                    Switch to AI Assistant
                  </button>
                </div>

                {/* Prominent requirement note */}
                <div className="bg-[#162f1c] border border-[#3b603e] rounded-lg p-2.5 flex items-start gap-2 text-[11px] text-[#e2f3e5] leading-relaxed shadow-xs">
                  <Info className="w-4 h-4 text-[#9ed3aa] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Notice for Email Support:</strong> When emailing client support, please put your <strong className="underline text-[#9ed3aa]">Name</strong> and <strong className="underline text-[#9ed3aa]">Phone Number</strong> in the fields below or in your email message, so our support team knows who you are and can easily respond and follow up with you!
                  </div>
                </div>

                {/* Dedicated Name, Phone & Email input fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                  <div className="flex items-center gap-1.5 bg-[#0b140b] border border-[#85AB8B]/60 rounded-lg px-2.5 py-1.5">
                    <span className="text-[11px] text-[#9ed3aa] font-bold whitespace-nowrap">Your Name:</span>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        try { localStorage.setItem('jd_client_name', e.target.value); } catch {}
                      }}
                      placeholder="e.g. Jean Pierre / Marie"
                      style={{ color: '#ffffff', backgroundColor: 'transparent' }}
                      className="text-xs text-white placeholder-[#85AB8B]/50 font-medium focus:outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#0b140b] border border-[#85AB8B]/60 rounded-lg px-2.5 py-1.5">
                    <span className="text-[11px] text-[#9ed3aa] font-bold whitespace-nowrap">Your Phone:</span>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => {
                        setClientPhone(e.target.value);
                        try { localStorage.setItem('jd_client_phone', e.target.value); } catch {}
                      }}
                      placeholder="078X XXX XXX / 079X XXX XXX"
                      style={{ color: '#ffffff', backgroundColor: 'transparent' }}
                      className="text-xs text-white placeholder-[#85AB8B]/50 font-mono focus:outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#0b140b] border border-[#85AB8B]/60 rounded-lg px-2.5 py-1.5">
                    <span className="text-[11px] text-[#9ed3aa] font-bold whitespace-nowrap">Your Email:</span>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => {
                        setClientEmail(e.target.value);
                        try { localStorage.setItem('jd_client_email', e.target.value); } catch {}
                      }}
                      placeholder="your-email@gmail.com"
                      style={{ color: '#ffffff', backgroundColor: 'transparent' }}
                      className="text-xs text-white placeholder-[#85AB8B]/50 font-sans focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Collapsible Info Drawer in Full Screen */}
            {isFullscreen && showInfoSidebarMobile && (
              <div className="lg:hidden max-h-60 overflow-y-auto border-b border-[#414942] bg-[#0c120c] p-3 animate-fadeIn">
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#313b30]">
                  <span className="text-xs font-bold text-[#9ed3aa]">Kigali Dispatch & Fares Info</span>
                  <button 
                    onClick={() => setShowInfoSidebarMobile(false)}
                    className="text-xs text-[#c1c9bf] hover:text-white"
                  >
                    Close [×]
                  </button>
                </div>
                {renderDispatchInfoHub()}
              </div>
            )}

            {/* MAIN WORKSPACE BODY: Split-screen in Full Screen mode, single-column in floating mode */}
            <div className="flex-1 flex overflow-hidden min-h-0 bg-[#0a1109] relative">
              {/* Left Sidebar (visible in Full Screen on lg+ screens) */}
              {isFullscreen && (
                <div className="hidden lg:flex w-80 xl:w-96 flex-col border-r border-[#384837] shrink-0 bg-[#0e160e]">
                  {renderDispatchInfoHub()}
                </div>
              )}

              {/* Right / Center Chat Conversation Column */}
              <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#091008] relative">
                {/* Messages Scroll Area with spacious padding, clear contrast, and guaranteed room */}
                <div 
                  ref={chatContainerRef}
                  onScroll={() => {
                    if (!chatContainerRef.current) return;
                    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
                    setShowScrollBottomBtn(scrollHeight - scrollTop - clientHeight > 120);
                  }}
                  className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 flex flex-col gap-3.5 sm:gap-4.5 custom-scrollbar bg-[#091008]"
                >
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    const isHumanDispatch = msg.role === 'human_dispatch';
                    const isCareEmail = msg.role === 'care_email';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[94%] sm:max-w-[85%] md:max-w-[80%] ${
                          isUser ? 'ml-auto' : 'mr-auto'
                        }`}
                      >
                        {/* Message Header Tag with clear sender label and time */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-xs">
                          {isUser ? (
                            <span className="font-bold text-[#a6e6b3] flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-[#9ed3aa]" />
                              <span>You (Client)</span>
                            </span>
                          ) : isHumanDispatch ? (
                            <span className="font-bold text-amber-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Live Dispatch Desk</span>
                            </span>
                          ) : isCareEmail ? (
                            <span className="font-bold text-emerald-300 flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Customer Care Desk</span>
                            </span>
                          ) : (
                            <span className="font-bold text-[#9ed3aa] flex items-center gap-1">
                              <Bot className="w-3.5 h-3.5 text-[#9ed3aa]" />
                              <span>Smooth Ride AI Assistant</span>
                            </span>
                          )}
                          <span className="text-[#647963] text-[11px] font-mono ml-1">{msg.timestamp}</span>
                        </div>

                        {/* Message Bubble with High Contrast, Generous Space & Clean Borders */}
                        <div
                          style={{ color: '#ffffff' }}
                          className={`px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl text-sm sm:text-base leading-relaxed break-words shadow-md transition-all ${
                            isUser
                              ? 'bg-[#1c3c21] border-2 border-[#7fb887] text-white font-medium rounded-tr-xs'
                              : isHumanDispatch
                              ? 'bg-[#241c12] border-2 border-amber-500/60 text-[#fff7e6] rounded-tl-xs'
                              : isCareEmail
                              ? 'bg-[#0e2413] border-2 border-emerald-500/70 text-[#f0fdf4] rounded-tl-xs'
                              : 'bg-[#131d13] border-2 border-[#384c37] text-[#f2f7f1] rounded-tl-xs'
                          }`}
                        >
                          {renderFormattedContent(msg.content, isUser)}

                          {msg.isSms && (
                            <div className="mt-3 pt-2.5 border-t border-amber-500/30 flex items-center justify-between text-xs text-amber-300 font-mono">
                              <span className="flex items-center gap-1.5">
                                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                                Sent directly to {msg.smsRecipient || '+250796569416'} via SMS Gateway
                              </span>
                              <span className="bg-amber-950 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border border-amber-600/40 text-amber-300">
                                SMS Sent
                              </span>
                            </div>
                          )}

                          {msg.isEmail && (
                            <div className="mt-3 pt-2.5 border-t border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 font-mono">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" />
                                Delivered to {msg.emailRecipient || CUSTOMER_CARE_EMAIL}
                              </span>
                              <span className="bg-emerald-950 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border border-emerald-600/40">
                                Emailed
                              </span>
                            </div>
                          )}

                          {msg.mailtoUrl && (
                            <div className="mt-3 pt-2.5 border-t border-[#384c37]/60 flex flex-wrap items-center gap-2">
                              <a
                                href={msg.mailtoUrl}
                                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-[#2d472c] hover:bg-[#385c37] text-[#9ed3aa] hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                              >
                                <Mail className="w-3.5 h-3.5 text-[#9ed3aa]" />
                                <span>Open in Email App</span>
                                <ExternalLink className="w-3 h-3 text-[#9ed3aa]/70" />
                              </a>
                              <a
                                href={WHATSAPP_SUPPORT_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold rounded-lg text-xs transition-all shadow-sm active:scale-95"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-black text-black" />
                                <span>WhatsApp Dispatch</span>
                              </a>
                              <a
                                href="tel:0796569416"
                                className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-[#1e2a1d] hover:bg-[#273825] text-white rounded-lg text-xs font-semibold border border-[#85AB8B]/40 transition-all active:scale-95"
                              >
                                <Phone className="w-3.5 h-3.5 text-[#9ed3aa]" />
                                <span>Call: 0796569416</span>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex items-center gap-2.5 text-sm text-[#9ed3aa] bg-[#131d13] border-2 border-[#384c37] rounded-2xl px-4 py-3 w-fit shadow-md animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-[#9ed3aa]" />
                      <span className="text-white font-medium">
                        {mode === 'ai' 
                          ? 'Smooth Assistant is writing response...' 
                          : mode === 'email'
                          ? `Delivering email inquiry to Customer Care (${CUSTOMER_CARE_EMAIL})...`
                          : 'Dispatching SMS to desk phone (+250796569416)...'}
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} className="h-2 shrink-0" />
                </div>

                {/* Floating "Jump to Latest" Button when scrolled up */}
                {showScrollBottomBtn && (
                  <button
                    type="button"
                    onClick={() => scrollToBottom(false)}
                    className="absolute bottom-24 right-4 sm:right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1c3c21] hover:bg-[#25522c] text-[#9ed3aa] border border-[#85AB8B] text-xs font-bold shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>Latest messages</span>
                  </button>
                )}

                {/* Quick Suggestions Chips (collapsible to maximize viewing space) */}
                {mode === 'ai' && !loading && (
                  <div className="px-3 sm:px-4 py-1.5 bg-[#111910] border-t border-[#293828] shrink-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1">
                        <span className="text-[10px] sm:text-[11px] text-[#85AB8B] shrink-0 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#9ed3aa]" />
                          Suggested:
                        </span>
                        {showSuggestions && QUICK_QUESTIONS.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(q.query)}
                            className="whitespace-nowrap text-xs bg-[#1a2618] hover:bg-[#253723] text-white hover:text-[#9ed3aa] px-2.5 py-1 rounded-lg border border-[#374936] transition-all shrink-0 cursor-pointer shadow-xs"
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className="text-[10px] text-[#85AB8B] hover:text-white shrink-0 font-semibold px-1.5 py-0.5 rounded hover:bg-[#1f2a1e] cursor-pointer"
                        title={showSuggestions ? 'Hide suggested questions' : 'Show suggested questions'}
                      >
                        {showSuggestions ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Rate Limit Alert in Human Mode */}
                {mode === 'human' && cooldownRemaining > 0 && (
                  <div className="px-4 py-1.5 bg-amber-950/80 border-t border-amber-600/50 flex items-center justify-between text-xs text-amber-200 shrink-0 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 animate-pulse text-amber-400" />
                      Rate limit active (Anti-Spam)
                    </span>
                    <span className="font-mono font-bold text-amber-300 text-xs">
                      Wait {cooldownRemaining}s before next SMS
                    </span>
                  </div>
                )}

                {/* Clear reminder notice for SMS so clients put Name and Number */}
                {mode === 'human' && (
                  <div className="px-3.5 py-1.5 bg-amber-950/90 border-t border-amber-600/50 flex items-center justify-between gap-2 text-[11px] text-amber-200 shrink-0">
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        <strong>Texting Support?</strong> Please put your <u>Name</u> and <u>Phone Number</u> in the message so our support team knows who you are and can easily get back to you!
                      </span>
                    </span>
                    {(!clientName.trim() || !clientPhone.trim()) && (
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/40 shrink-0 hidden sm:inline">
                        Put Name &amp; Number
                      </span>
                    )}
                  </div>
                )}

                {/* Clear reminder notice for Email so clients put Name and Number */}
                {mode === 'email' && (
                  <div className="px-3.5 py-1.5 bg-[#142616] border-t border-[#3b5d3c] flex items-center justify-between gap-2 text-[11px] text-[#d1e8d4] shrink-0">
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#9ed3aa] shrink-0" />
                      <span>
                        <strong>Emailing Support?</strong> Please put your <u>Name</u> and <u>Phone Number</u> in the message so our support team knows who you are and can easily get back to you!
                      </span>
                    </span>
                    {(!clientName.trim() || !clientPhone.trim()) && (
                      <span className="text-[10px] bg-[#9ed3aa]/20 text-[#9ed3aa] font-bold px-2 py-0.5 rounded border border-[#9ed3aa]/40 shrink-0 hidden sm:inline">
                        Put Name &amp; Number
                      </span>
                    )}
                  </div>
                )}

                {/* Input Form with High Contrast Visible Text and Comfortable Space */}
                <div className="p-2.5 sm:p-3.5 bg-[#121b11] border-t border-[#314230] shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-end gap-2"
                  >
                    <div className="relative flex-1">
                      <textarea
                        ref={inputRef}
                        rows={1}
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={loading || (mode === 'human' && cooldownRemaining > 0)}
                        placeholder={
                          mode === 'ai'
                            ? 'Type your question... (Enter to send, Shift+Enter for new line)'
                            : mode === 'email'
                            ? 'Type your message to Customer Care (Include your Name & Phone Number so we can get back to you)...'
                            : cooldownRemaining > 0
                            ? `Please wait ${cooldownRemaining}s before next SMS...`
                            : 'Type your message to SMS dispatch (Include your Name & Phone Number so we can get back to you)...'
                        }
                        style={{ 
                          color: '#ffffff', 
                          backgroundColor: '#070d07',
                        }}
                        className="w-full resize-none min-h-[44px] max-h-[100px] border-2 border-[#384a36] focus:border-[#9ed3aa] rounded-xl px-3.5 py-2.5 text-sm sm:text-base text-white placeholder-[#6c836a] focus:outline-none caret-[#9ed3aa] font-medium transition-colors shadow-inner leading-relaxed bg-[#070d07]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!inputValue.trim() || loading || (mode === 'human' && cooldownRemaining > 0)}
                      className={`h-[44px] px-4 sm:px-5 rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-all font-bold cursor-pointer select-none ${
                        !inputValue.trim() || loading || (mode === 'human' && cooldownRemaining > 0)
                          ? 'bg-[#182317] text-[#556453] cursor-not-allowed border border-[#283627]'
                          : mode === 'ai'
                          ? 'bg-[#9ed3aa] hover:bg-[#b0dfbb] text-[#101710] shadow-md active:scale-95'
                          : mode === 'email'
                          ? 'bg-[#336443] hover:bg-[#3d7751] text-white shadow-md active:scale-95 border border-[#9ed3aa]/50'
                          : 'bg-amber-400 hover:bg-amber-300 text-black shadow-md active:scale-95'
                      }`}
                      title={mode === 'email' ? 'Send direct email to Customer Care' : mode === 'human' ? 'Send direct SMS to dispatch' : 'Send to AI Assistant (Enter)'}
                      aria-label="Send message"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span className="text-xs sm:text-sm font-bold">{mode === 'email' ? 'Email' : 'Send'}</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Bottom Micro Bar: Hotline, MoMo, and Quick Links */}
                  <div className="mt-2 pt-2 border-t border-[#233122] flex flex-wrap items-center justify-between text-[11px] text-[#85AB8B] gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#9ed3aa]" />
                        Hotline: <a href="tel:0796569416" className="text-white hover:underline font-mono font-bold">0796569416</a>
                      </span>
                      <span className="text-[#556b53]">•</span>
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-amber-400" />
                        SMS: <a 
                          href={`sms:+250796569416?body=${encodeURIComponent(`[J&D Support]\nName: ${clientName.trim() || '[Your Name]'}\nPhone: ${clientPhone.trim() || '[Your Phone Number]'}\nInquiry: `)}`}
                          className="text-amber-300 hover:underline font-mono font-bold"
                          title="Open phone SMS app with prefilled name and number template"
                        >0796569416</a>
                      </span>
                      <span className="text-[#556b53]">•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#9ed3aa]" />
                        Care: <a 
                          href={`mailto:${CUSTOMER_CARE_EMAIL}?subject=${encodeURIComponent('J&D Client Support Inquiry')}&body=${encodeURIComponent(`Muraho Support Team,\n\nName: ${clientName.trim() || '[Your Name]'}\nPhone: ${clientPhone.trim() || '[Your Phone Number]'}\n\nMy Message: `)}`}
                          className="text-white hover:underline font-mono"
                          title="Send email with prefilled name and number template"
                        >{CUSTOMER_CARE_EMAIL}</a>
                      </span>
                      {onOpenSmsAlertSettings && (
                        <>
                          <span className="text-[#556b53]">•</span>
                          <button
                            type="button"
                            onClick={onOpenSmsAlertSettings}
                            className="text-amber-300 hover:text-white hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                            title="Configure SMS Alert Settings & API Consumption Toggles"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>SMS Alert Settings</span>
                          </button>
                        </>
                      )}
                      <span className="hidden sm:inline text-[#556b53]">•</span>
                      <span className="hidden sm:inline">
                        MoMo: <strong className="text-white font-mono">Direct to Rider Profile</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 font-medium ml-auto">
                      {!isFullscreen && (
                        <button
                          type="button"
                          onClick={toggleFullscreen}
                          className="flex items-center gap-1 text-[#9ed3aa] hover:text-white cursor-pointer transition-colors text-[11px] font-semibold"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Full Screen</span>
                        </button>
                      )}

                      {onOpenRideBooking && (
                        <button
                          type="button"
                          onClick={onOpenRideBooking}
                          className="text-[#9ed3aa] hover:underline cursor-pointer text-[11px] font-semibold"
                        >
                          Book Ride
                        </button>
                      )}
                      {onOpenDeliveryBooking && (
                        <button
                          type="button"
                          onClick={onOpenDeliveryBooking}
                          className="text-[#9ed3aa] hover:underline cursor-pointer text-[11px] font-semibold"
                        >
                          Send Parcel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Floating Support Chat Launcher Button
 * Positioned cleanly in bottom right of main app layout
 */
export const SupportChatFloatingButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}> = ({ isOpen, onClick, unreadCount = 0 }) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      <button
        onClick={onClick}
        className="group relative flex items-center gap-3 bg-[#182216] hover:bg-[#223020] text-white pl-4 pr-5 py-3 rounded-full border-2 border-[#85AB8B]/60 shadow-2xl hover:border-[#9ed3aa] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Open Client Support Chat"
        title="Open Support Chat (AI + SMS Dispatch)"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-[#9ed3aa] text-[#121a12] flex items-center justify-center font-bold shadow-inner group-hover:bg-[#b5e5bf] transition-colors">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#182216] rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#182216] rounded-full" />
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold tracking-wide text-white group-hover:text-[#9ed3aa] transition-colors">
              Support Desk
            </span>
            <span className="text-[9px] uppercase font-semibold bg-[#283526] text-[#9ed3aa] px-1.5 py-0.2 rounded border border-[#85AB8B]/30">
              Live
            </span>
          </div>
          <p className="text-[10px] text-[#c1c9bf]">
            AI Guide & SMS Dispatch
          </p>
        </div>

        {unreadCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-emerald-500 text-black text-[10px] font-bold rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
