import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  Printer, 
  Download, 
  Share2, 
  CheckCircle2, 
  QrCode, 
  Building2, 
  Phone, 
  Bike,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { EbmTaxInvoice, BookingState } from '../types';

interface EbmReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingState | null;
}

export const EbmReceiptModal: React.FC<EbmReceiptModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [clientTin, setClientTin] = useState('');
  const [copied, setCopied] = useState(false);

  const defaultFare = booking ? booking.fareRwf : 1800;
  const vatRate = 0.18;
  const baseAmount = Math.round(defaultFare / (1 + vatRate));
  const vatAmount = defaultFare - baseAmount;

  const invoice: EbmTaxInvoice = {
    invoiceNumber: `EBM-RW-${Math.floor(100000 + Math.random() * 900000)}`,
    ebmSignature: `RRA-CIS-2026-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    tinNumber: '109847291',
    clientName: booking?.passengerName || 'Valued Kigali Customer',
    clientTin: clientTin || undefined,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    tripId: booking?.id || `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
    driverName: booking?.driver?.name || 'Jean-Damascene Mugisha',
    bikePlate: booking?.driver?.plateNumber || 'RAC 412B',
    pickup: booking?.pickup || 'Kigali Heights, Kimihurura',
    dropoff: booking?.dropoff || 'Kimironko Market',
    distanceKm: booking?.distanceKm || 6.4,
    baseAmountRwf: baseAmount,
    vatAmountRwf: vatAmount,
    totalAmountRwf: defaultFare,
    momoRef: `MTN-MOMO-${Math.floor(10000000 + Math.random() * 90000000)}`,
    qrPayload: `https://ebm.rra.gov.rw/verify?tin=109847291&inv=EBM-RW-849102`,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReceipt = () => {
    const text = `🧾 J & D SMOOTH RIDE - RRA EBM RECEIPT\nInvoice: ${invoice.invoiceNumber}\nDate: ${invoice.date}\nTIN: 109847291\nPassenger: ${invoice.clientName}\nRider: ${invoice.driverName} (${invoice.bikePlate})\nRoute: ${invoice.pickup} -> ${invoice.dropoff}\nTotal Paid: ${invoice.totalAmountRwf.toLocaleString()} RWF\nMoMo Ref: ${invoice.momoRef}\nEBM Signature: ${invoice.ebmSignature}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        id="ebm-receipt-card"
        className="relative w-full max-w-xl bg-[#141e12] border border-[#85AB8B]/30 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto text-[#d9e6d2] overflow-hidden"
      >
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#b9efc5]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2c382a] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#202e1e] border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa] shadow-inner">
              <Receipt className="w-6 h-6 text-[#9ed3aa]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-podium uppercase">
                  RRA EBM Tax Invoice
                </h2>
                <span className="text-[10px] bg-[#9ed3aa] text-[#02391c] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  Official EBM v2.0
                </span>
              </div>
              <p className="text-xs text-[#c1c9bf]">
                Rwanda Revenue Authority compliant invoice for personal and corporate expense claims.
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

        {/* Optional Corporate TIN Input */}
        <div className="p-3 bg-[#0d160c] border border-[#2c382a] rounded-xl mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#85AB8B] shrink-0" />
          <input
            type="text"
            value={clientTin}
            onChange={(e) => setClientTin(e.target.value)}
            placeholder="Add Company TIN (e.g. 102938475) for corporate claim"
            className="bg-transparent text-xs text-white placeholder-[#616c5e] focus:outline-none w-full"
          />
        </div>

        {/* Printable Official EBM Paper Style Receipt */}
        <div className="bg-[#f7faf5] text-[#1a2318] p-5 rounded-2xl shadow-xl font-mono text-xs space-y-3 border border-[#c1c9bf]">
          {/* Header */}
          <div className="text-center pb-2 border-b border-dashed border-[#85AB8B]/60 space-y-0.5">
            <div className="font-bold text-sm text-[#02391c] tracking-wider uppercase font-sans">
              J & D SMOOTH RIDE LTD
            </div>
            <div className="text-[10px] text-[#414942]">KIGALI - RWANDA • TIN: 109847291</div>
            <div className="text-[10px] text-[#414942]">RURA LICENSE: RURA/TR/2026/0491</div>
            <div className="text-[10px] font-bold text-[#02391c] uppercase pt-1">
              --- ELECTRONIC BILLING MACHINE (EBM v2.0) ---
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-1 text-[11px]">
            <div>
              <span className="text-[#616c5e]">Invoice #:</span> <strong>{invoice.invoiceNumber}</strong>
            </div>
            <div className="text-right">
              <span className="text-[#616c5e]">Date:</span> {invoice.date}
            </div>
            <div>
              <span className="text-[#616c5e]">Customer:</span> {invoice.clientName}
            </div>
            {clientTin && (
              <div className="text-right">
                <span className="text-[#616c5e]">Client TIN:</span> {clientTin}
              </div>
            )}
            <div>
              <span className="text-[#616c5e]">Rider:</span> {invoice.driverName}
            </div>
            <div className="text-right">
              <span className="text-[#616c5e]">Plate:</span> {invoice.bikePlate}
            </div>
          </div>

          {/* Route Section */}
          <div className="py-2 border-y border-dashed border-[#85AB8B]/60 space-y-1 text-[11px]">
            <div>
              <span className="text-[#616c5e]">From:</span> {invoice.pickup}
            </div>
            <div>
              <span className="text-[#616c5e]">To:</span> {invoice.dropoff}
            </div>
            <div>
              <span className="text-[#616c5e]">Distance:</span> ~{invoice.distanceKm} km
            </div>
          </div>

          {/* Tariff Breakdown */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Standard Transport Tariff (Excl. VAT):</span>
              <span>{invoice.baseAmountRwf.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between">
              <span>RRA VAT (18% Inclusive):</span>
              <span>{invoice.vatAmountRwf.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#02391c] pt-1 border-t border-[#85AB8B]/60">
              <span>TOTAL PAID (MoMo):</span>
              <span>{invoice.totalAmountRwf.toLocaleString()} RWF</span>
            </div>
            <div className="text-[10px] text-[#616c5e] pt-0.5">
              Payment Ref: {invoice.momoRef}
            </div>
          </div>

          {/* EBM Security Code & QR */}
          <div className="pt-2 border-t border-dashed border-[#85AB8B]/60 flex items-center justify-between">
            <div className="text-[9px] text-[#414942] space-y-0.5">
              <div>EBM SIGNATURE: {invoice.ebmSignature}</div>
              <div>VERIFY: rra.gov.rw/verify-invoice</div>
              <div className="font-bold text-[#02391c]">MURAKOZE CYANE • THANK YOU</div>
            </div>
            <div className="w-12 h-12 bg-white p-1 border border-[#414942] rounded flex items-center justify-center">
              <QrCode className="w-10 h-10 text-black" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          <button
            onClick={handleCopyReceipt}
            className="bg-[#1f2a1d] hover:bg-[#2c382a] text-[#b9efc5] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-[#2c382a] cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#9ed3aa]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Receipt' : 'Copy Digital Receipt'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-[#9ed3aa] hover:bg-[#b9efc5] text-[#02391c] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
