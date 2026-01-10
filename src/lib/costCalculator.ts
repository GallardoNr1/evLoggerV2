import type { ElectricitySettings } from '@/hooks/useSettings';

/**
 * Calcula el coste con el descuento del bono social aplicado
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
