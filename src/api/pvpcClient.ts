/**
 * Cliente para obtener precios PVPC via edge function (ESIOS API)
 */

import { supabase } from '@/integrations/supabase/client';

export type PVPCPrice = {
  hour: number;
  price: number; // €/kWh
  date: Date;
};

interface PriceEntry {
  hour: number;
  price: number;
  datetime: string;
}

interface PVPCResponse {
  prices: PriceEntry[];
  error?: string;
}

/**
 * Obtiene los precios PVPC de una fecha específica desde ESIOS via edge function
 * @param dateStr Fecha en formato YYYY-MM-DD (opcional, por defecto hoy)
 */
export async function fetchPVPCPrices(dateStr?: string): Promise<PVPCPrice[]> {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase.functions.invoke<PVPCResponse>('pvpc-prices', {
    body: { date: targetDate }
  });
  
  if (error) {
    throw new Error(`Error fetching PVPC prices: ${error.message}`);
  }
  
  if (data?.error) {
    throw new Error(`Error fetching PVPC prices: ${data.error}`);
  }
  
  const date = new Date(targetDate);
  
  return (data?.prices || []).map((item) => ({
    hour: item.hour,
    price: item.price,
    date,
  }));
}

/**
 * Obtiene los precios PVPC del día actual desde ESIOS via edge function
 */
export async function fetchTodayPVPCPrices(): Promise<PVPCPrice[]> {
  return fetchPVPCPrices();
}
