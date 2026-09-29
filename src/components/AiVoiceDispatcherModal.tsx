import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  Bike, 
  Package2, 
  CheckCircle2, 
  Compass, 
  MapPin, 
  ArrowRight, 
  Loader2, 
  HelpCircle, 
  Zap, 
  Volume2, 
  VolumeX, 
  Square, 
  Radio, 
  Sliders, 
  Star, 
  Activity, 
  Play 
} from 'lucide-react';
import { AiDispatchResult } from '../types';
import { resolveKigaliDispatch } from '../utils/kigaliDispatcher';
import { naturalVoice, VoicePersona, GEMINI_VOICE_PERSONAS } from '../utils/naturalVoiceSynthesizer';
import { studioAudio } from '../utils/studioAudio';

interface AiVoiceDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: (bookingData: {
    type: 'ride' | 'delivery';
    pickup: string;
    dropoff: string;
    tier: string;
    estimatedFare: number;
    distanceKm: number;
    notes?: string;
  }) => void;
}

export const AiVoiceDispatcherModal: React.FC<AiVoiceDispatcherModalProps> = ({
  isOpen,
  onClose,
  onProceedToBooking,
}) => {
  const [query, setQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState<'kinyarwanda' | 'english' | 'french'>('english');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiDispatchResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Default to Kezia's Studio HD persona
  const [voicePersona, setVoicePersona] = useState<VoicePersona>('kezia_studio');
  const [playRadioChime, setPlayRadioChime] = useState(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const sampleQueries = {
    english: [
      'Pick me up from Kigali Heights and take me to Kimironko Market.',
      'I want to send a delicate bakery cake box from Kimihurura to Kiyovu Serena Hotel.',
      'Need an express moto ride from Downtown CHIC building to Kacyiru US Embassy.',
      'Pickup from BK Arena to Kigali Convention Centre fast.'
    ],
    kinyarwanda: [
      'Ndi kuri Kigali Heights nshaka moto yo kunjyana ku isoko rya Kimironko vuba.',
      'Mfite ipaki y\'impapuro nshaka kohereza kuva CHUK kugera Nyabugogo gare.',
      'Nari kuri BK Arena nkeneye moto inyambutsa ijya Nyarutarama MTN Center.',
      'Nshaka kohereza gateau y\'ibirori kuva Kimihurura ujyana Kiyovu Serena Hotel.'
    ],
    french: [
      'Je suis à l\'Hôtel des Mille Collines, je veux aller au Centre Culturel de Nyamirambo.',
      'Livraison express d\'un paquet de Gikondo Expo vers Kagugu SOS.',
      'Moto sécurisée depuis Kigali Heights jusqu\'à Remera Giporoso.',
      'Départ de KCC pour l\'Aéroport International de Kanombe.'
    ]
  };

  const quickLandmarks = [
    'Kigali Heights',
    'BK Arena',
    'Kimironko Market',
    'KGL Airport',
    'Downtown CHIC',
    'Nyabugogo Gare',
    'CHUK Hospital',
    'Kacyiru Embassy',
    'Kiyovu Serena',
    'Nyamirambo Biryogo'
  ];

  // Stop audio if modal closes
  useEffect(() => {
    if (!isOpen) {
      naturalVoice.stop();
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  // Voice playback synthesis with fluent phrasing & acoustic chimes
  const playVoiceResponse = (textToSpeak?: string) => {
    if (isPlayingAudio) {
      naturalVoice.stop();
      setIsPlayingAudio(false);
      return;
    }

    // Generate crystal clear fluent phrasing
    const message = textToSpeak || 
      (result 
        ? naturalVoice.getFluentDispatchPhrase(result, selectedLang)
        : (selectedLang === 'french'
            ? 'Bienvenue sur J and D Smooth Ride Kigali. Pilote disponible immédiatement.'
            : 'Welcome to J and D Smooth Ride Kigali. Your route is confirmed and certified driver is ready.'));

    setIsPlayingAudio(true);

    naturalVoice.speak({
      text: message,
      language: selectedLang,
      persona: voicePersona,
      playChime: playRadioChime,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  // Preview test voice persona with clean natural sentence
  const handleTestPersona = (personaToTest: VoicePersona) => {
    setVoicePersona(personaToTest);
    const testPhrase = selectedLang === 'french'
      ? 'Bonjour! Bienvenue sur J and D Smooth Ride Kigali. Votre trajet est sécurisé avec un casque désinfecté.'
      : 'Hello! I am your J and D Kigali Smooth Ride dispatcher. Your safe ride and sanitized helmet are ready.';

    setIsPlayingAudio(true);

    naturalVoice.speak({
      text: testPhrase,
      language: selectedLang,
      persona: personaToTest,
      playChime: playRadioChime,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  // Voice recording using Web Speech API
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const defaultInput = 'Pick me up from Kigali Heights and take me to Kimironko Market';
      setQuery(defaultInput);
      handleDispatch(defaultInput);
      return;
    }

    try {
      studioAudio.playRadioBeep();
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLang === 'french' ? 'fr-FR' : 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsRecording(false);
        handleDispatch(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  const handleDispatch = async (inputQuery?: string) => {
    const textToSend = inputQuery || query;
    if (!textToSend.trim()) return;

    setLoading(true);

    // Compute instant client-side resolution as immediate baseline
    const localResolution = resolveKigaliDispatch(textToSend, selectedLang);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch('/api/ai/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          language: selectedLang,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: AiDispatchResult = await response.json();
        setResult(data);
      } else {
        setResult(localResolution);
      }
      studioAudio.playSuccessPing();
    } catch (err: any) {
      setResult(localResolution);
      studioAudio.playSuccessPing();
    } finally {
      setLoading(false);
    }
  };

  const handleLandmarkChipClick = (landmark: string) => {
    const newQuery = query ? `${query} to ${landmark}` : `From Kigali Heights to ${landmark}`;
    setQuery(newQuery);
    handleDispatch(newQuery);
  };

  const activePersonaMeta = GEMINI_VOICE_PERSONAS[voicePersona] || GEMINI_VOICE_PERSONAS.kezia_studio;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#121c11] border border-[#9ed3aa]/40 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1e2a1c] hover:bg-[#2c382a] text-[#85AB8B] hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#336443] flex items-center justify-center text-[#9ed3aa] shadow-inner">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-podium tracking-wide text-white">
                Kigali AI Voice Dispatcher
              </h2>
              <span className="bg-[#9ed3aa]/20 border border-[#9ed3aa]/40 text-[#9ed3aa] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                Studio Audio
              </span>
            </div>
            <p className="text-xs text-[#85AB8B] mt-0.5">
              Natural conversational dispatch with instant route calculation and audio confirmations.
            </p>
          </div>
        </div>

        {/* Language & Voice Controls */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4 bg-[#0d160c] p-2.5 rounded-2xl border border-[#2c382a]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedLang('english')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedLang === 'english'
                  ? 'bg-[#336443] text-white shadow-md'
                  : 'text-[#85AB8B] hover:text-white'
              }`}
            >
              🇬🇧 English (Fluent)
            </button>
            <button
              onClick={() => setSelectedLang('french')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedLang === 'french'
                  ? 'bg-[#336443] text-white shadow-md'
                  : 'text-[#85AB8B] hover:text-white'
              }`}
            >
              🇫🇷 Français
            </button>
            <button
              onClick={() => setSelectedLang('kinyarwanda')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedLang === 'kinyarwanda'
                  ? 'bg-[#336443] text-white shadow-md'
                  : 'text-[#85AB8B] hover:text-white'
              }`}
            >
              🇷🇼 Ikinyarwanda
            </button>
          </div>

          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              showVoiceSettings
                ? 'bg-[#336443] text-white border-[#9ed3aa]'
                : 'bg-[#182216] text-[#b9efc5] border-[#2c382a] hover:border-[#9ed3aa]/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#9ed3aa]" />
            <span>Voice: {activePersonaMeta.displayName}</span>
          </button>
        </div>

        {/* Voice Persona Settings Panel */}
        {showVoiceSettings && (
          <div className="p-3.5 bg-[#0d160c] border border-[#9ed3aa]/40 rounded-2xl mb-4 animate-fadeIn space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white border-b border-[#2c382a] pb-2">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#9ed3aa]" />
                <span>Select Dispatcher Voice Persona</span>
              </div>
              <span className="text-[10px] text-[#9ed3aa] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-current" />
                Studio Synthesizer Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Kezia */}
              <button
                onClick={() => handleTestPersona('kezia_studio')}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  voicePersona === 'kezia_studio'
                    ? 'bg-[#1f2e1c] border-[#9ed3aa] text-white shadow-md ring-1 ring-[#9ed3aa]/50'
                    : 'bg-[#141e12] border-[#2c382a] text-[#c1c9bf] hover:text-white'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>✨ Kezia</span>
                    <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded">DEFAULT</span>
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#336443] text-[#b9efc5]">Studio HD</span>
                </div>
                <div className="text-[10px] text-[#85AB8B] mt-0.5">Warm, studio broadcast presence with crystal clarity</div>
              </button>

              {/* Aline */}
              <button
                onClick={() => handleTestPersona('aline_melodic')}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  voicePersona === 'aline_melodic'
                    ? 'bg-[#1f2e1c] border-[#9ed3aa] text-white shadow-md ring-1 ring-[#9ed3aa]/50'
                    : 'bg-[#141e12] border-[#2c382a] text-[#c1c9bf] hover:text-white'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>🌸 Aline</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#336443] text-[#b9efc5]">Calm</span>
                </div>
                <div className="text-[10px] text-[#85AB8B] mt-0.5">Gentle, soothing melodic tone with relaxed cadence</div>
              </button>

              {/* Damascene */}
              <button
                onClick={() => handleTestPersona('damascene_radio')}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  voicePersona === 'damascene_radio'
                    ? 'bg-[#1f2e1c] border-[#9ed3aa] text-white shadow-md ring-1 ring-[#9ed3aa]/50'
                    : 'bg-[#141e12] border-[#2c382a] text-[#c1c9bf] hover:text-white'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>🏍️ Damascene</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#336443] text-[#b9efc5]">Radio</span>
                </div>
                <div className="text-[10px] text-[#85AB8B] mt-0.5">Deep resonant male broadcaster with confident presence</div>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-[#c1c9bf]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={playRadioChime}
                  onChange={(e) => setPlayRadioChime(e.target.checked)}
                  className="rounded text-[#9ed3aa] focus:ring-0 bg-[#182216]"
                />
                <span>Play acoustic harmonic dispatch chime</span>
              </label>
              <span className="text-[#9ed3aa] font-medium flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#9ed3aa]" />
                Acoustic Studio Synthesizer
              </span>
            </div>
          </div>
        )}

        {/* Input Form with Microphone Button */}
        <div className="relative mb-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleDispatch();
              }
            }}
            placeholder={
              selectedLang === 'french'
                ? 'Parlez ou tapez: "Je suis à l\'Hôtel des Mille Collines, je cherche une moto pour Kanombe..."'
                : selectedLang === 'kinyarwanda'
                ? 'Vuga cyangwa wandike: "Ndi kuri Kigali Heights nshaka moto injyana ku isoko rya Kimironko..."'
                : 'Speak or type: "Pick me up at Kigali Heights and drop me at Kimironko Market..."'
            }
            rows={3}
            className="w-full bg-[#0d160c] border border-[#2c382a] focus:border-[#9ed3aa] rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder-[#616c5e] focus:outline-none transition-all pr-24"
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              onClick={toggleRecording}
              title="Voice Speech Input"
              className={`p-2.5 rounded-xl border transition-all ${
                isRecording 
                  ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' 
                  : 'bg-[#1f2a1d] border-[#85AB8B]/30 text-[#9ed3aa] hover:bg-[#336443] hover:text-white'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handleDispatch()}
              disabled={loading || !query.trim()}
              className="bg-[#9ed3aa] hover:bg-[#b9efc5] text-[#02391c] disabled:opacity-50 p-2.5 rounded-xl font-bold transition-all flex items-center justify-center shadow-lg cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Kigali Landmarks Bar */}
        <div className="mb-4">
          <div className="text-[10px] font-bold text-[#85AB8B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#9ed3aa]" />
            <span>Popular Kigali Destinations:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickLandmarks.map((lm, idx) => (
              <button
                key={idx}
                onClick={() => handleLandmarkChipClick(lm)}
                className="text-[11px] bg-[#1a2618] hover:bg-[#336443] hover:text-white text-[#c1c9bf] px-2.5 py-1 rounded-lg border border-[#2c382a] transition-all cursor-pointer"
              >
                + {lm}
              </button>
            ))}
          </div>
        </div>

        {/* Sample Quick Natural Prompts */}
        <div className="mb-5">
          <div className="text-[10px] font-bold text-[#85AB8B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-[#9ed3aa]" />
            <span>Try Sample Voice Sentences:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {sampleQueries[selectedLang].map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(sample);
                  handleDispatch(sample);
                }}
                className="text-left text-[11px] bg-[#0d160c] hover:bg-[#182216] text-[#c1c9bf] hover:text-white p-2 rounded-xl border border-[#2c382a] hover:border-[#9ed3aa]/40 transition-all truncate cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#9ed3aa] shrink-0" />
                <span className="truncate">"{sample}"</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Output Result Box */}
        {result && (
          <div className="bg-[#0b160a] border border-[#9ed3aa]/50 rounded-2xl p-4 sm:p-5 mb-4 space-y-3.5 animate-fade-up shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2c382a] pb-2.5">
              <div className="flex items-center gap-2">
                {result.tripType === 'ride' ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold bg-[#336443] text-white px-3 py-1 rounded-full uppercase">
                    <Bike className="w-3.5 h-3.5 text-[#9ed3aa]" />
                    Moto Ride Detected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold bg-[#336443] text-white px-3 py-1 rounded-full uppercase">
                    <Package2 className="w-3.5 h-3.5 text-[#b9efc5]" />
                    Instant Courier Delivery
                  </span>
                )}
                <span className="text-xs text-[#85AB8B]">
                  Tier: <strong className="text-white capitalize">{result.recommendedTier?.replace('_', ' ')}</strong>
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#9ed3aa] uppercase">
                  Direct Rider Fare
                </div>
                <div className="text-[10px] text-[#85AB8B]">~{result.distanceKm} km route</div>
              </div>
            </div>

            {/* Route Extracted */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-[#141e12] rounded-xl border border-[#2c382a]">
                <div className="text-[10px] text-[#85AB8B] uppercase font-bold mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#9ed3aa]" />
                  Pickup Point ({result.pickupSector})
                </div>
                <div className="font-semibold text-white">{result.pickup}</div>
              </div>
              <div className="p-3 bg-[#141e12] rounded-xl border border-[#2c382a]">
                <div className="text-[10px] text-[#85AB8B] uppercase font-bold mb-1 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-[#b9efc5]" />
                  Destination ({result.dropoffSector})
                </div>
                <div className="font-semibold text-white">{result.dropoff}</div>
              </div>
            </div>

            {/* Fluent Audio Dispatch Button */}
            <div className="p-3.5 bg-[#182216] rounded-xl border border-[#2c382a]/70 text-xs space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-[#85AB8B]">Studio Audio Confirmation</span>
                  <span className="text-[9px] bg-[#202e1e] text-[#9ed3aa] px-2 py-0.5 rounded-full border border-[#9ed3aa]/20 font-bold uppercase flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    {activePersonaMeta.displayName}
                  </span>
                </div>
                
                {/* Audio Voice Trigger Button */}
                <button
                  onClick={() => playVoiceResponse()}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-md ${
                    isPlayingAudio
                      ? 'bg-amber-500 text-[#0b160a] border border-amber-400 font-extrabold animate-pulse'
                      : 'bg-[#202e1e] text-[#9ed3aa] hover:bg-[#336443] hover:text-white border border-[#9ed3aa]/30'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Audio</span>
                      <span className="flex items-center gap-0.5 ml-1">
                        <span className="w-1 h-3 bg-black animate-pulse" />
                        <span className="w-1 h-4 bg-black animate-bounce" />
                        <span className="w-1 h-2 bg-black animate-pulse" />
                      </span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-[#9ed3aa]" />
                      <span>🔊 Listen to Dispatch</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[#b9efc5] font-medium flex items-start gap-1.5 text-[11px]">
                <span className="shrink-0">🇬🇧</span>
                <span>{result.englishExplanation}</span>
              </div>
              <div className="text-[#c1c9bf] flex items-start gap-1.5 text-[11px]">
                <span className="shrink-0">🇷🇼</span>
                <span>{result.kinyarwandaExplanation}</span>
              </div>
            </div>

            {/* Action Hand-off Button */}
            <button
              onClick={() => {
                onProceedToBooking({
                  type: result.tripType,
                  pickup: result.pickup,
                  dropoff: result.dropoff,
                  tier: result.recommendedTier,
                  estimatedFare: result.estimatedFareRwf,
                  distanceKm: result.distanceKm,
                  notes: result.parcelNotes,
                });
                onClose();
              }}
              className="w-full bg-[#9ed3aa] hover:bg-[#b9efc5] text-[#02391c] font-bold py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer transform active:scale-95"
            >
              <span>Confirm & Dispatch Smoothest Rider</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="text-center text-[10px] text-[#85AB8B] flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#9ed3aa]" />
          <span>J & D Smooth Ride Kigali • Studio Dispatch Voice & Instant Route Engine</span>
        </div>
      </div>
    </div>
  );
};
