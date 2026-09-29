import React, { useState, useMemo, useEffect } from 'react';
import { 
  Cpu, 
  CloudRain, 
  Sun, 
  TrafficCone, 
  TrendingUp, 
  Mountain, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Check, 
  X,
  Gauge
} from 'lucide-react';
import { 
  predictMLEta, 
  TrafficLevel, 
  WeatherType, 
  MLEtaPredictionResult 
} from '../utils/mlEtaPredictor';

interface MlEtaPredictorProps {
  distanceKm: number;
  initialTraffic?: TrafficLevel;
  initialWeather?: WeatherType;
  pilotName?: string;
  onEtaCalculated?: (eta: MLEtaPredictionResult) => void;
  compact?: boolean;
}

export const MlEtaPredictorPillBadge: React.FC<MlEtaPredictorProps> = ({
  distanceKm,
  initialTraffic = 'moderate',
  initialWeather = 'clear',
  pilotName = 'Pilot',
  onEtaCalculated,
  compact = true,
}) => {
  const [traffic, setTraffic] = useState<TrafficLevel>(initialTraffic);
  const [weather, setWeather] = useState<WeatherType>(initialWeather);
  const [elevationM, setElevationM] = useState<number>(45);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Compute ML prediction dynamically
  const prediction: MLEtaPredictionResult = useMemo(() => {
    return predictMLEta({
      distanceKm: Math.max(1.2, distanceKm || 3.5),
      trafficLevel: traffic,
      weather: weather,
      elevationDeltaM: elevationM,
      pilotExperienceYears: 5,
    });
  }, [distanceKm, traffic, weather, elevationM]);

  useEffect(() => {
    if (onEtaCalculated) {
      onEtaCalculated(prediction);
    }
  }, [prediction, onEtaCalculated]);

  return (
    <>
      {/* Inline Badge in the Floating Active Trip Pill */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          setDetailsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#142e1d] hover:bg-[#1e442a] text-[#a9f3bc] border border-[#34A853]/60 transition-all cursor-pointer shadow-sm group/ml"
        title="View ML ETA Breakdown (Traffic & Weather Conditions)"
      >
        <Cpu className="w-3 h-3 text-[#34A853] animate-pulse" />
        <span className="font-mono">ML ETA {prediction.formattedEta}</span>
        <span className="text-[9px] text-[#71af81] hidden sm:inline">({prediction.confidenceScorePercent}% ML)</span>
        {weather === 'heavy_rain' && <CloudRain className="w-2.5 h-2.5 text-sky-400" />}
        {traffic === 'heavy_rush_hour' && <TrafficCone className="w-2.5 h-2.5 text-amber-400" />}
      </div>

      {/* Interactive ML ETA Model Drawer / Modal */}
      {detailsOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-lg bg-[#111c10] border border-[#34A853]/50 rounded-3xl p-5 sm:p-6 shadow-2xl text-[#d9e6d2] overflow-hidden">
            {/* Top Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#34A853] via-[#9ed3aa] to-[#34A853]" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#253924] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#34A853]/20 border border-[#34A853]/40 flex items-center justify-center text-[#34A853]">
                  <Cpu className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Machine Learning ETA Predictor</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#34A853]/30 text-[#85e7a1] border border-[#34A853]/40">
                      LIVE INFERENCE
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#93ac91]">
                    Real-time gradient boosted transit regression calibrated on Kigali topography.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className="w-8 h-8 rounded-full bg-[#1b2b1a] hover:bg-[#253e24] text-[#a1baa0] hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Big ETA Display Card */}
            <div className="p-4 rounded-2xl bg-[#172716] border border-[#2b442a] mb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#86e29b] tracking-wider">Estimated Moto Arrival</div>
                <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
                  <span>{prediction.formattedEta}</span>
                  <span className="text-xs font-semibold text-[#a5cca3]">({prediction.estimatedArrivalTime})</span>
                </div>
                <div className="text-[11px] text-[#95b893] mt-0.5 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#34A853]" />
                  <span>Model Confidence: <strong>{prediction.confidenceScorePercent}%</strong></span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-[#8eb28c]">Transit Distance</div>
                <div className="text-xl font-bold text-[#b9efc5]">{(distanceKm || 3.5).toFixed(1)} km</div>
                <div className="text-[10px] text-[#7d9f7a] font-mono">v3.2 GBDT Neural Weights</div>
              </div>
            </div>

            {/* Dynamic Interactive Input Adjustments */}
            <div className="space-y-3 mb-4">
              {/* Traffic Condition Toggle */}
              <div>
                <label className="text-[11px] font-bold text-[#a6cca4] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <TrafficCone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kigali Traffic Density</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['light', 'moderate', 'heavy_rush_hour', 'gridlock'] as TrafficLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setTraffic(level)}
                      className={`px-2 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                        traffic === level
                          ? 'bg-[#294c26] text-white border-[#34A853] shadow-sm'
                          : 'bg-[#152214] text-[#98b896] border-[#223521] hover:bg-[#1a2d19]'
                      }`}
                    >
                      {level === 'light' && '🟢 Off-Peak'}
                      {level === 'moderate' && '🟡 Normal'}
                      {level === 'heavy_rush_hour' && '🟠 Rush Hr'}
                      {level === 'gridlock' && '🔴 Gridlock'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather Condition Toggle */}
              <div>
                <label className="text-[11px] font-bold text-[#a6cca4] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                  <span>Weather & Road Traction</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['clear', 'light_rain', 'heavy_rain', 'kigali_mist'] as WeatherType[]).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeather(w)}
                      className={`px-2 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                        weather === w
                          ? 'bg-[#213f28] text-white border-[#34A853] shadow-sm'
                          : 'bg-[#152214] text-[#98b896] border-[#223521] hover:bg-[#1a2d19]'
                      }`}
                    >
                      {w === 'clear' && '☀️ Clear'}
                      {w === 'light_rain' && '🌦️ Drizzle'}
                      {w === 'heavy_rain' && '🌧️ Rain'}
                      {w === 'kigali_mist' && '🌫️ Mist'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topographic Hill Gradient */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-[#a6cca4] uppercase tracking-wider mb-1">
                  <span className="flex items-center gap-1.5">
                    <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Topographic Gradient (1,000 Hills Incline)</span>
                  </span>
                  <span className="text-white font-mono">+{elevationM}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="25"
                  value={elevationM}
                  onChange={(e) => setElevationM(parseInt(e.target.value, 10))}
                  className="w-full accent-[#34A853] bg-[#1e2f1d] rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-[#719370] mt-1 font-mono">
                  <span>Valley Flat (Nyabugogo)</span>
                  <span>Mid Ridge (KCC)</span>
                  <span>Steep Hill (Rebero)</span>
                </div>
              </div>
            </div>

            {/* Feature Weights Decomposition */}
            <div className="p-3 bg-[#152414] rounded-2xl border border-[#273c26] space-y-2 mb-4">
              <div className="text-[10px] font-bold text-[#9fc79d] uppercase tracking-wider flex items-center justify-between">
                <span>ML Feature Decomposition</span>
                <span className="text-[9px] text-[#6d916b]">Linear & Non-linear factors</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {prediction.features.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
                      <span className="text-[#c1d9be]">{f.feature}:</span>
                    </div>
                    <div className="font-mono text-white">
                      {f.impactMinutes > 0 ? `+${f.impactMinutes}m` : `${f.impactMinutes}m`}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety & Protocol Advisory */}
            <div className="p-3 bg-[#162719] rounded-xl border border-[#34A853]/30 text-[11px] text-[#a4efb9] flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-[#34A853] shrink-0 mt-0.5" />
              <span>{prediction.safetyAdvisory}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
