import { ChargingSession } from "@/types/evlogger";
import { formatCurrency, getPriceLevel } from "@/lib/priceUtils";
import {
  Battery,
  Clock,
  MapPin,
  Zap,
  Car,
  TrendingDown,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "./ui/button";

interface SessionCardProps {
  session: ChargingSession;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  showFuelSavings?: boolean;
}

export const SessionCard = ({
  session,
  onClick,
  onDelete,
  showFuelSavings = true,
}: SessionCardProps) => {
  const priceLevel = getPriceLevel(session.averagePrice);

  const levelColors = {
    low: "text-success border-success/30 bg-success/10",
    medium: "text-warning border-warning/30 bg-warning/10",
    high: "text-destructive border-destructive/30 bg-destructive/10",
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(session.id);
  };

  return (
    <div
      className="relative session-card cursor-pointer group "
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Main content */}
        <div className="flex-1 flex items-start justify-between min-w-0">
          {/* Left side: Session info */}
          <div className="flex-1 min-w-0">
            {/* Date, vehicle and location */}
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">
                {format(session.date, "d MMM", { locale: es })}
              </span>
              {session.vehicleName && (
                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Car className="h-3 w-3" />
                  {session.vehicleName}
                </div>
              )}
              {session.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {session.location}
                </div>
              )}
            </div>

            {/* Time and energy */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {session.startTime && session.endTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {session.startTime} - {session.endTime}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Battery className="h-3 w-3" />
                {session.kWhCharged.toFixed(1)} kWh
              </div>
            </div>
          </div>

          {/* Right side: Cost and savings */}
          <div className="text-right shrink-0">
            <div className="font-mono text-xl font-bold text-foreground">
              {formatCurrency(session.totalCost)}
            </div>
            <div className="flex flex-row items-end gap-1">
              <div
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                  levelColors[priceLevel],
                )}
              >
                <Zap className="h-3 w-3" />
                {(session.averagePrice * 100).toFixed(1)}¢/kWh
              </div>
              {showFuelSavings &&
                session.fuelSavings !== undefined &&
                session.fuelSavings > 0 && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/30 px-2 py-0.5 text-xs font-medium text-success">
                    <TrendingDown className="h-3 w-3" />-
                    {formatCurrency(session.fuelSavings)}
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Delete button - separate column */}
        {onDelete && (
          <Button
            onClick={handleDelete}
            type="button"
            variant="ghost"
            className={cn(
              "absolute -bottom-2 -right-2 z-10",
              "h-6 w-6 p-0 rounded-full",
              "bg-background border border-destructive text-destructive",
              "hover:bg-destructive/30 hover:border-destructive hover:text-destructive",
              "focus-visible:ring-2 focus-visible:ring-destructive/30 focus-visible:ring-offset-2",
            )}
            aria-label="Eliminar sesión"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
