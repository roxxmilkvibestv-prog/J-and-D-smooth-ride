import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  RefreshCw, 
  Send, 
  CreditCard, 
  ShieldCheck,
  Receipt,
  Sparkles,
  Edit2
} from 'lucide-react';
import { getSelectedRider } from '../utils/riderDirectory';

interface MomoUssdModalProps {
  isOpen: boolean;
  onClose: () => void;
  fareRwf?: number;
  riderName?: string;
  plateNumber?: string;
  riderMomoNumber?: string;
}

export const MomoUssdModal: React.FC<MomoUssdModalProps> = ({
  isOpen,
  onClose,
  fareRwf = 1500,
  riderName,
  plateNumber,
  riderMomoNumber,
}) => {
  const selectedRider = getSelectedRider();
  const activeRiderName = riderName || selectedRider?.name || 'Jean Claude Mugabo';
  const activePlate = plateNumber || selectedRider?.bikePlate || 'RAD 829 K';
  const initialMomo = riderMomoNumber || selectedRider?.momoNumber || selectedRider?.phone?.replace(/\s+/g, '') || '0788123456';

  const [network, setNetwork] = useState<'MTN' | 'Airtel'>('MTN');
  const [phoneNumber, setPhoneNumber] = useState('0788 349 102');
  const [pilotMomo, setPilotMomo] = useState(initialMomo);
  const [isEditingMomo, setIsEditingMomo] = useState(false);
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'prompt' | 'pin_entry' | 'processing' | 'receipt'>('prompt');
  const [txnId, setTxnId] = useState('');

  useEffect(() => {
    if (riderMomoNumber) {
      setPilotMomo(riderMomoNumber);
    } else if (selectedRider?.momoNumber) {
      setPilotMomo(selectedRider.momoNumber);
    }
  }, [riderMomoNumber, selectedRider]);

  if (!isOpen) return null;

  const ussdCode = `*182*1*1*${pilotMomo.replace(/\D/g, '')}#`;

  const handleInitiatePush = () => {
    setStep('pin_entry');
  };

  const handleConfirmPayment = () => {
    setStep('processing');
    setTimeout(() => {
      setTxnId(`MTN-RW-${Math.floor(100000000 + Math.random() * 900000000)}`);
      setStep('receipt');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="momo-ussd-card"
        className="relative w-full max-w-lg bg-[#141e12] border border-[#85AB8B]/30 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#b9efc5]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2c382a] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#202e1e] border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa] shadow-inner">
              <Smartphone className="w-6 h-6 text-[#9ed3aa]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-podium uppercase">
                  Rider Direct MoMo Payment
                </h2>
                <span className="text-[10px] bg-[#9ed3aa] text-[#02391c] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Direct to Rider
                </span>
              </div>
              <p className="text-xs text-[#c1c9bf]">
                Zero-fee direct settlement to {activeRiderName}&apos;s registered MoMo wallet
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

        {/* Step 1: Initial Phone & Network */}
        {step === 'prompt' && (
          <div className="space-y-4">
            {/* Merchant Info Banner */}
            <div className="bg-[#0b160a] p-4 rounded-2xl border border-[#2c382a] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#85AB8B] uppercase font-bold flex items-center gap-1.5">
                  <span>Rider MoMo Account:</span>
                  <button 
                    type="button" 
                    onClick={() => setIsEditingMomo(!isEditingMomo)}
                    className="text-[#9ed3aa] hover:underline flex items-center gap-0.5 text-[9px]"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                    <span>{isEditingMomo ? 'Save' : 'Change'}</span>
                  </button>
                </div>
                <div className="text-sm font-bold text-white">{activeRiderName} ({activePlate})</div>
                {isEditingMomo ? (
                  <input
                    type="text"
                    value={pilotMomo}
                    onChange={(e) => setPilotMomo(e.target.value)}
                    placeholder="e.g. 0788123456"
                    className="mt-1 bg-[#162716] border border-[#34A853] rounded-lg px-2 py-0.5 text-xs text-[#9ed3aa] font-mono focus:outline-none"
                  />
                ) : (
                  <div className="text-xs text-[#9ed3aa] font-mono font-bold">{ussdCode}</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#85AB8B] uppercase font-bold">Agreed Fare (Direct)</div>
                <div className="text-lg font-bold text-[#9ed3aa] font-podium">
                  Rider-Decided Fare
                </div>
              </div>
            </div>

            {/* Network Selector */}
            <div>
              <label className="text-xs font-bold text-[#85AB8B] uppercase mb-1.5 block">
                Select Mobile Money Network
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNetwork('MTN')}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    network === 'MTN'
                      ? 'bg-amber-400 text-black border-amber-300 shadow-lg'
                      : 'bg-[#0d160c] text-white border-[#2c382a] hover:border-amber-400/50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-black/30"></span>
                  MTN Mobile Money
                </button>
                <button
                  type="button"
                  onClick={() => setNetwork('Airtel')}
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    network === 'Airtel'
                      ? 'bg-red-600 text-white border-red-400 shadow-lg'
                      : 'bg-[#0d160c] text-white border-[#2c382a] hover:border-red-500/50'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white/30"></span>
                  Airtel Money
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#85AB8B] uppercase mb-1.5 block">
                Your Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="078X XXX XXX"
                className="w-full bg-[#0d160c] border border-[#2c382a] rounded-xl p-3 text-sm text-white font-mono focus:border-[#9ed3aa] focus:outline-none"
              />
            </div>

            <button
              onClick={handleInitiatePush}
              className="w-full bg-[#9ed3aa] hover:bg-[#b9efc5] text-[#02391c] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Send {ussdCode} USSD Prompt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Simulated USSD Push on Screen */}
        {step === 'pin_entry' && (
          <div className="space-y-4 animate-fade-up">
            <div className="bg-[#0b160a] border-2 border-[#9ed3aa] rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#9ed3aa] uppercase">
                <Lock className="w-4 h-4" />
                <span>Simulated {network} USSD Push Dialog</span>
              </div>
              <div className="p-3 bg-[#182216] rounded-xl border border-[#2c382a] text-xs font-mono text-white">
                Do you want to authorize payment directly to pilot <strong>{activeRiderName}</strong> (MoMo: {pilotMomo}) for the trip fare? Enter your MoMo PIN:
              </div>

              <div>
                <input
                  type="password"
                  maxLength={5}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="• • • • •"
                  className="w-full text-center tracking-widest text-2xl font-bold bg-[#0d160c] border border-[#2c382a] rounded-xl p-3 text-[#9ed3aa] focus:border-[#9ed3aa] focus:outline-none font-mono"
                />
              </div>

              <button
                onClick={handleConfirmPayment}
                className="w-full bg-[#9ed3aa] hover:bg-[#b9efc5] text-[#02391c] font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Authorize Rider-Agreed Payment</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === 'processing' && (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-[#9ed3aa] animate-spin mx-auto" />
            <div className="text-sm font-bold text-white">Connecting with Bank of Kigali & {network}...</div>
            <div className="text-xs text-[#85AB8B]">Verifying zero-fee instant driver settlement...</div>
          </div>
        )}

        {/* Step 4: Digital SMS Receipt */}
        {step === 'receipt' && (
          <div className="space-y-4 animate-fade-up">
            <div className="bg-[#0b160a] border-2 border-[#9ed3aa] rounded-2xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#2c382a] pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-[#9ed3aa]" />
                  <div>
                    <div className="text-xs font-bold text-white uppercase">Payment Successful</div>
                    <div className="text-[10px] text-[#9ed3aa] font-mono">{txnId}</div>
                  </div>
                </div>
                <div className="text-right font-podium text-lg text-[#9ed3aa] font-bold">
                  {fareRwf.toLocaleString()} RWF
                </div>
              </div>

              {/* SMS preview mockup */}
              <div className="p-3 bg-[#182216] rounded-xl border border-[#2c382a] text-xs font-mono text-[#c1c9bf] space-y-1">
                <div className="text-[#9ed3aa] font-bold">📩 SMS from {network} MoMo:</div>
                <p>
                  "Yishyuwe! Amafaranga {fareRwf.toLocaleString()} RWF yohererejwe J&D Smooth Ride ({riderName}, {plateNumber}). TxId: {txnId}. Umubare w'amafaranga asigaye: 84,200 RWF."
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-[#85AB8B] pt-2">
                <span>RURA Approved Fare</span>
                <span>Driver Instant Cashout: 100%</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-[#336443] hover:bg-[#3d7751] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Done & Return to Ride
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
