import { supabase } from '@/integrations/supabase/client';
import { applyBonusDiscount } from '@/lib/costCalculator';
import type { ElectricitySettings } from '@/hooks/useSettings';

export type HourlyPriceData = {
  hour: number;
  price: number;
  startsAt: string;
  endsAt: string;
};

export type SessionCostResult = {
  baseCost: number;
  discountedCost: number;
  averagePrice: number;
  pricesUsed: HourlyPriceData[];
  hoursCharged: number;
  dayMinPrice: number;
  dayMaxPrice: number;
};

/**
 * Obtiene precios de ESIOS para una fecha específica via Edge Function.
 */
export async function fetchPricesForDate(
  dateStr: string,
): Promise<HourlyPriceData[]> {
  try {
    const { data, error } = await supabase.functions.invoke('pvpc-prices', {
      body: { date: dateStr },
    });

    if (error) {
      console.error('Error fetching prices from API:', error);
      throw new Error(`Error al obtener precios: ${error.message}`);
    }

    const apiPrices: HourlyPriceData[] = data?.prices || [];

    // Normalizar: asegurar hour siempre
    return apiPrices.map((p) => ({
      ...p,
      hour: typeof p.hour === 'number' ? p.hour : new Date(p.startsAt).getHours(),
    }));
  } catch (err) {
    console.error('Failed to fetch prices:', err);
    throw err;
  }
}

/**
 * Calcula el coste de una sesión de carga basado en las horas y los precios PVPC.
 * Si el contrato es FIXED_SINGLE, usa el precio fijo sin necesidad de horas.
 */
export async function calculateSessionCost(
  startTime: string,
  endTime: string,
  dateStr: string,
  kWh: number,
  settings?: ElectricitySettings | null,
): Promise<SessionCostResult> {
  // Si es tarifa fija, cálculo simple sin necesidad de horas ni precios PVPC
  if (settings?.contractType === 'FIXED_SINGLE' && settings.fixedPricePerKwh) {
    const fixedPrice = settings.fixedPricePerKwh;
    const baseCost = kWh * fixedPrice;

    return {
      baseCost,
      discountedCost: applyBonusDiscount(baseCost, settings),
      averagePrice: fixedPrice,
      pricesUsed: [],
      hoursCharged: 0,
      dayMinPrice: fixedPrice,
      dayMaxPrice: fixedPrice,
    };
  }

  // Obtener precios para la fecha
  const prices = await fetchPricesForDate(dateStr);

  if (prices.length === 0) {
    throw new Error('No hay precios disponibles para esta fecha');
  }

  // min/max del día
  const dayMinPrice = Math.min(...prices.map((p) => p.price));
  const dayMaxPrice = Math.max(...prices.map((p) => p.price));

  // Parsear horas
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  // Manejar carga que cruza medianoche
  let adjustedEndHour = endHour;
  if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
    adjustedEndHour = endHour + 24;
  }

  // Calcular duración total en horas
  const startDecimal = startHour + startMinute / 60;
  const endDecimal = adjustedEndHour + endMinute / 60;
  const totalHours = endDecimal - startDecimal;

  if (totalHours <= 0) {
    throw new Error('La hora de fin debe ser posterior a la hora de inicio');
  }

  // Acumuladores
  const pricesUsed: HourlyPriceData[] = [];
  let weightedPriceSum = 0;
  let totalWeight = 0;

  // Para cada hora que abarca la carga
  for (let h = Math.floor(startDecimal); h < Math.ceil(endDecimal); h++) {
    const currentHour = h % 24;
    const priceData = prices.find((p) => p.hour === currentHour);

    if (!priceData) {
      console.warn(`No price found for hour ${currentHour}`);
      continue;
    }

    // Calcular fracción de hora
    let fraction = 1;

    if (h === Math.floor(startDecimal)) {
      fraction = 1 - (startDecimal - Math.floor(startDecimal));
    }
    if (h === Math.floor(endDecimal)) {
      fraction = endDecimal - Math.floor(endDecimal);
      if (fraction === 0) continue;
    }

    weightedPriceSum += priceData.price * fraction;
    totalWeight += fraction;

    if (!pricesUsed.find((p) => p.hour === priceData.hour)) {
      pricesUsed.push(priceData);
    }
  }

  // Fallback: si no se pudo calcular con fracciones
  if (totalWeight === 0 || pricesUsed.length === 0) {
    const startH = startHour;
    const endH = adjustedEndHour % 24;

    const hoursSpan =
      startHour <= endH
        ? prices.filter((p) => p.hour >= startH && p.hour <= endH)
        : prices.filter((p) => p.hour >= startH || p.hour <= endH);

    if (hoursSpan.length === 0) {
      throw new Error('No se encontraron precios para las horas de carga');
    }

    const avgPrice = hoursSpan.reduce((sum, p) => sum + p.price, 0) / hoursSpan.length;
    const baseCost = kWh * avgPrice;

    return {
      baseCost,
      discountedCost: applyBonusDiscount(baseCost, settings ?? null),
      averagePrice: avgPrice,
      pricesUsed: hoursSpan.sort((a, b) => a.hour - b.hour),
      hoursCharged: totalHours,
      dayMinPrice,
      dayMaxPrice,
    };
  }

  const averagePrice = weightedPriceSum / totalWeight;
  const baseCost = kWh * averagePrice;

  return {
    baseCost,
    discountedCost: applyBonusDiscount(baseCost, settings ?? null),
    averagePrice,
    pricesUsed: pricesUsed.sort((a, b) => a.hour - b.hour),
    hoursCharged: totalHours,
    dayMinPrice,
    dayMaxPrice,
  };
}
