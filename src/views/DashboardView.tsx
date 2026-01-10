import { Loader2 } from "lucide-react";
import { CurrentPriceCard } from "@/components/CurrentPriceCard";
import { StatsGrid } from "@/components/StatsGrid";
import { SessionsList } from "@/components/SessionsList";
import type { ChargingSession, MonthlyStats, HourlyPrice } from "@/types/evlogger";

interface DashboardViewProps {
  pricesLoading: boolean;
  pricesError: Error | null;
  currentPrice: HourlyPrice;
  nextPrice?: HourlyPrice;
  minPrice: number;
  maxPrice: number;
  stats: MonthlyStats;
  sessions: ChargingSession[];
  showFuelSavings: boolean;
  onDeleteSession?: (id: string) => void;
}

export const DashboardView = ({
  pricesLoading,
  pricesError,
  currentPrice,
  nextPrice,
  minPrice,
  maxPrice,
  stats,
  sessions,
  showFuelSavings,
  onDeleteSession,
}: DashboardViewProps) => {
  return (
    <>
      {/* Current price card */}
      <section className="animate-fade-in">
        {pricesLoading ? (
          <div className="flex items-center justify-center rounded-3xl border border-border bg-card p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Cargando precios PVPC...
            </span>
          </div>
        ) : pricesError ? (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">
              Error al cargar precios: {pricesError.message}
            </p>
          </div>
        ) : (
          <CurrentPriceCard
            currentPrice={currentPrice}
            nextPrice={nextPrice}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        )}
      </section>

      {/* Monthly stats grid */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: "100ms" }}
      >
        <StatsGrid stats={stats} />
      </section>

      {/* Recent sessions */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: "200ms" }}
      >
        <SessionsList
          sessions={sessions.slice(0, 3)}
          onSessionClick={() => {/* TODO: implement session detail view */}}
          onDeleteSession={onDeleteSession}
          showFuelSavings={showFuelSavings}
        />
      </section>
    </>
  );
};
