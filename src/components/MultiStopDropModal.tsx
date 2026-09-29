import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Layers, 
  MapPin, 
  Phone, 
  User, 
  ArrowDown, 
  CheckCircle2, 
  Calculator, 
  Navigation,
  Sparkles,
  ArrowRight,
  PackageCheck
} from 'lucide-react';
import { MultiStopWaypoint, DeliveryCategory } from '../types';
import { KIGALI_LOCATIONS } from '../data/kigaliLocations';

interface MultiStopDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedWithMultiStop: (multiStopData: {
    pickup: string;
    waypoints: MultiStopWaypoint[];
    category: DeliveryCategory;
    totalDistanceKm: number;
    totalFareRwf: number;
    specialNotes: string;
  }) => void;
}

export const MultiStopDropModal: React.FC<MultiStopDropModalProps> = ({
  isOpen,
  onClose,
  onProceedWithMultiStop,
}) => {
  const [pickupLocation, setPickupLocation] = useState('Kigali Heights, Kimihurura');
  const [category, setCategory] = useState<DeliveryCategory>('small_parcel');
  const [specialNotes, setSpecialNotes] = useState('');

  const [stops, setStops] = useState<MultiStopWaypoint[]>([
    {
      id: 'stop-1',
      address: 'Kacyiru (US Embassy / MINALOC)',
      sector: 'Kacyiru',
      recipientName: 'Alice Mukamana',
      recipientPhone: '0796569416',
      notes: 'Hand over sealed envelope at reception desk',
      stopType: 'dropoff',
    },
    {
      id: 'stop-2',
      address: 'Downtown CHIC Building / CBD',
      sector: 'Nyarugenge',
      recipientName: 'Jean Claude Karasira',
      recipientPhone: '+250 785 987 654',
      notes: 'Shop #B-42, 2nd floor',
      stopType: 'dropoff',
    },
  ]);

  const handleAddStop = () => {
    if (stops.length >= 5) return;
    const newId = `stop-${stops.length + 1}`;
    setStops([
      ...stops,
      {
        id: newId,
        address: 'BK Arena, Remera',
        sector: 'Remera',
        recipientName: '',
        recipientPhone: '+250 78',
        notes: '',
        stopType: 'dropoff',
      },
    ]);
  };

  const handleRemoveStop = (id: string) => {
    if (stops.length <= 1) return;
    setStops(stops.filter((s) => s.id !== id));
  };

  const handleUpdateStop = (id: string, field: keyof MultiStopWaypoint, value: string) => {
    setStops(
      stops.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Distance and Fare Calculations
  const calculatedDistanceKm = Number((3.5 + stops.length * 3.8).toFixed(1));
  const baseTariff = 1500;
  const perStopTariff = 800;
  const categoryAllowance = category === 'fragile_goods' ? 1000 : category === 'document' ? 0 : 500;
  const totalFareRwf = baseTariff + (stops.length - 1) * perStopTariff + Math.round(calculatedDistanceKm * 150) + categoryAllowance;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="multi-stop-drop-card"
        className="relative w-full max-w-3xl bg-[#141e12] border border-[#85AB8B]/30 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#b9efc5]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2c382a] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#202e1e] border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa] shadow-inner">
              <Layers className="w-6 h-6 text-[#9ed3aa]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-podium uppercase">
                  Multi-Stop Route & Package Drop
                </h2>
                <span className="text-[10px] bg-[#9ed3aa] text-[#02391c] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Kigali Courier Hop
                </span>
              </div>
              <p className="text-xs text-[#c1c9bf]">
                Deliver to multiple clients, shops, or offices across Kigali in a single smooth moto run.
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

        {/* Pickup Location Point */}
        <div className="p-3.5 bg-[#0d160c] border border-[#2c382a] rounded-2xl mb-4 space-y-2">
          <div className="text-[10px] font-bold text-[#85AB8B] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#9ed3aa] animate-pulse" />
            <span>Starting Pickup Hub</span>
          </div>
          <select
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            className="w-full bg-[#182216] border border-[#2c382a] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#9ed3aa]"
          >
            {KIGALI_LOCATIONS.map((loc) => (
              <option key={loc.id} value={`${loc.name} (${loc.sector})`}>
                {loc.name} — {loc.sector} ({loc.zone})
              </option>
            ))}
          </select>
        </div>

        {/* Stop Sequence List */}
        <div className="space-y-3 mb-5 max-h-[300px] overflow-y-auto pr-1">
          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className="bg-[#0e170d] border border-[#2c382a] rounded-2xl p-3.5 space-y-3 relative group hover:border-[#9ed3aa]/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#336443] text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Dropoff Stop #{index + 1}
                  </span>
                </div>

                {stops.length > 1 && (
                  <button
                    onClick={() => handleRemoveStop(stop.id)}
                    className="text-red-400 hover:text-red-300 p-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 transition-colors"
                    title="Remove Stop"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Stop Address Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#85AB8B] block mb-1">Destination Sector/Landmark</label>
                  <select
                    value={stop.address}
                    onChange={(e) => handleUpdateStop(stop.id, 'address', e.target.value)}
                    className="w-full bg-[#182216] border border-[#2c382a] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
                  >
                    {KIGALI_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={`${loc.name}`}>
                        {loc.name} ({loc.sector})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#85AB8B] block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={stop.recipientName}
                    onChange={(e) => handleUpdateStop(stop.id, 'recipientName', e.target.value)}
                    placeholder="e.g. Alice Mukamana"
                    className="w-full bg-[#182216] border border-[#2c382a] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#85AB8B] block mb-1">Recipient Phone / MoMo</label>
                  <input
                    type="tel"
                    value={stop.recipientPhone}
                    onChange={(e) => handleUpdateStop(stop.id, 'recipientPhone', e.target.value)}
                    placeholder="+250 788 000 000"
                    className="w-full bg-[#182216] border border-[#2c382a] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#85AB8B] block mb-1">Dropoff Handover Note</label>
                  <input
                    type="text"
                    value={stop.notes}
                    onChange={(e) => handleUpdateStop(stop.id, 'notes', e.target.value)}
                    placeholder="e.g. Leave at gate or 2nd floor"
                    className="w-full bg-[#182216] border border-[#2c382a] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
                  />
                </div>
              </div>
            </div>
          ))}

          {stops.length < 5 && (
            <button
              onClick={handleAddStop}
              className="w-full border-2 border-dashed border-[#2c382a] hover:border-[#9ed3aa] text-[#85AB8B] hover:text-[#9ed3aa] p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer bg-[#0d160c]/50"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Kigali Dropoff Stop (Max 5 Waypoints)</span>
            </button>
          )}
        </div>

        {/* Multi-Stop Fare Breakdown & Summary */}
        <div className="bg-[#0e170d] border border-[#9ed3aa]/40 rounded-2xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#2c382a] pb-2">
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-[#9ed3aa]" />
                <span>Multi-Stop Consolidated Tariff</span>
              </div>
              <div className="text-[10px] text-[#85AB8B]">
                {stops.length} Drops • ~{calculatedDistanceKm} km Total Route
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm sm:text-base font-bold text-[#9ed3aa] uppercase tracking-wider">
                Direct Pilot Fare
              </div>
              <div className="text-[10px] text-[#85AB8B]">Agreed per stop with pilot</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#c1c9bf] gap-2">
            <span>✓ Dedicated Rider stays with package until all waypoints completed</span>
            <span>✓ SMS & Live OTP verification at every handover</span>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              onProceedWithMultiStop({
                pickup: pickupLocation,
                waypoints: stops,
                category,
                totalDistanceKm: calculatedDistanceKm,
                totalFareRwf,
                specialNotes,
              });
              onClose();
            }}
            className="w-full bg-[#9ed3aa] hover:bg-[#b9efc5] text-[#02391c] font-bold py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer transform active:scale-95"
          >
            <span>Dispatch Multi-Stop Courier ({stops.length} Stops)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center text-[10px] text-[#85AB8B]">
          J & D Kigali Express Courier Fleet • Full Transit Insurance Included
        </div>
      </div>
    </div>
  );
};
