export type ActiveTab = 
  | 'rides' 
  | 'deliveries' 
  | 'about'
  | 'pricing' 
  | 'driver' 
  | 'tracking' 
  | 'guarantee'
  | 'ai_dispatch'
  | 'parcel_scan'
  | 'terrain_fare'
  | 'kigali_map'
  | 'safety_scan'
  | 'corporate_pass'
  | 'momo_ussd'
  | 'rain_radar'
  | 'multi_stop'
  | 'rura_safety'
  | 'ebm_receipt';

export interface KigaliLocation {
  id: string;
  name: string;
  sector: string;
  zone: 'Gasabo' | 'Kicukiro' | 'Nyarugenge';
  landmark: string;
  popular?: boolean;
}

export type RideTier = 'standard' | 'express' | 'vip_tour';

export interface RideOption {
  id: RideTier;
  title: string;
  tagline: string;
  baseFare: number;
  perKm: number;
  estimatedMinutes: number;
  features: string[];
  recommended?: boolean;
}

export type DeliveryCategory = 'document' | 'small_parcel' | 'fragile_goods' | 'food_grocery';

export interface DeliveryOption {
  id: DeliveryCategory;
  name: string;
  maxWeight: string;
  description: string;
  baseFare: number;
}

export interface MultiStopWaypoint {
  id: string;
  address: string;
  sector: string;
  recipientName: string;
  recipientPhone: string;
  notes: string;
  stopType: 'pickup' | 'dropoff';
}

export interface EbmTaxInvoice {
  invoiceNumber: string;
  ebmSignature: string;
  tinNumber: string;
  clientName: string;
  clientTin?: string;
  date: string;
  tripId: string;
  driverName: string;
  bikePlate: string;
  pickup: string;
  dropoff: string;
  distanceKm: number;
  baseAmountRwf: number;
  vatAmountRwf: number;
  totalAmountRwf: number;
  momoRef: string;
  qrPayload: string;
}

export interface KigaliSectorWeather {
  sector: string;
  zone: 'Gasabo' | 'Kicukiro' | 'Nyarugenge';
  condition: 'clear' | 'light_rain' | 'heavy_rain' | 'mist';
  temperatureC: number;
  roadTractionPercent: number;
  rainPonchoRequired: boolean;
  elevationMeters: number;
  advice: string;
}

export interface BookingState {
  id: string;
  type: 'ride' | 'delivery';
  pickup: string;
  dropoff: string;
  passengerName: string;
  phone: string;
  momoNumber: string;
  momoNetwork: 'MTN' | 'Airtel';
  tier?: RideTier;
  deliveryCategory?: DeliveryCategory;
  packageDetails?: string;
  recipientName?: string;
  recipientPhone?: string;
  helmetPreference?: 'standard' | 'large' | 'bring_own';
  distanceKm: number;
  fareRwf: number;
  status: 'pending' | 'accepted' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  driver?: {
    name: string;
    phone: string;
    rating: number;
    trips: number;
    bikeModel: string;
    plateNumber: string;
    currentEtaMins: number;
    avatarUrl: string;
  };
  otpCode?: string;
  smsNotified?: boolean;
}

export interface DriverApplication {
  fullName: string;
  phone: string;
  momoNumber: string;
  nationalId: string;
  drivingLicenseClassA: string;
  bikePlate: string;
  bikeModel: string;
  experienceYears: number;
  preferredZone: string;
}

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  momoNumber: string;
  nationalId?: string;
  bikePlate: string;
  bikeModel: string;
  sector: string;
  district: string;
  rating: number;
  tripsCount: number;
  avatarUrl: string;
  status: 'available' | 'busy' | 'offline';
  verified: boolean;
  sanitizedDualHelmets: boolean;
  lat?: number;
  lng?: number;
}

export interface DirectChatMessage {
  id: string;
  sender: 'client' | 'rider';
  senderName: string;
  senderPhone?: string;
  riderId: string;
  riderName: string;
  clientId: string;
  clientName: string;
  text: string;
  timestamp: number;
}

// ------------------------------------
// AI & INNOVATION FEATURE TYPES
// ------------------------------------

export interface AiDispatchResult {
  tripType: 'ride' | 'delivery';
  pickup: string;
  dropoff: string;
  pickupSector?: string;
  dropoffSector?: string;
  recommendedTier: string;
  parcelNotes?: string;
  kinyarwandaExplanation: string;
  englishExplanation: string;
  frenchExplanation: string;
  distanceKm: number;
  estimatedFareRwf: number;
  confidenceScore?: number;
}

export interface AiParcelScanResult {
  fitStatus: 'fits_comfortably' | 'fits_with_secure_tie' | 'oversized_needs_car';
  detectedItem: string;
  estimatedDimensions: string;
  estimatedWeightKg: number;
  fragilityLevel: 'low' | 'medium' | 'high_fragile';
  recommendedTier: DeliveryCategory;
  safetyAdvice: string;
  safetyScore: number;
  strappingPoints: string[];
  waybillSummary: string;
}

export interface AiTerrainFareResult {
  elevationGainMeters: number;
  hillGradientProfile: string;
  terrainDifficulty: 'flat_valley' | 'moderate' | 'steep_ridge' | 'extreme_hillside';
  weatherAdjustmentPercent: number;
  weatherConditionName: string;
  baseTariffRwf: number;
  terrainSafetyAllowanceRwf: number;
  weatherAllowanceRwf: number;
  totalFairFareRwf: number;
  ecoFuelBurnScore: number;
  riderSafetyTips: string;
}

export interface AiSafetyVerificationResult {
  sanitationStatus: 'PASS' | 'NEEDS_CLEANING' | 'FAIL';
  helmetCondition: string;
  hairnetPackDetected: boolean;
  uvSanitizerDetected: boolean;
  safetyScore: number;
  badgeLevel: string;
  verificationId: string;
  timestamp: string;
  inspectorNotes: string;
}

export interface CorporatePassPlan {
  id: string;
  title: string;
  targetUser: string;
  monthlyTrips: number;
  discountRate: string;
  priceRwf: number;
  perks: string[];
  isPopular?: boolean;
}

export interface ClientAccount {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  accountType: 'personal' | 'corporate' | 'merchant' | 'neural_vip' | 'vip_concierge';
  preferredSector: string;
  momoNumber?: string;
  createdAt: string;
  neuralSyncScore?: number;
  totalTrips?: number;
  activePass?: string;
}

export interface SmsAlertSettings {
  adminAlerts: boolean; // Instant SMS alerts to admin phone on new booking or client inquiry
  driverUpdateAlerts: boolean; // SMS notifications for driver assignment and trip updates
  clientDeliverySms: boolean; // Outbound confirmation and delivery SMS to passenger or parcel recipient
}


