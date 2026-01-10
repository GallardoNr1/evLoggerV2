import { Car, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsGrid } from "@/components/StatsGrid";
import { PeriodSummary } from "@/components/PeriodSummary";
import { FuelComparisonChart } from "@/components/FuelComparisonChart";
import { SessionsList } from "@/components/SessionsList";
import { cn } from "@/lib/utils";
import type { ChargingSession, MonthlyStats } from "@/types/evlogger";
import type { Vehicle } from "@/hooks/useVehicles";
import type { ElectricitySettings } from "@/hooks/useSettings";

interface StatsViewProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string | null) => void;
  stats: MonthlyStats;
  sessions: ChargingSession[];
  settings: ElectricitySettings | null;
  onDeleteSession?: (id: string) => void;
}

export const StatsView = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  stats,
  sessions,
  settings,
  onDeleteSession,
}: StatsViewProps) => {
  return (
    <>
      {/* Vehicle filter */}
      <section className="animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Filtrar por vehículo
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={"outline"}
            size="sm"
            onClick={() => onSelectVehicle(null)}
            className={cn(
              "relative rounded-2x1 border transition-all hover:bg-secondary",
              selectedVehicleId === null
                ? "border-primary/50 text-primary hover:text-primary"
                : "border-muted-foreground text-muted-foreground hover:text-muted-foreground",
            )}
          >
            Todos
          </Button>
          {vehicles.map((v) => (
            <Button
              key={v.id}
              variant={"outline"}
              size="sm"
              onClick={() => onSelectVehicle(v.id)}
              className={cn(
                "relative rounded-2x1 border transition-all hover:bg-secondary",
                selectedVehicleId === v.id
                  ? "border-primary/50 text-primary hover:text-primary"
                  : "border-muted-foreground text-muted-foreground hover:text-muted-foreground",
              )}
            >
              {v.name}
              {v.isFavorite && (
                <Star
                  className={cn(
                    "absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full p-0.5 hover:bg-secondary",
                    selectedVehicleId === v.id
                      ? "bg-primary text-primary-foreground fill-primary-foreground"
                      : "bg-secondary border border-muted-foreground text-muted-foreground fill-muted-foreground",
                  )}
                />
              )}
            </Button>
          ))}
        </div>
      </section>

      {/* Stats overview */}
      <section className="animate-fade-in" style={{ animationDelay: "50ms" }}>
        <StatsGrid stats={stats} />
      </section>

      {/* Period Summary (Monthly/Yearly) */}
      <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
        <PeriodSummary sessions={sessions} />
      </section>

      {/* Fuel comparison chart */}
      {settings?.showFuelSavings && (
        <section
          className="animate-fade-in"
          style={{ animationDelay: "150ms" }}
        >
          <FuelComparisonChart sessions={sessions} settings={settings} />
        </section>
      )}

      {/* All sessions */}
      <section
        className="animate-fade-in"
        style={{
          animationDelay: settings?.showFuelSavings ? "200ms" : "150ms",
        }}
      >
        <SessionsList
          sessions={sessions}
          onSessionClick={() => {
            /* TODO: implement session detail view */
          }}
          onDeleteSession={onDeleteSession}
          showFuelSavings={settings?.showFuelSavings ?? true}
        />
      </section>
    </>
  );
};
