import { RiderProfile } from '../types';

const STORAGE_KEY_RIDERS = 'jd_kigali_riders_directory_v1';
const STORAGE_KEY_SELECTED_RIDER = 'jd_selected_rider_for_pickup';

export const INITIAL_KIGALI_RIDERS: RiderProfile[] = [
  {
    id: 'pilot-jean-claude',
    name: 'Jean Claude Mugabo',
    phone: '0788 123 456',
    momoNumber: '0788123456',
    nationalId: '1 1992 8 0048291 0 45',
    bikePlate: 'RAD 829 K',
    bikeModel: 'Alpha MK1 Concierge Electric (9 kW)',
    sector: 'Kimihurura (KCC & Heights)',
    district: 'Gasabo',
    rating: 4.98,
    tripsCount: 1420,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'available',
    verified: true,
    sanitizedDualHelmets: true,
    lat: -1.9536,
    lng: 30.0934,
  },
  {
    id: 'pilot-emmanuel',
    name: 'Emmanuel Nkurunziza',
    phone: '0783 456 789',
    momoNumber: '0783456789',
    nationalId: '1 1989 8 0092813 0 12',
    bikePlate: 'RAC 412 B',
    bikeModel: 'TVS HLX 150 Plus',
    sector: 'Downtown CBD & CHIC Mall',
    district: 'Nyarugenge',
    rating: 4.95,
    tripsCount: 2890,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'available',
    verified: true,
    sanitizedDualHelmets: true,
    lat: -1.9441,
    lng: 30.0619,
  },
  {
    id: 'pilot-fabrice',
    name: 'Fabrice Kayitare',
    phone: '0785 990 112',
    momoNumber: '0785990112',
    nationalId: '1 1994 8 0021389 0 78',
    bikePlate: 'RAB 319 M',
    bikeModel: 'Bajaj Boxer BM 150 HD',
    sector: 'Remera & BK Arena',
    district: 'Gasabo',
    rating: 4.92,
    tripsCount: 1980,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'available',
    verified: true,
    sanitizedDualHelmets: true,
    lat: -1.9538,
    lng: 30.1127,
  },
  {
    id: 'pilot-patrick',
    name: 'Patrick Uwimana',
    phone: '0789 221 445',
    momoNumber: '0789221445',
    nationalId: '1 1991 8 0054712 0 66',
    bikePlate: 'RAC 902 L',
    bikeModel: 'Yamaha Crux 110 Eco',
    sector: 'Kacyiru Ministries & Embassies',
    district: 'Gasabo',
    rating: 4.96,
    tripsCount: 1640,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'available',
    verified: true,
    sanitizedDualHelmets: true,
    lat: -1.9358,
    lng: 30.0827,
  },
  {
    id: 'pilot-claude',
    name: 'Claude Manzi',
    phone: '0782 771 903',
    momoNumber: '0782771903',
    nationalId: '1 1995 8 0078129 0 91',
    bikePlate: 'RAD 115 P',
    bikeModel: 'Ampersand Rwanda e-Moto 2024',
    sector: 'Nyamirambo Biryogo Car-Free',
    district: 'Nyarugenge',
    rating: 4.97,
    tripsCount: 2310,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    status: 'available',
    verified: true,
    sanitizedDualHelmets: true,
    lat: -1.9772,
    lng: 30.0483,
  },
];

export function getStoredRiders(): RiderProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RIDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RIDERS, JSON.stringify(INITIAL_KIGALI_RIDERS));
      return INITIAL_KIGALI_RIDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to read riders from storage', e);
  }
  return INITIAL_KIGALI_RIDERS;
}

export function saveStoredRiders(riders: RiderProfile[]) {
  try {
    localStorage.setItem(STORAGE_KEY_RIDERS, JSON.stringify(riders));
    window.dispatchEvent(new CustomEvent('jd_riders_updated', { detail: riders }));
  } catch (e) {
    console.error('Failed to save riders to storage', e);
  }
}

export function updateRiderProfile(rider: Partial<RiderProfile> & { id: string }): RiderProfile {
  const current = getStoredRiders();
  const index = current.findIndex((r) => r.id === rider.id);
  let updatedRider: RiderProfile;
  if (index >= 0) {
    updatedRider = { ...current[index], ...rider };
    current[index] = updatedRider;
  } else {
    updatedRider = {
      id: rider.id,
      name: rider.name || 'Verified Kigali Pilot',
      phone: rider.phone || '0788 123 456',
      momoNumber: rider.momoNumber || rider.phone || '0788123456',
      bikePlate: rider.bikePlate || 'RAD 829 K',
      bikeModel: rider.bikeModel || 'Alpha MK1 Concierge Electric',
      sector: rider.sector || 'Kimihurura',
      district: rider.district || 'Gasabo',
      rating: rider.rating || 4.95,
      tripsCount: rider.tripsCount || 100,
      avatarUrl: rider.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: rider.status || 'available',
      verified: true,
      sanitizedDualHelmets: true,
      ...rider,
    };
    current.push(updatedRider);
  }
  saveStoredRiders(current);
  return updatedRider;
}

export function getSelectedRider(): RiderProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SELECTED_RIDER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to get selected rider', e);
  }
  return getStoredRiders()[0];
}

export function setSelectedRider(rider: RiderProfile) {
  try {
    localStorage.setItem(STORAGE_KEY_SELECTED_RIDER, JSON.stringify(rider));
    window.dispatchEvent(new CustomEvent('jd_selected_rider_changed', { detail: rider }));
  } catch (e) {
    console.error('Failed to save selected rider', e);
  }
}
