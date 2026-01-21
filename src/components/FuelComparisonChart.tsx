import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { calculateFuelSavings } from "@/lib/fuelSavingsCalculator";
import type { ChargingSession } from "@/types/evlogger";
import type { ElectricitySettings } from "@/hooks/useSettings";
import { Fuel, Zap } from "lucide-react";

interface FuelComparisonChartProps {
  sessions: ChargingSession[];
  settings: Pick<
    ElectricitySettings,
    "fuelConsumptionL100km" | "fuelPricePerLiter"
  > | null;
}

interface MonthlyData {
  month: string;
  electricCost: number;
  fuelCost: number;
}

export const FuelComparisonChart = ({
  sessions,
  settings,
}: FuelComparisonChartProps) => {
  const monthlyData = useMemo<MonthlyData[]>(() => {
    // Agrupar sesiones por mes
    const monthlyGroups: Record<string, { kWh: number; cost: number }> = {};

    sessions.forEach((session) => {
      const date = new Date(session.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = { kWh: 0, cost: 0 };
      }
      monthlyGroups[monthKey].kWh += session.kWhCharged;
      monthlyGroups[monthKey].cost += session.totalCost;
    });

    // Convertir a array con cálculo de combustible
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    return Object.entries(monthlyGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Últimos 6 meses
      .map(([monthKey, data]) => {
        const [, monthNum] = monthKey.split("-");
        const monthName = monthNames[Number.parseInt(monthNum, 10) - 1];

        const fuelResult = calculateFuelSavings(data.kWh, data.cost, settings);

        return {
          month: monthName,
          electricCost: Number(data.cost.toFixed(2)),
          fuelCost: Number(fuelResult.fuelCost.toFixed(2)),
        };
      });
  }, [sessions, settings]);

  const totalElectric = monthlyData.reduce((sum, d) => sum + d.electricCost, 0);
  const totalFuel = monthlyData.reduce((sum, d) => sum + d.fuelCost, 0);
  const totalSavings = totalFuel - totalElectric;

  if (monthlyData.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-muted-foreground">
          No hay datos suficientes para mostrar el gráfico
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-2 font-semibold text-foreground">
        Eléctrico vs. Combustible
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Comparativa de costes mensuales
      </p>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}€`}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              formatter={(value: number, name: string) => {
                return [`${value.toFixed(2)}€`, name];
              }}
            />
            <Bar
              dataKey="electricCost"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="Eléctrico"
            />
            <Bar
              dataKey="fuelCost"
              fill="hsl(var(--destructive))"
              radius={[4, 4, 0, 0]}
              name="Combustible"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda y resumen */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Eléctrico:</span>
          </div>
          <span className="font-semibold text-primary">
            {totalElectric.toFixed(2)}€
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Fuel className="h-4 w-4 text-destructive" />
            <span className="text-muted-foreground">Combustible:</span>
          </div>
          <span className="font-semibold text-destructive">
            {totalFuel.toFixed(2)}€
          </span>
        </div>
      </div>

      {totalSavings > 0 && (
        <div className="mt-3 rounded-xl bg-success/10 p-3 text-center">
          <p className="text-sm font-medium text-success">
            Ahorro total: {totalSavings.toFixed(2)}€
          </p>
        </div>
      )}
    </div>
  );
};
