// Tipos compartidos adaptados de @evlogger/shared-types

export type VehicleType = 'EV' | 'DIESEL' | 'GASOLINA' | 'GLP';

export interface VehicleDto {
  id: string;
  name: string;
  type: VehicleType;
  consumption: number;
  brand?: string | null;
  model?: string | null;
  batteryCapacity?: number | null;
  rangeKm?: number | null;
  year?: number | null;
  powerKw?: number | null;
  connectorType?: string | null;
  efficiencyWhKm?: number | null;
  notes?: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChargeSessionDto {
  id: string;
  vehicleId: string;
  startedAt: string;
  endedAt: string;
  kWh: number;
  cost: number | null;
  baseCost: number | null;
  discountedCost: number | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type SocialBonusType = 'none' | 'vulnerable' | 'vulnerable_severe' | 'exclusion_risk';

export interface SocialBonusValue {
  socialBonusType: SocialBonusType;
  discountPercent: number;
}
