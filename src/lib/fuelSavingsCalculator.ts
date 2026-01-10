import type { ElectricitySettings } from '@/hooks/useSettings';

/**
 * Calcula el ahorro estimado comparando el coste eléctrico con el equivalente en combustible.
 * 
 * Fórmula:
 * 1. Estimar km recorridos: kWh * (100 / consumoEV_kWh100km)
 *    - Asumimos un consumo EV promedio de 15 kWh/100km si no se especifica
 * 2. Calcular litros de combustible equivalentes: km / 100 * consumoCombustible_L100km
 * 3. Calcular coste combustible: litros * precioLitro
 * 4. Ahorro = costeCombustible - costeElectrico
 */

const DEFAULT_EV_CONSUMPTION_KWH_100KM = 15; // kWh/100km promedio para EV

export interface FuelSavingsResult {
  fuelCost: number;
  electricCost: number;
  savings: number;
  estimatedKm: number;
  fuelLiters: number;
}

export function calculateFuelSavings(
  kWhCharged: number,
  electricCost: number,
  settings: Pick<ElectricitySettings, 'fuelConsumptionL100km' | 'fuelPricePerLiter'> | null,
  evConsumptionKWh100km: number = DEFAULT_EV_CONSUMPTION_KWH_100KM
): FuelSavingsResult {
  const fuelConsumption = settings?.fuelConsumptionL100km ?? 7.0;
  const fuelPrice = settings?.fuelPricePerLiter ?? 1.55;

  // Estimar km recorridos con la energía cargada
  const estimatedKm = kWhCharged * (100 / evConsumptionKWh100km);
  
  // Calcular litros de combustible para recorrer esos km
  const fuelLiters = (estimatedKm / 100) * fuelConsumption;
  
  // Calcular coste del combustible
  const fuelCost = fuelLiters * fuelPrice;
  
  // Ahorro = lo que hubieras gastado en combustible - lo que gastaste en electricidad
  const savings = fuelCost - electricCost;

  return {
    fuelCost,
    electricCost,
    savings,
    estimatedKm,
    fuelLiters,
  };
}

/**
 * Calcula el ahorro total acumulado de múltiples sesiones
 */
export function calculateTotalFuelSavings(
  sessions: Array<{ kWhCharged: number; totalCost: number }>,
  settings: Pick<ElectricitySettings, 'fuelConsumptionL100km' | 'fuelPricePerLiter'> | null,
  evConsumptionKWh100km: number = DEFAULT_EV_CONSUMPTION_KWH_100KM
): FuelSavingsResult {
  const totals = sessions.reduce(
    (acc, session) => ({
      totalKWh: acc.totalKWh + session.kWhCharged,
      totalElectricCost: acc.totalElectricCost + session.totalCost,
    }),
    { totalKWh: 0, totalElectricCost: 0 }
  );

  return calculateFuelSavings(
    totals.totalKWh,
    totals.totalElectricCost,
    settings,
    evConsumptionKWh100km
  );
}
