import type { ElectricitySettings } from '@/hooks/useSettings';

// Constantes de impuestos (2026)
export const ELECTRICITY_TAX_RATE = 0.0511; // 5.11% Impuesto especial sobre electricidad
export const IVA_RATE = 0.21; // 21% IVA general

export type CostBreakdown = {
  /** Coste base de la energía (kWh × precio) */
  baseCost: number;
  /** Ahorro por bono social */
  bonusDiscount: number;
  /** Coste tras aplicar bono social */
  costAfterBonus: number;
  /** Impuesto especial sobre electricidad (5.11%) */
  electricityTax: number;
  /** IVA (21%) */
  iva: number;
  /** Coste total final con impuestos */
  totalCost: number;
};

/**
 * Calcula el desglose completo de costes incluyendo bono social e impuestos
 */
export function calculateCostBreakdown(
  baseCost: number,
  settings: ElectricitySettings | null
): CostBreakdown {
  // Proteger contra NaN
  if (isNaN(baseCost) || baseCost === null || baseCost === undefined) {
    console.warn('[calculateCostBreakdown] baseCost is NaN or invalid:', baseCost);
    return {
      baseCost: 0,
      bonusDiscount: 0,
      costAfterBonus: 0,
      electricityTax: 0,
      iva: 0,
      totalCost: 0,
    };
  }

  // 1. Calcular descuento del bono social
  let bonusDiscount = 0;
  if (settings?.hasSocialBonus && settings.socialBonusType !== 'NONE') {
    const discountPercent = settings.socialBonusDiscountPercent ?? 0;
    if (!isNaN(discountPercent)) {
      bonusDiscount = baseCost * (discountPercent / 100);
    }
  }

  const costAfterBonus = Math.max(0, baseCost - bonusDiscount);

  // 2. Aplicar impuesto especial sobre electricidad (5.11%)
  const electricityTax = costAfterBonus * ELECTRICITY_TAX_RATE;
  const costWithElectricityTax = costAfterBonus + electricityTax;

  // 3. Aplicar IVA (21%) sobre el total anterior
  const iva = costWithElectricityTax * IVA_RATE;
  const totalCost = costWithElectricityTax + iva;

  return {
    baseCost,
    bonusDiscount,
    costAfterBonus,
    electricityTax,
    iva,
    totalCost,
  };
}

/**
 * Calcula el coste con el descuento del bono social aplicado (sin impuestos)
 * @deprecated Usar calculateCostBreakdown para el cálculo completo
 */
export function applyBonusDiscount(
  baseCost: number,
  settings: ElectricitySettings | null
): number {
  // Proteger contra NaN
  if (isNaN(baseCost) || baseCost === null || baseCost === undefined) {
    console.warn('[applyBonusDiscount] baseCost is NaN or invalid:', baseCost);
    return 0;
  }
  
  if (!settings?.hasSocialBonus || settings.socialBonusType === 'NONE') {
    return baseCost;
  }
  
  const discountPercent = settings.socialBonusDiscountPercent ?? 0;
  
  // Proteger contra NaN en el porcentaje
  if (isNaN(discountPercent)) {
    console.warn('[applyBonusDiscount] discountPercent is NaN');
    return baseCost;
  }
  
  const discount = baseCost * (discountPercent / 100);
  
  return Math.max(0, baseCost - discount);
}

/**
 * Calcula el ahorro por bono social
 */
export function calculateBonusSavings(
  baseCost: number,
  settings: ElectricitySettings | null
): number {
  if (!settings?.hasSocialBonus || settings.socialBonusType === 'NONE') {
    return 0;
  }
  
  const discountPercent = settings.socialBonusDiscountPercent ?? 0;
  return baseCost * (discountPercent / 100);
}
