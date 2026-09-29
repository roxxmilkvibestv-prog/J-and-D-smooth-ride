import React, { useState } from 'react';
import { Phone, MessageSquare, ShieldCheck, Award, Cpu, CheckCircle2, Copy, Check, Users, Sparkles, Building2, ChevronRight } from 'lucide-react';

interface ExecutiveProfile {
  id: string;
  name: string;
  salutation: string;
  title: string;
  roleBadge: string;
  phone: string;
  rawPhone: string;
  whatsappNumber: string;
  image: string;
  bio: string;
  responsibilities: string[];
}

const EXECUTIVES: ExecutiveProfile[] = [
  {
    id: 'ceo',
    name: 'MR. Wiapla',
    salutation: 'Executive Leadership',
    title: 'Chief Executive Officer (CEO)',
    roleBadge: 'Executive Vision & Strategy',
    phone: '0736 535 364',
    rawPhone: '0736535364',
    whatsappNumber: '250736535364',
    image: 'https://i.ibb.co/kVhTrgRp/IMG-20260921-WA0002.png',
    bio: 'Pioneering safe, disciplined, and technologically transparent two-wheel logistics across Kigali. Dedicated to elevating Rwandan moto transit with fixed fares, zero passenger surcharges, and comprehensive RURA compliance.',
    responsibilities: [
      'Strategic Corporate Direction & Growth',
      'RURA & City Regulatory Partnerships',
      'Passenger Safety Standard Enactments',
    ],
  },
  {
    id: 'manager',
    name: 'MRS. Howe',
    salutation: 'Fleet & Service Operations',
    title: 'General & Operations Manager',
    roleBadge: 'Daily Fleet & Quality Assurance',
    phone: '0739 914 727',
    rawPhone: '0739914727',
    whatsappNumber: '250739914727',
    image: 'https://i.ibb.co/hxkcBRth/IMG-20260918-001636-790.jpg',
    bio: 'Oversees daily dispatch operations, pilot vetting, hygiene equipment distribution, and customer satisfaction across all 3 Kigali districts (Gasabo, Nyarugenge, Kicukiro) 24 hours a day.',
    responsibilities: [
      'Pilot Fleet Vetting & Hygiene Equipment',
      '24/7 Operations & Rapid Client Support',
      'Punctuality & Instant Delivery Standards',
    ],
  },
  {
    id: 'it-systems',
    name: 'MR. Howe',
    salutation: 'Technology & Architecture',
    title: 'IT & Web Systems Manager',
    roleBadge: 'Digital Infrastructure & Dispatch',
    phone: '0796 569 416',
    rawPhone: '0796569416',
    whatsappNumber: '250796569416',
    image: 'https://i.ibb.co/tMsgrjL1/IMG-20260912-WA0007.jpg',
    bio: 'Architects J & D Smooth’s real-time web dispatch infrastructure, automated SMS trip notifications, GPS routing algorithms, and MTN MoMo payment gateway integrations.',
    responsibilities: [
      'Automated SMS Dispatch & Trip Routing',
      'Web Portal Architecture & Cyber-Security',
      'MoMo & Digital Payment Integrations',
    ],
  },
];

interface AboutUsSectionProps {
  onOpenBooking?: (type: 'ride' | 'delivery') => void;
  onOpenGuaranteeModal?: () => void;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({
  onOpenBooking,
  onOpenGuaranteeModal,
}) => {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopy = (phone: string, rawPhone: string) => {
    navigator.clipboard.writeText(rawPhone);
    setCopiedPhone(rawPhone);
    setTimeout(() => {
      setCopiedPhone(null);
    }, 2200);
  };

  return (
    <section 
      id="about-us" 
      className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 scroll-mt-24"
    >
      {/* Decorative subtle ambient lights */}
      <div 
        className="absolute top-1/4 left-10 w-96 h-96 rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(158, 211, 170, 0.4) 0%, transparent 70%)' }}
      />
      <div 
        className="absolute bottom-10 right-10 w-96 h-96 rounded-full pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(51, 100, 67, 0.5) 0%, transparent 70%)' }}
      />

      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#182216] border border-[#9ed3aa]/30 text-[#9ed3aa] text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <Building2 className="w-3.5 h-3.5" />
          <span>About J & D Smooth Ride & Pickup</span>
        </div>
        <h2 className="font-podium text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wider text-[#d9e6d2] leading-tight">
          Executive Leadership <span className="text-[#9ed3aa]">&amp; Company Vision</span>
        </h2>
        <p className="mt-4 text-sm sm:text-base text-[#c1c9bf] leading-relaxed max-w-2xl mx-auto">
          Built on Rwandan integrity, safety, and digital excellence. J & D Smooth Ride delivers Kigali’s most reliable, hygienic, and fixed-tariff moto transport and instant express pickup logistics.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-16">
        <div className="p-5 sm:p-6 rounded-2xl bg-[#141e12]/80 border border-white/10 backdrop-blur-md shadow-lg flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#202e1e] border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#d9e6d2]">100% Sanitized & Safe</h3>
          <p className="text-xs sm:text-sm text-[#c1c9bf] leading-relaxed">
            Every pilot carries dual RURA-certified helmets, single-use biodegradable hairnets, and undergoes continuous road safety verification.
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#141e12]/80 border border-white/10 backdrop-blur-md shadow-lg flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#202e1e] border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#d9e6d2]">Fixed Rwandan Tariffs</h3>
          <p className="text-xs sm:text-sm text-[#c1c9bf] leading-relaxed">
            No bargaining, no rain price-gouging, and no surprise hill surcharges. Clear digital MoMo rates verified upfront via official SMS receipts.
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-[#141e12]/80 border border-white/10 backdrop-blur-md shadow-lg flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#202e1e] border border-[#9ed3aa]/30 flex items-center justify-center text-[#9ed3aa]">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#d9e6d2]">Instant Digital Dispatch</h3>
          <p className="text-xs sm:text-sm text-[#c1c9bf] leading-relaxed">
            Proprietary algorithmic dispatch pairs you with licensed Class A pilots in your specific Kigali sector with under 3-minute average pickup time.
          </p>
        </div>
      </div>

      {/* Leadership Section Subheading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#85AB8B] font-bold">Executive Directorship</div>
          <h3 className="text-2xl sm:text-3xl font-bold text-[#d9e6d2] mt-1 font-podium tracking-wide">
            Meet Our Leadership Team
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-[#c1c9bf] max-w-md">
          Available around the clock to support passengers, corporate accounts, and fleet pilots with direct phone and WhatsApp lines.
        </p>
      </div>

      {/* 3 Executive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {EXECUTIVES.map((exec) => (
          <div
            key={exec.id}
            id={`exec-${exec.id}`}
            className="group relative flex flex-col rounded-3xl bg-[#141e12]/85 border border-white/10 hover:border-[#9ed3aa]/40 backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
          >
            {/* Top Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#9ed3aa] via-[#336443] to-[#b9efc5]" />

            {/* Profile Photo Header */}
            <div className="relative pt-6 px-6 flex flex-col items-center">
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-[#9ed3aa]/40 shadow-xl bg-black/40 group-hover:border-[#9ed3aa] transition-colors">
                <img
                  src={exec.image}
                  alt={`${exec.name} - ${exec.title}`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 bg-[#182216]/90 backdrop-blur-md rounded-full p-1 border border-[#9ed3aa]/40 shadow">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#9ed3aa]" />
                </div>
              </div>

              {/* Role badge */}
              <div className="mt-4 px-3 py-1 rounded-full bg-[#202e1e] border border-[#9ed3aa]/30 text-[#9ed3aa] text-[11px] font-semibold tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>{exec.roleBadge}</span>
              </div>

              {/* Name & Title */}
              <h4 className="mt-2.5 text-xl font-bold text-[#d9e6d2] text-center tracking-wide">
                {exec.name}
              </h4>
              <div className="text-xs sm:text-sm font-semibold text-[#85AB8B] text-center mt-0.5">
                {exec.title}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              {/* Bio & Responsibilities */}
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-[#c1c9bf] leading-relaxed text-center sm:text-left">
                  {exec.bio}
                </p>

                <div className="pt-2 border-t border-white/5">
                  <div className="text-[11px] uppercase tracking-wider text-[#85AB8B] font-bold mb-2">
                    Key Areas of Oversight
                  </div>
                  <ul className="space-y-1.5">
                    {exec.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-[#d9e6d2]">
                        <Check className="w-3.5 h-3.5 text-[#9ed3aa] shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contact Actions Box */}
              <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
                {/* Phone number display with copy action */}
                <div className="flex items-center justify-between bg-[#1b2719] px-3.5 py-2 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#9ed3aa]" />
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#d9e6d2]">
                      {exec.phone}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(exec.phone, exec.rawPhone)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#85AB8B] hover:text-[#9ed3aa] transition-colors p-1"
                    title="Copy direct phone number"
                  >
                    {copiedPhone === exec.rawPhone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#9ed3aa]" />
                        <span className="text-[#9ed3aa]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct Action Buttons: Call & WhatsApp */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${exec.rawPhone}`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#336443] hover:bg-[#3d7751] text-white text-xs font-bold transition-all shadow-md active:scale-95 text-center"
                    title={`Call ${exec.name}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Direct</span>
                  </a>

                  <a
                    href={`https://wa.me/${exec.whatsappNumber}?text=Hello%20${encodeURIComponent(exec.name)},%20I%20am%20contacting%20you%20regarding%20J%20%26%20D%20Smooth%20Ride%20services.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#202e1e] hover:bg-[#283b26] text-[#9ed3aa] hover:text-white border border-[#9ed3aa]/30 text-xs font-bold transition-all shadow-md active:scale-95 text-center"
                    title={`WhatsApp ${exec.name}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Callout Banner at bottom of About Us */}
      <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#182216] via-[#202e1e] to-[#182216] border border-[#9ed3aa]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#9ed3aa] uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Dedicated Kigali Support</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-bold text-[#d9e6d2]">
            Ready to experience a truly smooth, respectful ride?
          </h4>
          <p className="text-xs sm:text-sm text-[#c1c9bf] max-w-xl">
            Book an instant high-hygiene moto trip or schedule an enterprise logistics pickup with guaranteed fixed Kigali fares.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onOpenBooking && (
            <button
              type="button"
              onClick={() => onOpenBooking('ride')}
              className="px-5 py-3 rounded-full bg-[#336443] hover:bg-[#3d7751] text-white text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Book Instant Ride</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {onOpenGuaranteeModal && (
            <button
              type="button"
              onClick={onOpenGuaranteeModal}
              className="px-5 py-3 rounded-full bg-[#141e12] hover:bg-[#1b2719] text-[#d9e6d2] border border-white/20 hover:border-[#9ed3aa]/50 text-xs sm:text-sm font-semibold transition-all active:scale-95"
            >
              <span>Smooth Guarantee™</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
