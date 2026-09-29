import React, { useState } from 'react';
import { 
  X, 
  CloudRain, 
  Sun, 
  CloudLightning, 
  Droplets, 
  Wind, 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Umbrella,
  RefreshCw,
  Bike
} from 'lucide-react';
import { KigaliSectorWeather } from '../types';

interface KigaliRainRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookRainSafeRide?: () => void;
}

export const KigaliRainRadarModal: React.FC<KigaliRainRadarModalProps> = ({
  isOpen,
  onClose,
  onBookRainSafeRide,
}) => {
  const [selectedZone, setSelectedZone] = useState<'All' | 'Gasabo' | 'Nyarugenge' | 'Kicukiro'>('All');
  const [isSimulatingDownpour, setIsSimulatingDownpour] = useState(false);

  const kigaliSectorsWeather: KigaliSectorWeather[] = [
    {
      sector: 'Kimihurura (KCC & Heights)',
      zone: 'Gasabo',
      condition: isSimulatingDownpour ? 'heavy_rain' : 'clear',
      temperatureC: isSimulatingDownpour ? 19 : 24,
      roadTractionPercent: isSimulatingDownpour ? 74 : 96,
      rainPonchoRequired: isSimulatingDownpour,
      elevationMeters: 1480,
      advice: isSimulatingDownpour
        ? 'Steep descent towards Nyabugogo wet; rider deploying anti-lock dual brakes and passenger poncho.'
        : 'Clear dry tarmac along Boulevard de l’Umuganda. Ideal cruising.',
    },
    {
      sector: 'Remera (BK Arena & Giporoso)',
      zone: 'Gasabo',
      condition: isSimulatingDownpour ? 'light_rain' : 'clear',
      temperatureC: isSimulatingDownpour ? 20 : 25,
      roadTractionPercent: isSimulatingDownpour ? 82 : 98,
      rainPonchoRequired: isSimulatingDownpour,
      elevationMeters: 1460,
      advice: 'Smooth paved moto lanes around Prince House & Airport corridor. High traction.',
    },
    {
      sector: 'Rebero Ridge (Canal Olympia)',
      zone: 'Kicukiro',
      condition: isSimulatingDownpour ? 'heavy_rain' : 'light_rain',
      temperatureC: isSimulatingDownpour ? 18 : 22,
      roadTractionPercent: isSimulatingDownpour ? 68 : 88,
      rainPonchoRequired: true,
      elevationMeters: 1720,
      advice: 'High altitude mountain fog and slope gradient 14%. J&D riders adhere to maximum 35 km/h safety protocol.',
    },
    {
      sector: 'Nyamirambo (Mount Kigali & Cosmos)',
      zone: 'Nyarugenge',
      condition: isSimulatingDownpour ? 'heavy_rain' : 'clear',
      temperatureC: isSimulatingDownpour ? 19 : 26,
      roadTractionPercent: isSimulatingDownpour ? 71 : 94,
      rainPonchoRequired: isSimulatingDownpour,
      elevationMeters: 1540,
      advice: 'Cobblestone sections around Biryogo car-free zone wet; high grip tires inspected.',
    },
    {
      sector: 'Nyarutarama (Golf Course)',
      zone: 'Gasabo',
      condition: isSimulatingDownpour ? 'light_rain' : 'clear',
      temperatureC: isSimulatingDownpour ? 21 : 24,
      roadTractionPercent: isSimulatingDownpour ? 85 : 97,
      rainPonchoRequired: isSimulatingDownpour,
      elevationMeters: 1420,
      advice: 'Valley curves along Lake Nyarutarama. Clear visibility with minimal crosswinds.',
    },
    {
      sector: 'Downtown / CHIC & Nyabugogo Valley',
      zone: 'Nyarugenge',
      condition: isSimulatingDownpour ? 'heavy_rain' : 'clear',
      temperatureC: isSimulatingDownpour ? 20 : 25,
      roadTractionPercent: isSimulatingDownpour ? 75 : 95,
      rainPonchoRequired: isSimulatingDownpour,
      elevationMeters: 1360,
      advice: 'Heavy commercial traffic zone. Low-lying drainage active; waterproof boot covers provided on demand.',
    },
  ];

  const filteredSectors = selectedZone === 'All'
    ? kigaliSectorsWeather
    : kigaliSectorsWeather.filter((s) => s.zone === selectedZone);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="kigali-rain-radar-card"
        className="relative w-full max-w-3xl bg-[#141e12] border border-[#85AB8B]/30 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#7fb3ff]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2c382a] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#202e1e] border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa] shadow-inner">
              <CloudRain className="w-6 h-6 text-[#9ed3aa]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-podium uppercase">
                  Kigali Rain Radar & Road Traction
                </h2>
                <span className="text-[10px] bg-[#336443] text-[#b9efc5] font-extrabold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9ed3aa] animate-ping" />
                  Live 1,000 Hills Radar
                </span>
              </div>
              <p className="text-xs text-[#c1c9bf]">
                Real-time microclimate monitoring, hill road friction index, and automated rain poncho dispatch.
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

        {/* Live Weather Status Alert Banner */}
        <div className="p-4 bg-[#0d160c] border border-[#2c382a] rounded-2xl mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#182216] border border-[#85AB8B]/30 flex items-center justify-center text-[#9ed3aa] shrink-0">
              {isSimulatingDownpour ? (
                <CloudLightning className="w-6 h-6 text-yellow-400 animate-pulse" />
              ) : (
                <Sun className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{isSimulatingDownpour ? 'Tropical Rain Active across Kigali Ridges' : 'Dry & Clear Kigali Skies'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#202e1e] text-[#9ed3aa] border border-[#9ed3aa]/20">
                  {isSimulatingDownpour ? 'Ponchos Auto-Assigned' : 'Standard Cruise Mode'}
                </span>
              </div>
              <p className="text-[11px] text-[#85AB8B]">
                Average City Temp: <strong>{isSimulatingDownpour ? '19°C' : '24°C'}</strong> • Average Traction: <strong>{isSimulatingDownpour ? '76% (Caution)' : '96% (High Grip)'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setIsSimulatingDownpour(!isSimulatingDownpour)}
              className="text-xs bg-[#1f2a1d] hover:bg-[#336443] text-[#b9efc5] border border-[#85AB8B]/30 px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isSimulatingDownpour ? 'Reset to Clear Weather' : 'Simulate Rain Radar'}</span>
            </button>
          </div>
        </div>

        {/* Zone Filters */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            {(['All', 'Gasabo', 'Nyarugenge', 'Kicukiro'] as const).map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedZone === zone
                    ? 'bg-[#9ed3aa] text-[#02391c] shadow-md'
                    : 'bg-[#182216] text-[#c1c9bf] hover:text-white border border-[#2c382a]'
                }`}
              >
                {zone === 'All' ? 'All Kigali Sectors' : zone}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#85AB8B]">
            <Umbrella className="w-3.5 h-3.5 text-[#9ed3aa]" />
            <span>100% Free Rain Poncho with Every Rider</span>
          </div>
        </div>

        {/* Sector Weather & Road Traction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 max-h-[320px] overflow-y-auto pr-1">
          {filteredSectors.map((sector, idx) => (
            <div
              key={idx}
              className="bg-[#0e170d] border border-[#2c382a] hover:border-[#9ed3aa]/40 rounded-2xl p-3.5 transition-all space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{sector.sector}</span>
                  </div>
                  <div className="text-[10px] text-[#85AB8B]">
                    {sector.zone} District • Elev. {sector.elevationMeters}m
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {sector.condition === 'heavy_rain' ? (
                    <span className="text-[10px] bg-blue-900/50 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-600/40 flex items-center gap-1">
                      <CloudLightning className="w-3 h-3 text-blue-300" />
                      Rain
                    </span>
                  ) : sector.condition === 'light_rain' ? (
                    <span className="text-[10px] bg-blue-900/30 text-blue-200 font-bold px-2 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-300" />
                      Drizzle
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-950/60 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-600/30 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-300" />
                      Clear
                    </span>
                  )}
                  <span className="text-xs font-bold text-white">{sector.temperatureC}°C</span>
                </div>
              </div>

              {/* Traction Meter */}
              <div>
                <div className="flex justify-between text-[10px] text-[#c1c9bf] mb-1">
                  <span>Road Traction Friction Index:</span>
                  <span className="font-bold text-white">{sector.roadTractionPercent}% Grip</span>
                </div>
                <div className="w-full h-1.5 bg-[#1f2a1d] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      sector.roadTractionPercent >= 90
                        ? 'bg-[#9ed3aa]'
                        : sector.roadTractionPercent >= 80
                        ? 'bg-amber-400'
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${sector.roadTractionPercent}%` }}
                  />
                </div>
              </div>

              {/* Sector Specific Advice */}
              <p className="text-[11px] text-[#85AB8B] bg-[#141e12] p-2 rounded-xl border border-[#2c382a]/50">
                {sector.advice}
              </p>
            </div>
          ))}
        </div>

        {/* Rain Safety Guarantee Bottom Box */}
        <div className="bg-[#182216] border border-[#9ed3aa]/40 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#202e1e] flex items-center justify-center text-[#9ed3aa] shrink-0 border border-[#9ed3aa]/30">
              <ShieldCheck className="w-5 h-5 text-[#9ed3aa]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">J & D All-Weather Rain Readiness Standard</div>
              <div className="text-[11px] text-[#85AB8B]">
                Every motorcycle carries sealed heavy-duty passenger ponchos, anti-slip mud guards, and fog visors.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (onBookRainSafeRide) onBookRainSafeRide();
              onClose();
            }}
            className="w-full sm:w-auto bg-[#9ed3aa] hover:bg-[#b9efc5] text-[#02391c] font-bold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Bike className="w-4 h-4" />
            <span>Book All-Weather Ride</span>
          </button>
        </div>

        <div className="text-center text-[10px] text-[#85AB8B]">
          Rwanda Meteorology Agency (Meteo Rwanda) Data Feed Sync • Zero Surge Pricing Guaranteed
        </div>
      </div>
    </div>
  );
};
