import { DirectChatMessage } from '../types';
import { io, Socket } from 'socket.io-client';

const STORAGE_KEY_CHAT_MESSAGES = 'jd_direct_chat_messages_v1';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io({
      transports: ['websocket', 'polling'],
    });
  }
  return socketInstance;
}

export function getStoredChatMessages(riderId?: string, clientId?: string): DirectChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT_MESSAGES);
    if (!raw) return [];
    const all: DirectChatMessage[] = JSON.parse(raw);
    if (!Array.isArray(all)) return [];
    if (!riderId && !clientId) return all;
    return all.filter((m) => {
      const matchRider = !riderId || m.riderId === riderId;
      const matchClient = !clientId || m.clientId === clientId;
      return matchRider && matchClient;
    });
  } catch (e) {
    console.error('Failed to get chat messages', e);
    return [];
  }
}

export function saveChatMessage(message: DirectChatMessage): DirectChatMessage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT_MESSAGES);
    const all: DirectChatMessage[] = raw ? JSON.parse(raw) : [];
    // Prevent duplicate IDs
    if (!all.some((m) => m.id === message.id)) {
      all.push(message);
      localStorage.setItem(STORAGE_KEY_CHAT_MESSAGES, JSON.stringify(all));
    }
    // Dispatch local window event so open windows/modals update immediately
    window.dispatchEvent(new CustomEvent('jd_new_direct_message', { detail: message }));
  } catch (e) {
    console.error('Failed to save message', e);
  }
  return message;
}

// Synthesize pleasant double-beep chime using Web Audio API (No external file needed)
export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // First high tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    // Second higher tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.12); // D6
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio context may require user gesture on some browsers
    console.warn('Audio chime notice:', e);
  }
}
