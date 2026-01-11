import { useState, useEffect, useCallback } from "react";
import { fetchPVPCPrices, type PVPCPrice } from "@/api/pvpcClient";
import { format, addDays, subDays } from "date-fns";

export type PriceDay = "yesterday" | "today" | "tomorrow";

export function usePVPCPrices(day: PriceDay = "today") {
  const [prices, setPrices] = useState<PVPCPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tomorrowAvailable, setTomorrowAvailable] = useState(false);

  const getDateForDay = useCallback((targetDay: PriceDay): string => {
    const today = new Date();
    switch (targetDay) {
      case "yesterday":
        return format(subDays(today, 1), "yyyy-MM-dd");
      case "tomorrow":
        return format(addDays(today, 1), "yyyy-MM-dd");
      case "today":
      default:
        return format(today, "yyyy-MM-dd");
    }
  }, []);

  const checkTomorrowAvailability = useCallback(async () => {
    try {
      const tomorrowDate = format(addDays(new Date(), 1), "yyyy-MM-dd");
      const tomorrowPrices = await fetchPVPCPrices(tomorrowDate);
      setTomorrowAvailable(tomorrowPrices.length > 0);
    } catch {
      setTomorrowAvailable(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const dateStr = getDateForDay(day);
      const data = await fetchPVPCPrices(dateStr);

      setPrices(data);
      setError(null);
    } catch (e) {
      console.error("Error fetching PVPC prices:", e);
      setError(e instanceof Error ? e : new Error("Error loading prices"));
      setPrices([]);
    } finally {
      setLoading(false);
    }
  }, [day, getDateForDay]);

  // Check tomorrow availability on mount and when day changes to today
  useEffect(() => {
    if (day === "today") {
      checkTomorrowAvailability();
    }
  }, [day, checkTomorrowAvailability]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { prices, loading, error, refresh, tomorrowAvailable };
}
