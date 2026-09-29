import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Bike, 
  User, 
  Phone, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  CheckCheck, 
  Radio,
  Clock,
  Smartphone
} from 'lucide-react';
import { DirectChatMessage, RiderProfile } from '../types';
import { getStoredChatMessages, saveChatMessage, getSocket, playNotificationChime } from '../utils/directChat';

interface RiderClientChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: 'client' | 'rider';
  currentUserName: string;
  currentUserPhone?: string;
  targetRider?: RiderProfile | null;
  targetClient?: { id: string; name: string; phone?: string; location?: string } | null;
}

export const RiderClientChatModal: React.FC<RiderClientChatModalProps> = ({
  isOpen,
  onClose,
  currentUserRole,
  currentUserName,
  currentUserPhone = '',
  targetRider,
  targetClient,
}) => {
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const riderId = targetRider?.id || 'pilot-jean-claude';
  const riderName = targetRider?.name || 'Jean Claude Mugabo';
  const clientId = targetClient?.id || 'client-vip-1';
  const clientName = targetClient?.name || (currentUserRole === 'client' ? currentUserName : 'Passenger');

  // Load chat history & subscribe to new messages
  useEffect(() => {
    if (!isOpen) return;

    // Load initial messages
    const existing = getStoredChatMessages(riderId, clientId);
    if (existing.length === 0) {
      // Seed friendly welcome message
      const welcome: DirectChatMessage = {
        id: `welcome-${riderId}`,
        sender: 'rider',
        senderName: riderName,
        riderId,
        riderName,
        clientId,
        clientName,
        text: `Muraho! I am ${riderName}, your verified Kigali pilot (${targetRider?.bikePlate || 'RAD 829 K'}). I have sanitized dual helmets ready. You can text me your exact pinpoint location or gate color!`,
        timestamp: Date.now() - 60000,
      };
      saveChatMessage(welcome);
      setMessages([welcome]);
    } else {
      setMessages(existing);
    }

    const socket = getSocket();

    const handleIncomingMessage = (msg: DirectChatMessage) => {
      if (
        (msg.riderId === riderId && msg.clientId === clientId) ||
        (!msg.clientId && msg.riderId === riderId)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        saveChatMessage(msg);
        
        // Play chime if message is from the other party
        if (msg.sender !== currentUserRole) {
          playNotificationChime();
        }
      }
    };

    socket.on('direct-message-received', handleIncomingMessage);

    const handleLocalMessage = (e: Event) => {
      const customEvent = e as CustomEvent<DirectChatMessage>;
      if (customEvent.detail) {
        const msg = customEvent.detail;
        if (msg.riderId === riderId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      }
    };

    window.addEventListener('jd_new_direct_message', handleLocalMessage);

    return () => {
      socket.off('direct-message-received', handleIncomingMessage);
      window.removeEventListener('jd_new_direct_message', handleLocalMessage);
    };
  }, [isOpen, riderId, clientId, currentUserRole, riderName, clientName, targetRider]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const [isLocating, setIsLocating] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: DirectChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sender: currentUserRole,
      senderName: currentUserName,
      senderPhone: currentUserPhone,
      riderId,
      riderName,
      clientId,
      clientName,
      text,
      timestamp: Date.now(),
    };

    // Save and send via Socket
    saveChatMessage(newMsg);
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    const socket = getSocket();
    socket.emit('direct-message', newMsg);
  };

  const handleShareLiveLocation = () => {
    setIsLocating(true);
    const sendLocationMessage = (lat: number, lng: number) => {
      setIsLocating(false);
      const text = `📍 LIVE PICKUP LOCATION: (${lat.toFixed(4)}, ${lng.toFixed(4)})\nPlease pick me up from my live location! View on Free OpenStreetMap: https://www.openstreetmap.org/?mlat=${lat.toFixed(4)}&mlon=${lng.toFixed(4)}#map=17/${lat.toFixed(4)}/${lng.toFixed(4)}`;

      const newMsg: DirectChatMessage = {
        id: `loc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        sender: currentUserRole,
        senderName: currentUserName,
        senderPhone: currentUserPhone,
        riderId,
        riderName,
        clientId,
        clientName,
        text,
        timestamp: Date.now(),
      };

      saveChatMessage(newMsg);
      setMessages((prev) => [...prev, newMsg]);

      const socket = getSocket();
      socket.emit('direct-message', newMsg);
      // Broadcast live client coordinates
      socket.emit('client-location-update', {
        lat,
        lng,
        clientName: currentUserName || 'Passenger',
        landmark: `Shared Live GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        isLivePickup: true,
      });

      // Automated acknowledgment from pilot when client shares live location
      if (currentUserRole === 'client') {
        setTimeout(() => {
          const ackMsg: DirectChatMessage = {
            id: `reply-${Date.now()}`,
            sender: 'rider',
            senderName: riderName,
            riderId,
            riderName,
            clientId,
            clientName,
            text: `Muraho ${currentUserName || 'Passenger'}! I received your live GPS location (${lat.toFixed(4)}, ${lng.toFixed(4)}). I am routing directly on OpenStreetMap to pick you up at this spot!`,
            timestamp: Date.now(),
          };
          saveChatMessage(ackMsg);
          setMessages((prev) => [...prev, ackMsg]);
          playNotificationChime();
        }, 1200);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendLocationMessage(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Graceful fallback to central Kigali if device GPS is restricted
          sendLocationMessage(-1.9536, 30.0934);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      sendLocationMessage(-1.9536, 30.0934);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = currentUserRole === 'client' 
    ? [
        "I'm at the main entrance waiting.",
        "Please bring a second sanitized helmet.",
        "I'm near the landmark with the blue umbrella.",
        "How many minutes until you arrive?",
      ]
    : [
        "I've arrived at your pickup spot!",
        "On my way, arriving in 2-3 minutes.",
        "Wearing a green jacket, bike hazard lights on.",
        "Sanitized dual helmets ready.",
      ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="rider-client-chat-card"
        className="relative w-full max-w-lg h-[88vh] max-h-[700px] bg-[#101b10] border border-[#34A853]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#d9e6d2]"
      >
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#34A853] via-[#9ed3aa] to-[#34A853] z-10" />

        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#223521] bg-[#142313] z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              {currentUserRole === 'client' ? (
                <img 
                  src={targetRider?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'} 
                  alt={riderName}
                  className="w-10 h-10 rounded-2xl object-cover border-2 border-[#34A853] shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-[#34A853]/20 border border-[#34A853] text-[#7de099] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#34A853] border-2 border-[#142313]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {currentUserRole === 'client' ? riderName : clientName}
                </h3>
                <span className="text-[9px] bg-[#34A853]/25 text-[#7de099] font-bold px-2 py-0.5 rounded-full border border-[#34A853]/40 flex items-center gap-1">
                  <Radio className="w-2 h-2 text-[#34A853] animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-[#9bb59a] flex items-center gap-1.5">
                {currentUserRole === 'client' ? (
                  <>
                    <Bike className="w-3 h-3 text-[#34A853]" />
                    <span>{targetRider?.bikePlate || 'RAD 829 K'} • {targetRider?.bikeModel || 'Alpha MK1'}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3 text-[#34A853]" />
                    <span>Passenger Pickup Request</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUserRole === 'client' && targetRider && (
              <a 
                href={`tel:${targetRider.phone.replace(/\s+/g, '')}`}
                className="w-9 h-9 rounded-xl bg-[#1b2b1a] hover:bg-[#253e24] text-[#7de099] flex items-center justify-center border border-[#34A853]/30 transition-colors"
                title="Call Pilot Directly"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[#1b2b1a] hover:bg-[#253e24] text-[#a1baa0] hover:text-white flex items-center justify-center transition-colors border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Info Bar */}
        {currentUserRole === 'client' && targetRider && (
          <div className="px-4 py-2 bg-[#0c180c] border-b border-[#213821] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#b5d5b3]">
              <Smartphone className="w-3.5 h-3.5 text-[#34A853]" />
              <span>Pilot MoMo: <strong className="text-white font-mono">{targetRider.momoNumber}</strong></span>
            </div>
            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Direct Rider MoMo (Zero Fee)
            </span>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0c140b]">
          {messages.map((msg) => {
            const isMe = msg.sender === currentUserRole;
            const isLocationMsg = msg.text.includes('📍') || msg.text.includes('LIVE PICKUP LOCATION');
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-[#7f997d]">
                  <span className="font-semibold text-white/80">{msg.senderName}</span>
                  <span>•</span>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                    isLocationMsg
                      ? 'bg-[#15311a] border-2 border-[#34A853] text-[#e8f5e9]'
                      : isMe
                      ? 'bg-[#34A853] text-white rounded-br-xs font-medium'
                      : 'bg-[#182917] text-[#d9e6d2] border border-[#2b4429] rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {isLocationMsg && (
                    <div className="mt-2 pt-2 border-t border-[#34A853]/40 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[#9ed3aa] font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#34A853]" />
                        <span>Pickup at Shared Live GPS</span>
                      </span>
                      <span className="text-[9px] bg-[#1d351d] text-[#7de099] border border-[#34A853]/50 px-1.5 py-0.5 rounded font-mono">
                        Free OSM
                      </span>
                    </div>
                  )}
                </div>
                {isMe && (
                  <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] text-[#7f997d]">
                    <CheckCheck className="w-3 h-3 text-[#34A853]" />
                    <span>Delivered</span>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-[#101b10] border-t border-[#223521] overflow-x-auto scrollbar-none flex gap-1.5 items-center">
          {currentUserRole === 'client' && (
            <button
              type="button"
              onClick={handleShareLiveLocation}
              disabled={isLocating}
              className="text-[10px] whitespace-nowrap bg-[#1d351d] hover:bg-[#284928] text-[#7de099] border border-[#34A853] px-2.5 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1 font-bold shrink-0 shadow-xs"
            >
              <Radio className={`w-2.5 h-2.5 text-[#34A853] ${isLocating ? 'animate-spin' : 'animate-pulse'}`} />
              <span>{isLocating ? 'Locating...' : '📍 Share Live Location'}</span>
            </button>
          )}
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-[10px] whitespace-nowrap bg-[#172716] hover:bg-[#233a21] text-[#9ed3aa] border border-[#2d472c] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-[#142313] border-t border-[#223521] flex items-center gap-2"
        >
          {currentUserRole === 'client' && (
            <button
              type="button"
              onClick={handleShareLiveLocation}
              disabled={isLocating}
              title="Send My Live Location to Rider for Pickup"
              className="px-2.5 sm:px-3 py-2 bg-[#1d351d] hover:bg-[#284928] text-[#7de099] border border-[#34A853]/60 rounded-xl flex items-center gap-1 transition-all cursor-pointer shrink-0 text-xs font-bold disabled:opacity-50"
            >
              <Radio className={`w-3.5 h-3.5 text-[#34A853] ${isLocating ? 'animate-spin' : 'animate-pulse'}`} />
              <span className="hidden sm:inline">{isLocating ? 'GPS...' : 'Share Location'}</span>
              <span className="sm:hidden">📍</span>
            </button>
          )}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              currentUserRole === 'client'
                ? `Message ${riderName} directly...`
                : `Reply to ${clientName}...`
            }
            className="flex-1 bg-[#0b140b] border border-[#284227] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#6f8a6d] focus:outline-none focus:border-[#34A853]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-[#34A853] hover:bg-[#2c8d46] disabled:opacity-40 disabled:hover:bg-[#34A853] text-white flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
