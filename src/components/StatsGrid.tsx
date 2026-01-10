import { MonthlyStats } from "@/types/evlogger";
import { formatCurrency } from "@/lib/priceUtils";
import { Battery, Euro, Zap, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsGridProps {
  stats: MonthlyStats;
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const statItems = [
    {
      label: "kWh este mes",
      value: `${stats.totalKWh.toFixed(1)}`,
      unit: "kWh",
      icon: Battery,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Coste total",
      value: formatCurrency(stats.totalCost),
      icon: Euro,
      color: "text-foreground",
      bg: "bg-secondary",
    },
    {
      label: "Precio medio",
      value: `${(stats.avgPricePerKWh * 100).toFixed(1)}¢`,
      unit: "/kWh",
      icon: Zap,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Ahorro estimado",
      value: formatCurrency(stats.savings),
      icon: TrendingDown,
      color: "text-success",
      bg: "bg-success/10",
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {statItems.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "stat-card rounded-2xl border border-border p-4",
            item.highlight && "border-success/30"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="mb-3 flex items-center gap-2">
            <div className={cn("rounded-lg p-2", item.bg)}>
              <item.icon className={cn("h-4 w-4", item.color)} />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("font-mono text-2xl font-bold", item.color)}>
              {item.value}
            </span>
            {item.unit && (
              <span className="text-xs text-muted-foreground">{item.unit}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
};
