import { HourlyPrice } from "@/types/evlogger";
import { getRelativePriceLevel, formatPrice } from "@/lib/priceUtils";
import { Zap, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface CurrentPriceCardProps {
  currentPrice: HourlyPrice;
  nextPrice?: HourlyPrice;
  minPrice?: number;
  maxPrice?: number;
}

const calculateTrend = (
  nextPrice: HourlyPrice | undefined,
  currentPrice: HourlyPrice,
): "up" | "down" | "stable" => {
  if (!nextPrice) return "stable";
  if (nextPrice.price > currentPrice.price) return "up";
  if (nextPrice.price < currentPrice.price) return "down";
  return "stable";
};

export const CurrentPriceCard = ({
  currentPrice,
  nextPrice,
  minPrice,
  maxPrice,
}: CurrentPriceCardProps) => {
  // Si no se pasan min/max, usar valores por defecto para evitar errores
  const min = minPrice ?? currentPrice.price * 0.5;
  const max = maxPrice ?? currentPrice.price * 1.5;
  const priceLevel = getRelativePriceLevel(currentPrice.price, min, max);
  const trend = calculateTrend(nextPrice, currentPrice);

  const levelConfig = {
    low: {
      label: "Precio bajo",
      icon: TrendingDown,
      bg: "bg-success/10",
      border: "border-success/30",
      text: "text-success",
      glow: "shadow-[0_0_30px_hsl(var(--success)/0.2)]",
    },
    medium: {
      label: "Precio medio",
      icon: Minus,
      bg: "bg-warning/10",
      border: "border-warning/30",
      text: "text-warning",
      glow: "shadow-[0_0_30px_hsl(var(--warning)/0.2)]",
    },
    high: {
      label: "Precio alto",
      icon: TrendingUp,
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      text: "text-destructive",
      glow: "shadow-[0_0_30px_hsl(var(--destructive)/0.2)]",
    },
  };

  const config = levelConfig[priceLevel];
  const TrendIcon = config.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border p-6 transition-all duration-300",
        config.bg,
        config.border,
        config.glow,
      )}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 opacity-30">
        <div
          className={cn(
            "absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl",
            priceLevel === "low" && "bg-success",
            priceLevel === "medium" && "bg-warning",
            priceLevel === "high" && "bg-destructive",
          )}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("rounded-xl p-2", config.bg)}>
              <Zap className={cn("h-5 w-5", config.text)} />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Precio ahora
            </span>
          </div>
          <Badge
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
              config.bg,
              config.border,
              config.text,
              config.glow,
            )}
            variant="outline"
          >
            <TrendIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        {/* Price display */}
        <div className="mb-2 flex items-baseline gap-2">
          <span
            className={cn(
              "font-mono text-5xl font-bold tracking-tight",
              config.text,
            )}
          >
            {formatPrice(currentPrice.price)}
          </span>
          <span className="text-lg text-muted-foreground">/kWh</span>
        </div>

        {/* Hour indicator */}
        <p className="text-sm text-muted-foreground">
          Hora actual:{" "}
          <span className="font-medium text-foreground">
            {currentPrice.hour}:00 - {currentPrice.hour + 1}:00
          </span>
        </p>

        {/* Next hour preview */}
        {nextPrice && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-background/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">Próxima hora:</span>
            <span
              className={cn(
                "font-mono text-sm font-semibold",
                trend === "up" && "text-destructive",
                trend === "down" && "text-success",
                trend === "stable" && "text-muted-foreground",
              )}
            >
              {formatPrice(nextPrice.price)}
            </span>
            {trend === "up" && (
              <TrendingUp className="h-3 w-3 text-destructive" />
            )}
            {trend === "down" && (
              <TrendingDown className="h-3 w-3 text-success" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
