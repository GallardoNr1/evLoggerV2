import { Car, Zap, Battery, Star, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/hooks/useVehicles";

interface VehicleCardProps {
  vehicle: Vehicle;
  onSetFavorite?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  variant?: "full" | "compact";
}

export const VehicleCard = ({
  vehicle,
  onSetFavorite,
  onEdit,
  onDelete,
  variant = "full",
}: VehicleCardProps) => {
  const isCompact = variant === "compact";

  const displayName =
    vehicle.brand && vehicle.model
      ? `${vehicle.brand} ${vehicle.model}`
      : vehicle.name;

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-card p-4 transition-all",
        vehicle.isFavorite
          ? "border-primary/50 bg-primary/5"
          : "border-border hover:border-primary/30",
      )}
    >
      {/* Favorite badge (solo visual, nunca clickable) */}
      {vehicle.isFavorite && (
        <div className="absolute -top-2 -right-2 rounded-full bg-primary p-1">
          <Star className="h-3 w-3 fill-primary-foreground text-primary-foreground" />
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Icon */}
        {!isCompact && (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              vehicle.isFavorite ? "bg-primary/20" : "bg-secondary",
            )}
          >
            <Car
              className={cn(
                "h-6 w-6",
                vehicle.isFavorite ? "text-primary" : "text-muted-foreground",
              )}
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">
            {vehicle.name}
          </h4>

          {!isCompact && (vehicle.brand || vehicle.model) && (
            <p className="text-sm text-muted-foreground truncate">
              {displayName}
            </p>
          )}

          {/* Stats (solo en modo full) */}
          {!isCompact && (
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Zap className="h-3 w-3 text-primary" />
                <span className="font-mono">
                  {vehicle.consumption} kWh/100km
                </span>
              </div>

              {!!vehicle.batteryCapacity && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Battery className="h-3 w-3" />
                  <span className="font-mono">
                    {vehicle.batteryCapacity} kWh
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions SOLO en modo full */}
        {!isCompact && (
          <div className="flex flex-col gap-2">
            {!vehicle.isFavorite && onSetFavorite && (
              <button
                onClick={() => onSetFavorite(vehicle.id)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                title="Establecer como favorito"
              >
                <Star className="h-4 w-4" />
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => onEdit(vehicle.id)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                title="Editar vehículo"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(vehicle.id)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Eliminar vehículo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
