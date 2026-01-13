import { useMemo, useState, useEffect } from "react";
import { Calendar, TrendingUp, Zap, Euro, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SegmentedControl from "@/components/SegmentedControl";
import type { ChargingSession } from "@/types/evlogger";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";

interface PeriodSummaryProps {
  sessions: ChargingSession[];
}

type PeriodType = "month" | "year";

export const PeriodSummary = ({ sessions }: PeriodSummaryProps) => {
  const [period, setPeriod] = useState<PeriodType>("month");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Get unique periods with sessions
  const availablePeriods = useMemo(() => {
    const periodsSet = new Set<string>();
    
    sessions.forEach((s) => {
      const date = new Date(s.date);
      if (period === "month") {
        periodsSet.add(format(date, "yyyy-MM"));
      } else {
        periodsSet.add(format(date, "yyyy"));
      }
    });

    // Sort descending (most recent first)
    return Array.from(periodsSet).sort((a, b) => b.localeCompare(a));
  }, [sessions, period]);

  // Reset index when period type changes or when available periods change
  useEffect(() => {
    setSelectedIndex(0);
  }, [period, availablePeriods.length]);

  const currentPeriodKey = availablePeriods[selectedIndex] ?? null;

  const handlePrevious = () => {
    if (selectedIndex < availablePeriods.length - 1) {
      setSelectedIndex((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    }
  };

  const canGoPrevious = selectedIndex < availablePeriods.length - 1;
  const canGoNext = selectedIndex > 0;

  const summary = useMemo(() => {
    if (!currentPeriodKey) {
      return {
        totalKWh: 0,
        totalCost: 0,
        totalSavings: 0,
        sessionsCount: 0,
        avgCostPerSession: 0,
        avgKWhPerSession: 0,
        avgPricePerKWh: 0,
        periodLabel: period === "month" ? "Sin datos" : "Sin datos",
      };
    }

    let start: Date;
    let end: Date;
    let periodLabel: string;

    if (period === "month") {
      const [year, month] = currentPeriodKey.split("-").map(Number);
      const date = new Date(year, month - 1, 1);
      start = startOfMonth(date);
      end = endOfMonth(date);
      periodLabel = format(date, "MMMM yyyy", { locale: es });
    } else {
      const year = Number(currentPeriodKey);
      const date = new Date(year, 0, 1);
      start = startOfYear(date);
      end = endOfYear(date);
      periodLabel = currentPeriodKey;
    }

    const filteredSessions = sessions.filter((s) =>
      isWithinInterval(new Date(s.date), { start, end })
    );

    const totalKWh = filteredSessions.reduce((sum, s) => sum + s.kWhCharged, 0);
    const totalCost = filteredSessions.reduce((sum, s) => sum + s.totalCost, 0);
    const totalSavings = filteredSessions.reduce((sum, s) => sum + (s.fuelSavings ?? 0), 0);
    const sessionsCount = filteredSessions.length;
    const avgCostPerSession = sessionsCount > 0 ? totalCost / sessionsCount : 0;
    const avgKWhPerSession = sessionsCount > 0 ? totalKWh / sessionsCount : 0;
    const avgPricePerKWh = totalKWh > 0 ? totalCost / totalKWh : 0;

    return {
      totalKWh,
      totalCost,
      totalSavings,
      sessionsCount,
      avgCostPerSession,
      avgKWhPerSession,
      avgPricePerKWh,
      periodLabel,
    };
  }, [sessions, period, currentPeriodKey]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Resumen del período</h3>
        </div>
      </div>

      <SegmentedControl
        options={[
          { name: "Mes", value: "month" },
          { name: "Año", value: "year" },
        ]}
        value={period}
        onChange={(val) => setPeriod(val as PeriodType)}
      />

      <div className="mt-3 flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-foreground capitalize min-w-[120px] text-center">
          {summary.periodLabel}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleNext}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Totals */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total kWh</span>
          </div>
          <p className="text-lg font-bold text-foreground">{summary.totalKWh.toFixed(1)}</p>
        </div>

        <div className="rounded-xl bg-success/10 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Euro className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Total coste</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatCurrency(summary.totalCost)}</p>
        </div>

        <div className="rounded-xl bg-secondary p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sesiones</span>
          </div>
          <p className="text-lg font-bold text-foreground">{summary.sessionsCount}</p>
        </div>

        <div className="rounded-xl bg-secondary p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Ahorro total</span>
          </div>
          <p className="text-lg font-bold text-success">{formatCurrency(summary.totalSavings)}</p>
        </div>
      </div>

      {/* Averages */}
      <div className="mt-4 rounded-xl bg-muted/50 p-3">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Promedios</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Coste por sesión</span>
            <span className="font-medium text-foreground">{formatCurrency(summary.avgCostPerSession)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">kWh por sesión</span>
            <span className="font-medium text-foreground">{summary.avgKWhPerSession.toFixed(1)} kWh</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Precio medio</span>
            <span className="font-medium text-foreground">{(summary.avgPricePerKWh * 100).toFixed(2)} ¢/kWh</span>
          </div>
        </div>
      </div>
    </div>
  );
};
