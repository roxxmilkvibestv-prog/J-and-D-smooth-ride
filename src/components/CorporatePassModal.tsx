import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  Download, 
  FileText, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  Sparkles,
  Receipt
} from 'lucide-react';
import { CorporatePassPlan } from '../types';

interface CorporatePassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS: CorporatePassPlan[] = [
  {
    id: 'tech_corridor',
    title: 'Kimihurura Tech & Embassy Pass',
    targetUser: 'Tech startups, consultants & diplomats',
    monthlyTrips: 60,
    discountRate: '25% Off Standard',
    priceRwf: 45000,
    isPopular: true,
    perks: [
      '60 Priority moto trips per month',
      'Always priority lane dispatch (<2 min ETA)',
      'Dedicated premium helmet assigned',
      'Itemized monthly RRA VAT invoice for tax write-off',
    ],
  },
  {
    id: 'ngo_fleet',
    title: 'NGO & Field Team Voucher',
    targetUser: 'NGOs, UN agencies & field survey teams',
    monthlyTrips: 150,
    discountRate: '35% Off Standard',
    priceRwf: 98000,
    perks: [
      'Multi-user shared team billing pool',
      'All 3 districts covered (Gasabo, Nyarugenge, Kicukiro)',
      'Direct MoMo bulk disbursement',
      'Monthly carbon-offset and safety compliance report',
    ],
  },
  {
    id: 'daily_commute',
    title: 'Daily Commuter Freedom Pass',
    targetUser: 'Everyday professionals commuting across Kigali',
    monthlyTrips: 40,
    discountRate: '20% Off Standard',
    priceRwf: 32000,
    perks: [
      '40 Daily rush-hour rides',
      'Rain poncho included on every ride',
      'No surge guarantee rain or shine',
      'Roll-over unused trips up to 14 days',
    ],
  },
];

export const CorporatePassModal: React.FC<CorporatePassModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<CorporatePassPlan>(PLANS[0]);
  const [companyName, setCompanyName] = useState('Norrsken House Kigali Startup');
  const [tinNumber, setTinNumber] = useState('109482910');
  const [purchased, setPurchased] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="corporate-pass-card"
        className="relative w-full max-w-3xl bg-[#141e12] border border-[#85AB8B]/30 rounded-3xl p-6 sm:p-8 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#b9efc5]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2c382a] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#202e1e] border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa] shadow-inner">
              <Building2 className="w-6 h-6 text-[#9ed3aa]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-podium uppercase">
                  Smooth Corporate & Commuter Pass
                </h2>
                <span className="text-[10px] bg-[#9ed3aa] text-[#02391c] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  RRA EBM Vouchers
                </span>
              </div>
              <p className="text-xs text-[#c1c9bf]">
                Save up to 35% with monthly consolidated moto billing, dedicated sanitization gear, and official RRA e-tax invoices.
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

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => {
                  setSelectedPlan(plan);
                  setPurchased(false);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                  isSelected
                    ? 'bg-[#182619] border-[#9ed3aa] shadow-xl scale-[1.02]'
                    : 'bg-[#0d160c] border-[#2c382a] hover:border-[#9ed3aa]/40'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-2.5 right-3 bg-[#9ed3aa] text-[#02391c] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow">
                    Most Popular
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-white mb-0.5">{plan.title}</div>
                  <div className="text-base font-bold text-[#9ed3aa] font-podium mb-2">
                    Direct Pilot Rates
                    <span className="text-[10px] text-[#85AB8B] font-normal"> / Volume Billing</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-[#c1c9bf] mb-3">
                    {plan.perks.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#9ed3aa] shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`text-[10px] font-bold text-center py-1.5 rounded-xl border ${
                  isSelected ? 'bg-[#336443] text-white border-[#9ed3aa]' : 'bg-[#141e12] text-[#85AB8B] border-[#2c382a]'
                }`}>
                  {isSelected ? '✓ Selected Plan' : 'Select Plan'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Corporate Billing Form */}
        <div className="bg-[#0b160a] border border-[#2c382a] rounded-2xl p-4 mb-5 space-y-3">
          <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-[#9ed3aa]" />
            <span>Corporate Account & RRA EBM Tax Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#85AB8B] uppercase mb-1 block">
                Company / Organization Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#141e12] border border-[#2c382a] rounded-xl p-2.5 text-xs text-white focus:border-[#9ed3aa] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#85AB8B] uppercase mb-1 block">
                Rwanda TIN Number (For 18% VAT EBM Receipt)
              </label>
              <input
                type="text"
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
                className="w-full bg-[#141e12] border border-[#2c382a] rounded-xl p-2.5 text-xs text-white focus:border-[#9ed3aa] focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Action Button / EBM Receipt Preview */}
        {purchased ? (
          <div className="p-4 bg-[#182619] border-2 border-[#9ed3aa] rounded-2xl text-center space-y-2 animate-fade-up">
            <div className="text-xs font-bold text-[#9ed3aa] flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Corporate Pass Activated for {companyName}!</span>
            </div>
            <div className="text-xs text-[#c1c9bf]">
              Official RRA EBM Tax Invoice #RRA-EBM-2026-9812 has been sent to your finance team.
            </div>
          </div>
        ) : (
          <button
            onClick={() => setPurchased(true)}
            className="w-full bg-[#9ed3aa] hover:bg-[#b9efc5] text-[#02391c] font-bold py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer transform active:scale-95"
          >
            <span>Activate {selectedPlan.title} (Direct Pilot Billing)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
