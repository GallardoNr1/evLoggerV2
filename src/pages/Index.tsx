import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { InfoContent } from "@/components/InfoContent";
import { DashboardView, PricesView, StatsView, SettingsView } from "@/views";
import { useSettings } from "@/hooks/useSettings";
import { useVehicles } from "@/hooks/useVehicles";
import { useChargeSessions } from "@/hooks/useChargeSessions";
import { usePVPCPrices, type PriceDay } from "@/hooks/usePVPCPrices";
import { applyBonusDiscount } from "@/lib/costCalculator";
import { calculateFuelSavings } from "@/lib/fuelSavingsCalculator";
import type {
  ChargingSession,
  MonthlyStats,
  HourlyPrice,
} from "@/types/evlogger";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [priceDay, setPriceDay] = useState<PriceDay>("today");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [isOnline] = useState(true);

  const { settings } = useSettings();
  const { vehicles } = useVehicles();
  const {
    sessions: dbSessions,
    removeSession,
  } = useChargeSessions(selectedVehicleId ?? undefined);

  // Obtener precios PVPC reales
  const {
    prices: pvpcPrices,
    loading: pricesLoading,
    error: pricesError,
    tomorrowAvailable,
  } = usePVPCPrices(priceDay);

  // Los precios ya vienen en formato compatible con HourlyPrice
  const todayPrices = useMemo<HourlyPrice[]>(() => {
    if (pvpcPrices.length === 0) {
      return Array.from({ length: 24 }, (_, hour) => ({
        hour,
        price: 0,
        date: new Date(),
      }));
    }
    return pvpcPrices;
  }, [pvpcPrices]);

  // Calcular min/max para colores relativos
  const { minPrice, maxPrice } = useMemo(() => {
    if (todayPrices.length === 0) return { minPrice: 0, maxPrice: 1 };
    const prices = todayPrices.map((p) => p.price);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [todayPrices]);

  const currentHour = new Date().getHours();
  const currentPrice =
    todayPrices.find((p) => p.hour === currentHour) ?? todayPrices[0];
  const nextPrice = todayPrices.find((p) => p.hour === currentHour + 1);

  // Helper to format time in Spanish timezone
  const formatTimeInSpain = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("es-ES", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Helper to get date in Spanish timezone
  const getDateInSpain = (dateStr: string): Date => {
    // Parse the date and create a new Date object adjusted for display
    const date = new Date(dateStr);
    // Get the date parts in Spanish timezone
    const parts = new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    const year = parseInt(
      parts.find((p) => p.type === "year")?.value ?? "2026",
    );
    const month =
      parseInt(parts.find((p) => p.type === "month")?.value ?? "1") - 1;
    const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "1");

    return new Date(year, month, day);
  };

  // Convertir sesiones de DB a formato ChargingSession
  const sessions = useMemo<ChargingSession[]>(() => {
    return dbSessions.map((s) => {
      const vehicleName =
        vehicles.find((v) => v.id === s.vehicleId)?.name ?? "Vehículo";
      const avgPrice =
        s.averagePrice ?? (s.kWh > 0 ? (s.cost ?? 0) / s.kWh : 0);

      return {
        id: s.id,
        date: getDateInSpain(s.startedAt),
        startTime: formatTimeInSpain(s.startedAt),
        endTime: formatTimeInSpain(s.endedAt),
        kWhCharged: s.kWh,
        averagePrice: avgPrice,
        totalCost: s.cost ?? 0,
        baseCost: s.baseCost ?? s.cost ?? 0,
        location: s.location ?? "Casa",
        vehicleName,
        vehicleId: s.vehicleId,
      };
    });
  }, [dbSessions, vehicles]);

  // Apply social bonus discount and calculate fuel savings for sessions
  const sessionsWithDiscount = useMemo<ChargingSession[]>(() => {
    return sessions.map((session) => {
      const discountedCost = applyBonusDiscount(session.totalCost, settings);
      const fuelResult = calculateFuelSavings(
        session.kWhCharged,
        discountedCost,
        settings,
      );

      return {
        ...session,
        totalCost: discountedCost,
        fuelSavings: fuelResult.savings,
      };
    });
  }, [settings, sessions]);

  // Calculate stats based on sessions with fuel savings
  const statsWithDiscount = useMemo<MonthlyStats>(() => {
    const totalKWh = sessions.reduce((sum, s) => sum + s.kWhCharged, 0);
    const baseTotalCost = sessions.reduce((sum, s) => sum + s.totalCost, 0);
    const discountedCost = applyBonusDiscount(baseTotalCost, settings);
    const avgPrice = totalKWh > 0 ? discountedCost / totalKWh : 0;

    const fuelResult = calculateFuelSavings(totalKWh, discountedCost, settings);

    const sortedPrices = [...todayPrices].sort((a, b) => a.price - b.price);
    const bestHour = sortedPrices[0]?.hour ?? 3;
    const worstHour = sortedPrices[sortedPrices.length - 1]?.hour ?? 20;

    return {
      totalKWh,
      totalCost: discountedCost,
      avgPricePerKWh: avgPrice,
      sessionsCount: sessions.length,
      savings: fuelResult.savings > 0 ? fuelResult.savings : 0,
      bestHour,
      worstHour,
    };
  }, [settings, sessions, todayPrices]);

  const handleDeleteSession = async (id: string) => {
    await removeSession(id);
  };

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        paddingTop: "calc(4rem + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <Header />

      <main
        id="main-content"
        className="mx-auto max-w-md space-y-6 px-4 py-4"
        role="main"
      >
        {activeTab === "dashboard" && (
          <DashboardView
            pricesLoading={pricesLoading}
            pricesError={pricesError}
            currentPrice={currentPrice}
            nextPrice={nextPrice}
            minPrice={minPrice}
            maxPrice={maxPrice}
            stats={statsWithDiscount}
            sessions={sessionsWithDiscount}
            showFuelSavings={settings?.showFuelSavings ?? true}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === "prices" && (
          <PricesView
            priceDay={priceDay}
            onPriceDayChange={setPriceDay}
            tomorrowAvailable={tomorrowAvailable}
            pricesLoading={pricesLoading}
            pricesError={pricesError}
            prices={todayPrices}
            currentHour={currentHour}
            currentPrice={currentPrice}
            nextPrice={nextPrice}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        )}

        {activeTab === "stats" && (
          <StatsView
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
            stats={statsWithDiscount}
            sessions={sessionsWithDiscount}
            settings={settings}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === "info" && (
          <section className="animate-fade-in">
            <InfoContent />
          </section>
        )}

        {activeTab === "settings" && <SettingsView />}
      </main>

      {/* Floating buttons container - respects main content width */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
