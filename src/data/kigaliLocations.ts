import { KigaliLocation, RideOption, DeliveryOption, RideTier, DeliveryCategory } from '../types';

export const KIGALI_LOCATIONS: KigaliLocation[] = [
  { id: 'kcc', name: 'Kigali Convention Centre', sector: 'Kimihurura', zone: 'Gasabo', landmark: 'KG 2 Roundabout', popular: true },
  { id: 'kh', name: 'Kigali Heights', sector: 'Kimihurura', zone: 'Gasabo', landmark: 'Opposite KCC', popular: true },
  { id: 'bk_arena', name: 'BK Arena (Remera)', sector: 'Remera', zone: 'Gasabo', landmark: 'Near Amahoro Stadium', popular: true },
  { id: 'airport', name: 'Kigali International Airport (KGL)', sector: 'Kanombe', zone: 'Kicukiro', landmark: 'Main Terminal', popular: true },
  { id: 'cbd', name: 'Kigali Downtown / CHIC Building', sector: 'Nyarugenge', zone: 'Nyarugenge', landmark: 'City Centre Taxi Park', popular: true },
  { id: 'nyarutarama', name: 'Nyarutarama (Golf Club)', sector: 'Remera', zone: 'Gasabo', landmark: 'MTN Center Area', popular: true },
  { id: 'kacyiru', name: 'Kacyiru (Ministries & Embassies)', sector: 'Kacyiru', zone: 'Gasabo', landmark: 'US Embassy / MINALOC', popular: true },
  { id: 'kiyovu', name: 'Kiyovu Luxury Quarter', sector: 'Nyarugenge', zone: 'Nyarugenge', landmark: 'Near Serena Hotel', popular: true },
  { id: 'gishushu', name: 'Gishushu (RDB Headquarters)', sector: 'Kimihurura', zone: 'Gasabo', landmark: 'Rwanda Development Board', popular: true },
  { id: 'nyamirambo', name: 'Nyamirambo (Green Quarter)', sector: 'Nyamirambo', zone: 'Nyarugenge', landmark: 'Regional Stadium', popular: true },
  { id: 'kicukiro_centre', name: 'Kicukiro Centre (Sonatubes)', sector: 'Kicukiro', zone: 'Kicukiro', landmark: 'Near IPRC Kigali', popular: false },
  { id: 'gikondo', name: 'Gikondo (Expo Grounds)', sector: 'Gikondo', zone: 'Kicukiro', landmark: 'Magerwa Trade Area', popular: false },
  { id: 'remera_corner', name: 'Giporoso / Remera Corner', sector: 'Remera', zone: 'Gasabo', landmark: 'Strive Roundabout', popular: false },
  { id: 'kagugu', name: 'Kagugu / SOS Children Village', sector: 'Kinyinya', zone: 'Gasabo', landmark: 'Kagugu Center', popular: false },
  { id: 'kabuga', name: 'Kabuga Junction', sector: 'Rusororo', zone: 'Gasabo', landmark: 'East Highway Gate', popular: false }
];

export const RIDE_OPTIONS: RideOption[] = [
  {
    id: 'standard',
    title: 'Smooth Standard',
    tagline: 'Reliable everyday moto commute with sanitized helmet',
    baseFare: 500,
    perKm: 300,
    estimatedMinutes: 3,
    features: ['Vetted Moto Driver', 'Sanitized Helmet + Hairnet', 'MTN / Airtel MoMo direct pay', 'Live GPS Tracking'],
    recommended: true
  },
  {
    id: 'express',
    title: 'Smooth Express',
    tagline: 'Top-rated priority riders with zero pickup wait',
    baseFare: 800,
    perKm: 380,
    estimatedMinutes: 1,
    features: ['Top 5% Rated Rider (4.9+ ★)', 'Premium Comfort Helmet', 'Priority Lane Dispatch', 'No-surge guarantee']
  },
  {
    id: 'vip_tour',
    title: 'Kigali City Tour & Hourly',
    tagline: 'Dedicated rider for multiple stops or scenic city sights',
    baseFare: 2500,
    perKm: 450,
    estimatedMinutes: 5,
    features: ['Unlimited custom stops', 'Multilingual English/French/Kinyarwanda guide', 'Luggage bungee straps included', 'Scenic hill viewpoints']
  }
];

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'document',
    name: 'Urgent Documents / Passports',
    maxWeight: 'Up to 2 kg',
    description: 'Waterproof secured pouch for contracts, visas, keys & credentials.',
    baseFare: 1200
  },
  {
    id: 'small_parcel',
    name: 'Small Parcel / E-commerce',
    maxWeight: 'Up to 10 kg',
    description: 'Quick store pickups, boutique orders, clothing & electronics.',
    baseFare: 1600
  },
  {
    id: 'fragile_goods',
    name: 'Fragile / Bakery & Gifts',
    maxWeight: 'Up to 6 kg',
    description: 'Handled with upright stabilization and shock absorption.',
    baseFare: 2200
  },
  {
    id: 'food_grocery',
    name: 'Food & Fresh Groceries',
    maxWeight: 'Up to 15 kg',
    description: 'Insulated thermal container keeping hot meals warm and produce fresh.',
    baseFare: 1800
  }
];

export const MOCK_DRIVERS = [
  {
    name: 'Jean-Damascene Mugisha',
    phone: '+250 788 349 102',
    rating: 4.95,
    trips: 1840,
    bikeModel: 'TVS HLX 150 Plus',
    plateNumber: 'RAC 412B',
    currentEtaMins: 3,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Eric Nshimiyimana',
    phone: '+250 783 610 985',
    rating: 4.92,
    trips: 2130,
    bikeModel: 'Bajaj Boxer 150X',
    plateNumber: 'RAD 779K',
    currentEtaMins: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Didier Habimana',
    phone: '+250 782 119 403',
    rating: 4.98,
    trips: 3420,
    bikeModel: 'Yamaha Crux 110',
    plateNumber: 'RAC 905X',
    currentEtaMins: 4,
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
  }
];

export function calculateDistanceKm(pickupId: string, dropoffId: string): number {
  if (pickupId === dropoffId) return 2.0;
  // Deterministic calculation based on string hash for smooth realism
  const code = (pickupId.charCodeAt(0) * 7 + dropoffId.charCodeAt(dropoffId.length - 1) * 13) % 18;
  return Math.max(3.2, Number((code + 2.5).toFixed(1)));
}

export function calculateRideFare(distanceKm: number, tier: RideTier): number {
  const opt = RIDE_OPTIONS.find(o => o.id === tier) || RIDE_OPTIONS[0];
  const raw = opt.baseFare + Math.round(distanceKm * opt.perKm);
  // Round to nearest 100 RWF for realistic Kigali cash/MoMo ergonomics
  return Math.ceil(raw / 100) * 100;
}

export function calculateDeliveryFare(distanceKm: number, category: DeliveryCategory): number {
  const opt = DELIVERY_OPTIONS.find(o => o.id === category) || DELIVERY_OPTIONS[0];
  const raw = opt.baseFare + Math.round(distanceKm * 280);
  return Math.ceil(raw / 100) * 100;
}
