import React, { useState } from 'react';
import { 
  X, 
  Package, 
  MapPin, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  ArrowRight, 
  AlertCircle,
  FileText,
  ShoppingBag,
  Gift,
  Coffee,
  Truck
} from 'lucide-react';
import { 
  KIGALI_LOCATIONS, 
  DELIVERY_OPTIONS, 
  calculateDistanceKm, 
  calculateDeliveryFare,
  MOCK_DRIVERS 
} from '../data/kigaliLocations';
import { BookingState, DeliveryCategory } from '../types';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (booking: BookingState) => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  isOpen,
  onClose,
  onBookingConfirmed,
}) => {
  const [pickupId, setPickupId] = useState('kh');
  const [customPickup, setCustomPickup] = useState('');
  const [dropoffId, setDropoffId] = useState('nyarutarama');
  const [customDropoff, setCustomDropoff] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DeliveryCategory>('small_parcel');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('+250 78');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('+250 78');
  const [packageDescription, setPackageDescription] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoNetwork, setMomoNetwork] = useState<'MTN' | 'Airtel'>('MTN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'details' | 'confirm'>('details');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const pickupLocation = KIGALI_LOCATIONS.find(l => l.id === pickupId);
  const dropoffLocation = KIGALI_LOCATIONS.find(l => l.id === dropoffId);

  const pickupText = customPickup.trim() || (pickupLocation ? `${pickupLocation.name} (${pickupLocation.sector})` : 'Pickup Spot');
  const dropoffText = customDropoff.trim() || (dropoffLocation ? `${dropoffLocation.name} (${dropoffLocation.sector})` : 'Recipient Address');

  const distanceKm = calculateDistanceKm(pickupId, dropoffId);
  const estimatedFare = calculateDeliveryFare(distanceKm, selectedCategory);

  const getCategoryIcon = (id: DeliveryCategory) => {
    switch (id) {
      case 'document': return <FileText className="w-5 h-5" />;
      case 'small_parcel': return <ShoppingBag className="w-5 h-5" />;
      case 'fragile_goods': return <Gift className="w-5 h-5" />;
      case 'food_grocery': return <Coffee className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !recipientName.trim()) {
      setErrorMsg('Please enter both sender and recipient names.');
      return;
    }
    if (senderPhone.length < 9 || recipientPhone.length < 9) {
      setErrorMsg('Please enter valid Rwandan telephone numbers for sender and recipient.');
      return;
    }
    setErrorMsg('');
    setStep('confirm');
  };

  const handleConfirmDeliveryDispatch = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const assignedDriver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

      const newBooking: BookingState = {
        id: `PKP-${Date.now().toString().slice(-6)}`,
        type: 'delivery',
        pickup: pickupText,
        dropoff: dropoffText,
        passengerName: senderName,
        phone: senderPhone,
        momoNumber: momoNumber || senderPhone,
        momoNetwork,
        deliveryCategory: selectedCategory,
        packageDetails: packageDescription || 'Standard Parcel / Package',
        recipientName,
        recipientPhone,
        distanceKm,
        fareRwf: estimatedFare,
        status: 'accepted',
        createdAt: new Date().toISOString(),
        driver: assignedDriver,
        otpCode,
      };

      setIsSubmitting(false);
      onBookingConfirmed(newBooking);
      onClose();
      setStep('details');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-fadeIn">
      <div 
        id="delivery-modal-card"
        className="relative w-full max-w-2xl bg-[#141e12] border border-[#85AB8B]/25 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2b4e34] via-[#9ed3aa] to-[#2b4e34]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#2c382a] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#222d20] border border-[#9ed3aa]/20 flex items-center justify-center text-[#9ed3aa]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Request Instant Pickup</span>
                <span className="text-[11px] font-semibold bg-[#2b4e34] text-[#b9efc5] px-2 py-0.5 rounded-full border border-[#9ed3aa]/30 uppercase">
                  Fast Courier
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#c1c9bf]">
                Door-to-door moto courier with SMS recipient tracking
              </p>
            </div>
          </div>
          <button
            id="close-delivery-modal-btn"
            onClick={onClose}
            className="text-[#c1c9bf] hover:text-white p-2 rounded-xl bg-[#1f2a1d] hover:bg-[#2c382a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'details' ? (
          <form onSubmit={handleSubmitDetails} className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-[#93000a]/30 border border-[#ffb4ab]/40 rounded-xl text-[#ffdad6] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Category Selector */}
            <div>
              <label className="block text-xs uppercase font-bold text-[#85AB8B] tracking-wider mb-2.5">
                Select Package Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DELIVERY_OPTIONS.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`cursor-pointer p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#2b4e34] border-[#9ed3aa] text-white shadow-md'
                          : 'bg-[#182216] border-[#414942]/30 text-[#c1c9bf] hover:border-[#85AB8B]/40'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#336443] text-[#9ed3aa]' : 'bg-[#222d20] text-[#c1c9bf]'}`}>
                        {getCategoryIcon(cat.id)}
                      </div>
                      <div className="font-semibold text-xs text-white line-clamp-1">{cat.name}</div>
                      <div className="text-[10px] text-[#85AB8B]">{cat.maxWeight}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Locations */}
            <div className="bg-[#182216] p-4 sm:p-5 rounded-2xl border border-[#414942]/30 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#c1c9bf] mb-1">
                  Pickup Location in Kigali
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={pickupId}
                    onChange={(e) => {
                      setPickupId(e.target.value);
                      setCustomPickup('');
                    }}
                    className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#9ed3aa]"
                  >
                    {KIGALI_LOCATIONS.map((loc) => (
                      <option key={`pkg-pick-${loc.id}`} value={loc.id}>
                        {loc.name} - {loc.sector}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Specific house / shop / building..."
                    value={customPickup}
                    onChange={(e) => setCustomPickup(e.target.value)}
                    className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-[#8b938a] focus:outline-none focus:border-[#9ed3aa]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c1c9bf] mb-1">
                  Recipient Dropoff Location
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={dropoffId}
                    onChange={(e) => {
                      setDropoffId(e.target.value);
                      setCustomDropoff('');
                    }}
                    className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#9ed3aa]"
                  >
                    {KIGALI_LOCATIONS.map((loc) => (
                      <option key={`pkg-drop-${loc.id}`} value={loc.id}>
                        {loc.name} - {loc.sector}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Recipient gate # / business name..."
                    value={customDropoff}
                    onChange={(e) => setCustomDropoff(e.target.value)}
                    className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-[#8b938a] focus:outline-none focus:border-[#9ed3aa]"
                  />
                </div>
              </div>
            </div>

            {/* Sender & Recipient Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#182216] p-4 rounded-xl border border-[#414942]/30 space-y-2.5">
                <div className="text-xs font-bold text-[#9ed3aa] uppercase">Sender Info</div>
                <input
                  type="text"
                  required
                  placeholder="Sender Full Name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
                />
                <input
                  type="tel"
                  required
                  placeholder="Sender Phone (+250 7...)"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
                />
              </div>

              <div className="bg-[#182216] p-4 rounded-xl border border-[#414942]/30 space-y-2.5">
                <div className="text-xs font-bold text-[#b9efc5] uppercase">Recipient Info</div>
                <input
                  type="text"
                  required
                  placeholder="Recipient Full Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
                />
                <input
                  type="tel"
                  required
                  placeholder="Recipient Phone (+250 7...)"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-[#222d20] border border-[#414942]/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#c1c9bf] mb-1">
                Package Description & Special Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Legal documents in sealed envelope, fragile handle with care..."
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                className="w-full bg-[#182216] border border-[#414942]/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#9ed3aa]"
              />
            </div>

            {/* Bottom Fare & Next - Rider Decides Fare */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#2c382a]">
              <div>
                <div className="text-xs text-[#c1c9bf]">Delivery Distance ({distanceKm} km)</div>
                <div className="text-lg sm:text-xl font-extrabold text-[#9ed3aa] flex items-center gap-1.5">
                  <span>Courier-Agreed Fare</span>
                  <span className="text-[10px] bg-[#336443] text-white px-2 py-0.5 rounded-full uppercase font-normal">Direct</span>
                </div>
                <div className="text-[11px] text-[#85AB8B]">Driver decides fair rate directly with sender</div>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-[#336443] hover:bg-[#3d7751] text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                <span>Confirm Courier Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Payment Confirmation */
          <div className="space-y-6">
            <div className="bg-[#182216] p-5 rounded-2xl border border-[#414942]/30 space-y-3 text-sm">
              <div className="flex justify-between pb-2 border-b border-[#2c382a]">
                <span className="text-[#c1c9bf]">Pickup</span>
                <span className="font-semibold text-white">{pickupLocation?.name}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#2c382a]">
                <span className="text-[#c1c9bf]">Deliver To</span>
                <span className="font-semibold text-white">{dropoffLocation?.name} ({recipientName})</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-[#2c382a]">
                <span className="text-[#c1c9bf]">Package</span>
                <span className="font-semibold text-[#9ed3aa]">{packageDescription || 'Courier Parcel'}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#c1c9bf]">Delivery Fare</span>
                <span className="text-sm font-bold text-[#9ed3aa] uppercase tracking-wider">Agreed with Courier (Direct)</span>
              </div>
            </div>

            {/* Network Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setMomoNetwork('MTN')}
                className={`cursor-pointer p-3 rounded-xl border flex items-center gap-3 ${
                  momoNetwork === 'MTN' ? 'bg-[#ffcc00]/15 border-[#ffcc00] text-white' : 'bg-[#182216] border-[#414942]/30 text-[#c1c9bf]'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#ffcc00] text-black font-bold flex items-center justify-center text-xs">MTN</div>
                <div className="text-xs font-bold">MTN MoMo</div>
              </div>
              <div
                onClick={() => setMomoNetwork('Airtel')}
                className={`cursor-pointer p-3 rounded-xl border flex items-center gap-3 ${
                  momoNetwork === 'Airtel' ? 'bg-[#e60000]/15 border-[#e60000] text-white' : 'bg-[#182216] border-[#414942]/30 text-[#c1c9bf]'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#e60000] text-white font-bold flex items-center justify-center text-xs">AIR</div>
                <div className="text-xs font-bold">Airtel Money</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#c1c9bf] mb-1">
                Payment MoMo Number
              </label>
              <input
                type="tel"
                value={momoNumber || senderPhone}
                onChange={(e) => setMomoNumber(e.target.value)}
                className="w-full bg-[#182216] border border-[#414942]/50 rounded-xl px-3.5 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#9ed3aa]"
                placeholder="0796569416"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#2c382a]">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-1/3 bg-[#1f2a1d] hover:bg-[#2c382a] text-[#c1c9bf] py-3.5 rounded-xl font-medium text-sm transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDeliveryDispatch}
                className="w-2/3 bg-[#336443] hover:bg-[#3d7751] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Assigning Courier...
                  </span>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-[#9ed3aa]" />
                    <span>Dispatch Courier</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
