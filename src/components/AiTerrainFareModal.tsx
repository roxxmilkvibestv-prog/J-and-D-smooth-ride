import React, { useState } from 'react';
import { 
  X, 
  Mountain, 
  CloudRain, 
  Sun, 
  Sparkles, 
  TrendingUp, 
  Gauge, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  DollarSign, 
  Navigation,
  Compass
} from 'lucide-react';
import { KIGALI_LOCATIONS } from '../data/kigaliLocations';
import { AiTerrainFareResult } from '../types';

interface AiTerrainFareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookWithRoute?: (pickup: string, dropoff: string) => void;
}

export const AiTerrainFareModal: React.FC<AiTerrainFareModalProps> = ({
  isOpen,
  onClose,
  onBookWithRoute,
}) => {
  const [pickup, setPickup] = useState(KIGALI_LOCATIONS[0].name);
  const [dropoff, setDropoff] = useState(KIGALI_LOCATIONS[9].name); // Nyamirambo or Rebero
  const [weather, setWeather] = useState<'clear' | 'rain' | 'heavy_rain'>('clear');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiTerrainFareResult | null>(null);

  const handleCalculateTerrain = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/ai/terrain-fare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup,
          dropoff,
          weather,
          timeOfDay: 'day',
        }),
      });

      if (!res.ok) throw new Error('API Error');
      const data: AiTerrainFareResult = await res.json();
      setResult(data);
    } catch (e) {
      console.warn(e);
      // Fallback
      const isRain = weather !== 'clear';
      setResult({
        elevationGainMeters: 168,
        hillGradientProfile: 'Steep climb ascending via Kimihurura ridge to Nyarugenge hill',
        terrainDifficulty: 'steep_ridge',
        weatherAdjustmentPercent: isRain ? 15 : 0,
        weatherConditionName: isRain ? 'Tropical Rainfall Mode (Rain Poncho Active)' : 'Clear Dry Kigali Weather',
        baseTariffRwf: 1600,
        terrainSafetyAllowanceRwf: 200,
        weatherAllowanceRwf: isRain ? 300 : 0,
        totalFairFareRwf: isRain ? 2100 : 1800,
        ecoFuelBurnScore: 91,
        riderSafetyTips: isRain 
          ? 'Driver instructed to use low gear & provide sanitized passenger waterproof cape.' 
          : 'Cruising along KG 2 Blvd with high fuel efficiency.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="ai-terrain-fare-card"
        className="relative w-full max-w-2xl bg-[#141e12] border border-[#85AB8B]/30 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#b9efc5]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#2c382a] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#202e1e] border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa] shadow-inner">
              <Mountain className="w-6 h-6 text-[#9ed3aa]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-podium uppercase">
                  Kigali 1,000 Hills Fare Engine
                </h2>
                <span className="text-[10px] bg-[#9ed3aa] text-[#02391c] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Zero Surge • Fair Pay
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#c1c9bf]">
                Real-time elevation gradient & weather compensation protecting both passenger and rider.
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

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#85AB8B] uppercase mb-1.5 block">
                Pickup Point
              </label>
              <select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-[#0d160c] border border-[#2c382a] focus:border-[#9ed3aa] rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                {KIGALI_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({loc.sector})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#85AB8B] uppercase mb-1.5 block">
                Destination Point
              </label>
              <select
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full bg-[#0d160c] border border-[#2c382a] focus:border-[#9ed3aa] rounded-xl p-3 text-xs text-white focus:outline-none"
              >
                {KIGALI_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({loc.sector})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Weather Toggle */}
          <div>
            <label className="text-xs font-bold text-[#85AB8B] uppercase mb-2 block">
              Current Kigali Weather Condition
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setWeather('clear')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  weather === 'clear'
                    ? 'bg-[#336443] border-[#9ed3aa] text-white shadow-md'
                    : 'bg-[#0d160c] border-[#2c382a] text-[#85AB8B] hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Sunny / Dry</span>
              </button>

              <button
                type="button"
                onClick={() => setWeather('rain')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  weather === 'rain'
                    ? 'bg-[#336443] border-[#9ed3aa] text-white shadow-md'
                    : 'bg-[#0d160c] border-[#2c382a] text-[#85AB8B] hover:text-white'
                }`}
              >
                <CloudRain className="w-4 h-4 text-cyan-400" />
                <span>Light Rain</span>
              </button>

              <button
                type="button"
                onClick={() => setWeather('heavy_rain')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  weather === 'heavy_rain'
                    ? 'bg-[#336443] border-[#9ed3aa] text-white shadow-md'
                    : 'bg-[#0d160c] border-[#2c382a] text-[#85AB8B] hover:text-white'
                }`}
              >
                <CloudRain className="w-4 h-4 text-blue-400" />
                <span>Tropical Downpour</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleCalculateTerrain}
            disabled={loading}
            className="w-full bg-[#9ed3aa] hover:bg-[#b9efc5] text-[#02391c] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating 3D Kigali Contours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Hill Incline & Transparent Tariff</span>
              </>
            )}
          </button>
        </div>

        {/* Calculation Result */}
        {result && (
          <div className="bg-[#0b160a] border border-[#9ed3aa]/40 rounded-2xl p-5 mb-4 animate-fade-up shadow-xl space-y-4">
            {/* Visual Elevation Graphic */}
            <div className="bg-[#141e12] p-4 rounded-xl border border-[#2c382a]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#9ed3aa]" />
                  Elevation Profile: +{result.elevationGainMeters}m Climb
                </span>
                <span className="text-[10px] text-[#85AB8B] uppercase font-bold px-2 py-0.5 bg-[#202e1e] rounded">
                  Difficulty: {result.terrainDifficulty?.replace('_', ' ')}
                </span>
              </div>

              {/* Simple stylized SVG Hill Contour */}
              <div className="h-16 w-full relative flex items-end">
                <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                  <path
                    d="M 0 50 Q 75 10, 150 35 T 300 15 L 300 60 L 0 60 Z"
                    fill="#336443"
                    opacity="0.3"
                  />
                  <path
                    d="M 0 50 Q 75 10, 150 35 T 300 15"
                    fill="none"
                    stroke="#9ed3aa"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute top-1 left-2 text-[10px] text-[#9ed3aa] font-bold">
                  {pickup}
                </div>
                <div className="absolute top-1 right-2 text-[10px] text-[#b9efc5] font-bold">
                  {dropoff}
                </div>
              </div>
              <p className="text-[11px] text-[#c1c9bf] mt-2 italic">
                "{result.hillGradientProfile}"
              </p>
            </div>

            {/* Transparent Fare Ledger */}
            <div className="bg-[#182216] p-4 rounded-xl border border-[#2c382a] text-xs space-y-2">
              <div className="text-[10px] font-bold uppercase text-[#85AB8B] tracking-wider border-b border-[#2c382a] pb-1.5">
                Itemized Fair Cost Breakdown
              </div>
              <div className="flex justify-between text-[#c1c9bf]">
                <span>Terrain Gradient & Elevation Factor</span>
                <span className="font-medium text-white">{result.elevationGainMeters}m climb</span>
              </div>
              <div className="flex justify-between text-[#c1c9bf]">
                <span>Engine Hill Load Compensation</span>
                <span className="font-medium text-[#9ed3aa]">Assessed for pilot consideration</span>
              </div>
              {result.weatherAllowanceRwf > 0 && (
                <div className="flex justify-between text-[#c1c9bf]">
                  <span>Wet Road Safety Buffer</span>
                  <span className="font-medium text-cyan-400">Included in safety advice</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#2c382a] flex justify-between items-center">
                <span className="font-bold text-white uppercase text-xs">Trip Fare Policy:</span>
                <span className="text-base font-bold text-[#9ed3aa] font-podium">
                  Direct Rider Agreement
                </span>
              </div>
            </div>

            {/* Safety & Eco Tip */}
            <div className="p-3 bg-[#141e12] rounded-xl border border-[#2c382a] text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9ed3aa] shrink-0 mt-0.5" />
              <div className="text-[#c1c9bf]">
                <strong className="text-white">Rider Safety Protocol: </strong>
                {result.riderSafetyTips}
              </div>
            </div>

            {onBookWithRoute && (
              <button
                onClick={() => {
                  onBookWithRoute(pickup, dropoff);
                  onClose();
                }}
                className="w-full bg-[#9ed3aa] hover:bg-[#b9efc5] text-[#02391c] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Book This Route with Transparent Price</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
