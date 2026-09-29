// Fluent Multilingual Voice Synthesizer with Studio Phonetics
import { studioAudio } from './studioAudio';

export type VoicePersona = 
  | 'kezia_studio' 
  | 'aline_melodic' 
  | 'damascene_radio' 
  | 'zephyr_express' 
  | 'puck_lively';

export interface VoiceMeta {
  id: VoicePersona;
  geminiVoiceName: string;
  displayName: string;
  badge: string;
  description: string;
  gender: 'female' | 'male' | 'neutral';
  tone: string;
  rate: number;
  pitch: number;
}

export const GEMINI_VOICE_PERSONAS: Record<VoicePersona, VoiceMeta> = {
  kezia_studio: {
    id: 'kezia_studio',
    geminiVoiceName: 'Aoede',
    displayName: '✨ Kezia Studio',
    badge: 'Studio HD',
    description: 'Warm studio presence with natural cadence, clear articulation, and reassuring tone.',
    gender: 'female',
    tone: 'Warm & Natural Broadcast',
    rate: 0.96,
    pitch: 1.0,
  },
  aline_melodic: {
    id: 'aline_melodic',
    geminiVoiceName: 'Kore',
    displayName: '🌸 Aline Melodic',
    badge: 'Melodic Calm',
    description: 'Gentle, soothing melodic voice designed for calm and relaxed trip confirmations.',
    gender: 'female',
    tone: 'Soothing & Gentle',
    rate: 0.92,
    pitch: 1.06,
  },
  damascene_radio: {
    id: 'damascene_radio',
    geminiVoiceName: 'Fenrir',
    displayName: '🏍️ Damascene Radio',
    badge: 'Radio Dispatch',
    description: 'Deep, resonant, and charismatic male voice with confident moto dispatcher presence.',
    gender: 'male',
    tone: 'Resonant & Confident',
    rate: 0.94,
    pitch: 0.88,
  },
  zephyr_express: {
    id: 'zephyr_express',
    geminiVoiceName: 'Zephyr',
    displayName: '⚡ Zephyr Express',
    badge: 'Express Alerts',
    description: 'Crisp, modern, and rapid conversational voice for instant express alerts.',
    gender: 'neutral',
    tone: 'Crisp & Modern',
    rate: 1.02,
    pitch: 1.0,
  },
  puck_lively: {
    id: 'puck_lively',
    geminiVoiceName: 'Puck',
    displayName: '🌟 Puck Friendly',
    badge: 'Upbeat Warmth',
    description: 'Energetic, friendly, and approachable voice for smooth community rides.',
    gender: 'neutral',
    tone: 'Upbeat & Welcoming',
    rate: 0.98,
    pitch: 1.08,
  },
};

class NaturalVoiceEngine {
  private isSpeaking = false;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.initVoices();
  }

  private initVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      try {
        const loaded = window.speechSynthesis.getVoices();
        if (loaded && loaded.length > 0) {
          this.voices = loaded;
        }
      } catch (e) {
        // silent
      }
    };

    updateVoices();
    if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  /**
   * Phonetic Naturalizer for Studio Quality
   */
  public formatNaturalSpeechText(
    text: string,
    language: 'kinyarwanda' | 'english' | 'french'
  ): string {
    let natural = text;

    // Convert number + RWF to natural full currency words
    natural = natural
      .replace(/(\d+)\s*RWF/gi, '$1 Rwandan Francs')
      .replace(/\b(\d+)\s*km\b/gi, '$1 kilometers')
      .replace(/\bKCC\b/g, 'Kigali Convention Centre')
      .replace(/\bBK\s+Arena\b/gi, 'B K Arena')
      .replace(/\bCHIC\b/g, 'CHIC building downtown')
      .replace(/\bCHUK\b/g, 'CHUK hospital')
      .replace(/\bMTN\s*Center\b/gi, 'MTN Centre Nyarutarama')
      .replace(/\bKGL\b/gi, 'Kigali')
      .replace(/\bSOS\b/g, 'S O S Village')
      .replace(/\bULK\b/g, 'U L K University');

    if (language === 'french') {
      natural = natural
        .replace(/Rwandan Francs/gi, 'Francs Rwandais')
        .replace(/kilometers/gi, 'kilomètres')
        .replace(/\bCHIC building downtown\b/g, 'bâtiment CHIC centre-ville')
        .replace(/\bCHUK hospital\b/g, 'hôpital CHUK');
    }

    return natural;
  }

  /**
   * Generates a fluent, clear speech sentence for dispatch confirmation
   */
  public getFluentDispatchPhrase(result: {
    pickup: string;
    dropoff: string;
    estimatedFareRwf?: number;
    estimatedFare?: number;
    serviceType?: string;
  }, language: 'kinyarwanda' | 'english' | 'french'): string {
    const fare = (result.estimatedFareRwf || result.estimatedFare || 1500).toLocaleString();
    const isDelivery = result.serviceType === 'delivery';

    if (language === 'french') {
      if (isDelivery) {
        return `Livraison express confirmée de ${result.pickup} vers ${result.dropoff}. Tarif estimé : ${fare} Francs Rwandais. Coursier certifié en route.`;
      }
      return `Trajet moto confirmé depuis ${result.pickup} vers ${result.dropoff}. Tarif estimé : ${fare} Francs Rwandais. Pilote certifié en approche.`;
    }

    if (isDelivery) {
      return `Express delivery confirmed from ${result.pickup} to ${result.dropoff}. Estimated fare is ${fare} Rwandan Francs. Top rated courier is dispatched.`;
    }

    return `Ride confirmed from ${result.pickup} to ${result.dropoff}. Estimated fare is ${fare} Rwandan Francs. Your certified moto driver is on the way.`;
  }

  private getOptimalVoice(
    language: 'kinyarwanda' | 'english' | 'french',
    persona: VoicePersona
  ): SpeechSynthesisVoice | null {
    if (this.voices.length === 0 && typeof window !== 'undefined' && window.speechSynthesis) {
      this.voices = window.speechSynthesis.getVoices() || [];
    }

    if (this.voices.length === 0) return null;

    const isFrench = language === 'french';
    const personaMeta = GEMINI_VOICE_PERSONAS[persona] || GEMINI_VOICE_PERSONAS.kezia_studio;
    const isMale = personaMeta.gender === 'male';

    const langPrefix = isFrench ? 'fr' : 'en';
    const langVoices = this.voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
    const pool = langVoices.length > 0 ? langVoices : this.voices;

    let bestVoice = pool[0];
    let bestScore = -1;

    for (const v of pool) {
      let score = 0;
      const name = (v.name || '').toLowerCase();

      if (name.includes('natural') || name.includes('online') || name.includes('neural')) score += 50;
      if (name.includes('google') || name.includes('samantha') || name.includes('daniel') || name.includes('karen')) score += 30;
      if (name.includes('premium') || name.includes('enhanced') || name.includes('siri')) score += 40;

      if (isMale) {
        if (name.includes('male') || name.includes('guy') || name.includes('david') || name.includes('henri') || name.includes('george') || name.includes('daniel')) {
          score += 25;
        }
      } else {
        if (name.includes('female') || name.includes('zira') || name.includes('samantha') || name.includes('catherine') || name.includes('victoria') || name.includes('amelie')) {
          score += 25;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestVoice = v;
      }
    }

    return bestVoice || this.voices[0] || null;
  }

  public async speak({
    text,
    language,
    persona = 'kezia_studio',
    playChime = true,
    onStart,
    onEnd,
    onError,
  }: {
    text: string;
    language: 'kinyarwanda' | 'english' | 'french';
    persona?: VoicePersona;
    playChime?: boolean;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }) {
    this.stop();

    if (!text || typeof text !== 'string' || !text.trim()) {
      if (onError) onError();
      return;
    }

    if (playChime) {
      await studioAudio.playChime();
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onError) onError();
      return;
    }

    try {
      const naturalText = this.formatNaturalSpeechText(text, language);
      const personaMeta = GEMINI_VOICE_PERSONAS[persona] || GEMINI_VOICE_PERSONAS.kezia_studio;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(naturalText);
      this.currentUtterance = utterance;

      const voice = this.getOptimalVoice(language, persona);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || (language === 'french' ? 'fr-FR' : 'en-US');
      }

      utterance.rate = personaMeta.rate || 0.96;
      utterance.pitch = personaMeta.pitch || 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          if (onError) onError();
        } else {
          if (onEnd) onEnd();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onError) onError();
    }
  }

  public stop() {
    this.isSpeaking = false;
    this.currentUtterance = null;

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // silent
      }
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const naturalVoice = new NaturalVoiceEngine();
