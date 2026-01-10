import { HourlyPrice } from "@/types/evlogger";

export const getCurrentPrice = (prices: HourlyPrice[]): HourlyPrice => {
  const currentHour = new Date().getHours();
  return prices.find(p => p.hour === currentHour) || prices[0];
};

export const getPriceLevel = (price: number): "low" | "medium" | "high" => {
  if (price < 0.08) return "low";
  if (price < 0.12) return "medium";
  return "high";
};

/**
 * Calcula el nivel de precio relativo al rango del día
 * @param price Precio actual en €/kWh
 * @param minPrice Precio mínimo del día
 * @param maxPrice Precio máximo del día
 * @returns "low" | "medium" | "high" basado en la posición relativa
 */
export const getRelativePriceLevel = (
  price: number,
  minPrice: number,
  maxPrice: number
): "low" | "medium" | "high" => {
  const range = maxPrice - minPrice;
  if (range === 0) return "medium";
  
  const position = (price - minPrice) / range; // 0 = más barato, 1 = más caro
  
  if (position <= 0.33) return "low";
  if (position <= 0.66) return "medium";
  return "high";
};

/**
 * Obtiene la clase de color CSS basada en el nivel de precio relativo
 */
export const getRelativePriceColor = (
  price: number,
  minPrice: number,
  maxPrice: number
): string => {
  const level = getRelativePriceLevel(price, minPrice, maxPrice);
  switch (level) {
    case "low": return "text-success";
    case "medium": return "text-warning";
    case "high": return "text-destructive";
  }
};

export const formatPrice = (price: number): string => {
  return `${(price * 100).toFixed(1)}¢`;
};

export const formatCurrency = (amount: number): string => {
  return `${amount.toFixed(2)}€`;
};
