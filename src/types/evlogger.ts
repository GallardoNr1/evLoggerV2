export interface ChargingSession {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  kWhCharged: number;
  averagePrice: number;
  totalCost: number;
  location?: string;
  vehicleName?: string;
  vehicleId?: string;
  fuelSavings?: number; // Ahorro estimado vs combustible
}

export interface HourlyPrice {
  hour: number;
  price: number;
  date: Date;
}

export interface DailyStats {
  totalKWh: number;
  totalCost: number;
  avgPricePerKWh: number;
  sessionsCount: number;
}

export interface MonthlyStats extends DailyStats {
  savings: number;
  bestHour: number;
  worstHour: number;
}
