import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Layers, 
  Compass, 
  Bike, 
  Zap, 
  Navigation2, 
  Radio, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { KIGALI_LOCATIONS } from '../data/kigaliLocations';

interface KigaliMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocationForBooking: (locationName: string) => void;
}

interface SectorCluster {
  id: string;
  name: string;
  district: string;
  ridersActive: number;
  avgPickupEtaMins: number;
  elevationM: number;
  x: number; // percentage on map
  y: number; // percentage on map
  status: 'optimal' | 'high_demand' | 'low_wait';
}

const CLUSTERS: SectorCluster[] = [
  { id: 'kcc', name: 'Kimihurura (KCC / Heights)', district: 'Gasabo', ridersActive: 24, avgPickupEtaMins: 2, elevationM: 1540, x: 52, y: 46, status: 'low_wait' },
  { id: 'cbd', name: 'Downtown CBD & CHIC', district: 'Nyarugenge', ridersActive: 38, avgPickupEtaMins: 1, elevationM: 1480, x: 32, y: 55, status: 'high_demand' },
  { id: 'remera', name: 'Remera & BK Arena', district: 'Gasabo', ridersActive: 29, avgPickupEtaMins: 2, elevationM: 1510, x: 68, y: 50, status: 'optimal' },
  { id: 'nyarutarama', name: 'Nyarutarama Golf Corridor', district: 'Gasabo', ridersActive: 16, avgPickupEtaMins: 3, elevationM: 1490, x: 60, y: 32, status: 'optimal' },
  { id: 'kacyiru', name: 'Kacyiru Ministries', district: 'Gasabo', ridersActive: 19, avgPickupEtaMins: 2, elevationM: 1560, x: 45, y: 35, status: 'optimal' },
  { id: 'airport', name: 'Kanombe Airport', district: 'Kicukiro', ridersActive: 14, avgPickupEtaMins: 4, elevationM: 1495, x: 84, y: 62, status: 'optimal' },
  { id: 'gikondo', name: 'Gikondo Trade Zone', district: 'Kicukiro', ridersActive: 18, avgPickupEtaMins: 3, elevationM: 1430, x: 48, y: 68, status: 'optimal' },
  { id: 'nyamirambo', name: 'Nyamirambo Green Quarter', district: 'Nyarugenge', ridersActive: 26, avgPickupEtaMins: 2, elevationM: 1520, x: 22, y: 70, status: 'low_wait' },
  { id: 'rebero', name: 'Rebero Panoramic Ridge', district: 'Kicukiro', ridersActive: 8, avgPickupEtaMins: 5, elevationM: 1750, x: 38, y: 82, status: 'optimal' },
];

export const KigaliMapModal: React.FC<KigaliMapModalProps> = ({
  isOpen,
  onClose,
  onSelectLocationForBooking,
}) => {
  const [selectedCluster, setSelectedCluster] = useState<SectorCluster>(CLUSTERS[0]);
  const [activeDistrict, setActiveDistrict] = useState<'All' | 'Gasabo' | 'Nyarugenge' | 'Kicukiro'>('All');

  if (!isOpen) return null;

  const filteredClusters = CLUSTERS.filter(
    (c) => activeDistrict === 'All' || c.district === activeDistrict
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="kigali-map-card"
        className="relative w-full max-w-4xl bg-[#141e12] border border-[#85AB8B]/30 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#b9efc5]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2c382a] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#202e1e] border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa] shadow-inner">
              <Compass className="w-6 h-6 text-[#9ed3aa]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-podium uppercase">
                  Live Kigali Topographic Cluster Map
                </h2>
                <span className="text-[10px] bg-[#336443] text-[#9ed3aa] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-[#9ed3aa] animate-ping" />
                  Live GPS
                </span>
              </div>
              <p className="text-xs text-[#c1c9bf]">
                187+ Verified Sanitized Moto Drivers active right now across Kigali's 3 Districts.
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

        {/* District Filter Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-[#0d160c] p-1 rounded-xl border border-[#2c382a]">
            {(['All', 'Gasabo', 'Nyarugenge', 'Kicukiro'] as const).map((dist) => (
              <button
                key={dist}
                onClick={() => setActiveDistrict(dist)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeDistrict === dist
                    ? 'bg-[#336443] text-white shadow'
                    : 'text-[#85AB8B] hover:text-white'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#9ed3aa] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9ed3aa] animate-pulse"></span>
            <span>Average City Pickup ETA: <strong>2.1 minutes</strong></span>
          </div>
        </div>

        {/* 3D / Topographic Vector Map Stage */}
        <div className="relative w-full h-[320px] sm:h-[380px] bg-[#0d160c] border border-[#2c382a] rounded-2xl overflow-hidden mb-4 shadow-inner select-none">
          {/* Topographic Contour Grid Lines Background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(#9ed3aa 1px, transparent 1px), radial-gradient(#336443 1px, #0d160c 1px)`,
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          />

          {/* Contour elevation curves */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
            <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#9ed3aa" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#336443" strokeWidth="1.5" />
            <path d="M 50 150 Q 200 80 400 160 T 800 120" fill="none" stroke="#9ed3aa" strokeWidth="1" />
            <path d="M 80 280 Q 280 210 500 290 T 900 240" fill="none" stroke="#85AB8B" strokeWidth="1" />
          </svg>

          {/* Render Cluster Nodes */}
          {filteredClusters.map((cluster) => {
            const isSelected = selectedCluster.id === cluster.id;
            return (
              <div
                key={cluster.id}
                onClick={() => setSelectedCluster(cluster)}
                style={{
                  left: `${cluster.x}%`,
                  top: `${cluster.y}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group z-10`}
              >
                {/* Ping wave */}
                <div className={`absolute -inset-2 rounded-full opacity-75 animate-ping ${
                  isSelected ? 'bg-[#9ed3aa]' : 'bg-[#336443]'
                }`} />

                {/* Node Pill */}
                <div className={`relative px-3 py-1.5 rounded-full border flex items-center gap-1.5 shadow-xl backdrop-blur-md transition-transform group-hover:scale-110 ${
                  isSelected 
                    ? 'bg-[#9ed3aa] border-white text-[#02391c] font-extrabold scale-110'
                    : 'bg-[#182216]/90 border-[#9ed3aa]/40 text-white hover:border-[#9ed3aa]'
                }`}>
                  <Bike className={`w-3.5 h-3.5 ${isSelected ? 'text-[#02391c]' : 'text-[#9ed3aa]'}`} />
                  <span className="text-[11px] whitespace-nowrap">{cluster.name.split(' ')[0]}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-[#02391c] text-[#9ed3aa]' : 'bg-[#336443] text-white'
                  }`}>
                    {cluster.ridersActive}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Legend badge */}
          <div className="absolute bottom-3 left-3 bg-[#141e12]/90 border border-[#2c382a] rounded-xl px-3 py-2 text-[10px] text-[#85AB8B] space-y-1 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#9ed3aa]"></span> High Rider Density (1-2m ETA)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#336443]"></span> Regular Patrol Lane
            </div>
          </div>
        </div>

        {/* Selected Sector Details Box */}
        {selectedCluster && (
          <div className="bg-[#0b160a] border border-[#9ed3aa]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <MapPin className="w-4 h-4 text-[#9ed3aa]" />
                <h4 className="text-base font-bold text-white font-podium uppercase">
                  {selectedCluster.name}
                </h4>
                <span className="text-[10px] bg-[#202e1e] text-[#9ed3aa] px-2 py-0.5 rounded font-bold border border-[#9ed3aa]/20">
                  {selectedCluster.district} District
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#c1c9bf]">
                <span>🏍️ <strong>{selectedCluster.ridersActive}</strong> Active Motos</span>
                <span>⏱️ Pickup ETA: <strong className="text-[#9ed3aa]">~{selectedCluster.avgPickupEtaMins} mins</strong></span>
                <span>⛰️ Altitude: <strong>{selectedCluster.elevationM}m</strong></span>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectLocationForBooking(selectedCluster.name);
                onClose();
              }}
              className="w-full sm:w-auto bg-[#9ed3aa] hover:bg-[#b9efc5] text-[#02391c] font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer transform active:scale-95"
            >
              <span>Dispatch Moto from {selectedCluster.name.split(' ')[0]}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
