import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChargingSession } from "@/types/evlogger";
import {
  formatCurrency,
  getPriceLevel,
  getRelativePriceColor,
} from "@/lib/priceUtils";
import {
  Battery,
  Clock,
  MapPin,
  Car,
  Zap,
  Calendar,
  TrendingDown,
  Timer,
  Gauge,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";
import { useEffect, useMemo, useState } from "react";
import {
  fetchPricesForDate,
  type HourlyPriceData,
} from "@/lib/sessionCostCalculator";
import { Button } from "./ui/button";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

interface SessionDetailSheetProps {
  session: ChargingSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** El padre ejecuta el borrado real (quitar de estado / persistencia) */
  onDelete?: (id: string) => void;

  /** Opcional: si quieres cerrar el sheet tras borrar */
  closeOnDelete?: boolean;
}

export function SessionDetailSheet({
  session,
  open,
  onOpenChange,
  onDelete,
  closeOnDelete = true,
}: Readonly<SessionDetailSheetProps>) {
  const { settings } = useSettings();

  const [pricesUsed, setPricesUsed] = useState<HourlyPriceData[]>([]);
  const [dayMinPrice, setDayMinPrice] = useState(0);
  const [dayMaxPrice, setDayMaxPrice] = useState(1);

  // ✅ estado interno del confirm
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const isFixedContract = settings?.contractType === "FIXED_SINGLE";
  const isHomeSession = !session?.location || session.location === "Casa";
  const hasValidTimes =
    session?.startTime && session?.endTime && session.startTime !== "00:00";

  useEffect(() => {
    if (!session || !open || isFixedContract || !isHomeSession) {
      setPricesUsed([]);
      return;
    }

    const loadPrices = async () => {
      try {
        const dateStr = format(session.date, "yyyy-MM-dd");
        const allPrices = await fetchPricesForDate(dateStr);

        if (allPrices.length > 0) {
          const minPrice = Math.min(...allPrices.map((p) => p.price));
          const maxPrice = Math.max(...allPrices.map((p) => p.price));
          setDayMinPrice(minPrice);
          setDayMaxPrice(maxPrice);

          if (hasValidTimes) {
            const startHour = parseInt(session.startTime.split(":")[0], 10);
            const endHour = parseInt(session.endTime.split(":")[0], 10);

            const usedPrices = allPrices.filter((p) => {
              if (startHour <= endHour)
                return p.hour >= startHour && p.hour < endHour;
              return p.hour >= startHour || p.hour < endHour; // cruza medianoche
            });

            setPricesUsed(usedPrices);
          }
        }
      } catch (error) {
        console.error("Error loading prices for session detail:", error);
      }
    };

    loadPrices();
  }, [session, open, isFixedContract, isHomeSession, hasValidTimes]);

  // ✅ si cambias de sesión o cierras el sheet, cerramos también el diálogo
  useEffect(() => {
    if (!open) setConfirmDeleteOpen(false);
  }, [open]);

  if (!session) return null;

  const priceLevel = getPriceLevel(session.averagePrice);
  const levelColors = {
    low: "text-success border-success/30 bg-success/10",
    medium: "text-warning border-warning/30 bg-warning/10",
    high: "text-destructive border-destructive/30 bg-destructive/10",
  } as const;
  const levelLabels = {
    low: "Barato",
    medium: "Normal",
    high: "Caro",
  } as const;

  const hoursCharged = (() => {
    if (!hasValidTimes) return 0;

    const [startH, startM] = session.startTime.split(":").map(Number);
    const [endH, endM] = session.endTime.split(":").map(Number);

    let hours = endH - startH + (endM - startM) / 60;
    if (hours <= 0) hours += 24;

    return hours;
  })();

  const handleAskDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    setConfirmDeleteOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (!onDelete) return;

    onDelete(session.id);

    // cerrar confirm
    setConfirmDeleteOpen(false);

    // opcional: cerrar sheet
    if (closeOnDelete) onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader className="text-left pb-2">
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {format(session.date, "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* Session metadata badges */}
          <div className="flex flex-wrap items-center gap-2">
            {session.vehicleName && (
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <Car className="h-4 w-4" />
                {session.vehicleName}
              </div>
            )}
            {session.location && (
              <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {session.location}
              </div>
            )}
          </div>

          {/* Time and energy details */}
          <div className="grid grid-cols-2 gap-3">
            {hasValidTimes && (
              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3.5 w-3.5" />
                  Horario de carga
                </div>
                <p className="font-mono text-lg font-semibold text-foreground">
                  {session.startTime} - {session.endTime}
                </p>
              </div>
            )}

            {hoursCharged > 0 && (
              <div className="rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Timer className="h-3.5 w-3.5" />
                  Duración
                </div>
                <p className="font-mono text-lg font-semibold text-foreground">
                  {hoursCharged.toFixed(1)}h
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Battery className="h-3.5 w-3.5" />
                Energía cargada
              </div>
              <p className="font-mono text-lg font-semibold text-foreground">
                {session.kWhCharged.toFixed(2)} kWh
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Gauge className="h-3.5 w-3.5" />
                {isFixedContract ? "Precio fijo" : "Precio medio"}
              </div>
              <p className="font-mono text-lg font-semibold text-foreground">
                {(session.averagePrice * 100).toFixed(2)}¢/kWh
              </p>
            </div>
          </div>

          {/* Main cost display */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base text-muted-foreground">
                Coste total
              </span>
              <span className="font-mono text-3xl font-bold text-primary">
                {formatCurrency(session.totalCost)}
              </span>
            </div>

            {session.fuelSavings !== undefined && session.fuelSavings > 0 && (
              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <span className="text-sm text-muted-foreground">
                  Ahorro vs combustible
                </span>
                <div className="flex items-center gap-1.5 text-success font-semibold text-lg">
                  <TrendingDown className="h-4 w-4" />-
                  {formatCurrency(session.fuelSavings)}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <span className="text-sm text-muted-foreground">
                Nivel de precio del día
              </span>
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
                  levelColors[priceLevel],
                )}
              >
                <Zap className="h-4 w-4" />
                {levelLabels[priceLevel]}
              </div>
            </div>
          </div>

          {/* Hours used - PVPC home sessions */}
          {!isFixedContract && isHomeSession && pricesUsed.length > 0 && (
            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  Desglose de precios por hora
                </span>
                <span className="text-xs text-muted-foreground">
                  {pricesUsed.length} horas
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {pricesUsed.map((p) => (
                  <div
                    key={p.hour}
                    className={cn(
                      "rounded-lg bg-background px-3 py-2 text-center border",
                      p.price === dayMinPrice && "border-success/50",
                      p.price === dayMaxPrice && "border-destructive/50",
                      p.price !== dayMinPrice &&
                        p.price !== dayMaxPrice &&
                        "border-border",
                    )}
                  >
                    <p className="text-xs text-muted-foreground">
                      {p.hour.toString().padStart(2, "0")}:00
                    </p>
                    <p
                      className={cn(
                        "font-mono text-sm font-semibold",
                        getRelativePriceColor(
                          p.price,
                          dayMinPrice,
                          dayMaxPrice,
                        ),
                      )}
                    >
                      {(p.price * 100).toFixed(1)}¢
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete button */}
          {onDelete && (
            <Button
              onClick={handleAskDelete}
              type="button"
              variant="destructive"
              className={cn("w-full")}
              aria-label="Eliminar sesión"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </SheetContent>

      {/* ✅ Confirm interno */}
      {onDelete && (
        <ConfirmDeleteDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          onConfirm={handleDeleteConfirmed}
          title="¿Eliminar sesión de carga?"
          description="Esta acción no se puede deshacer. La sesión será eliminada permanentemente."
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      )}
    </Sheet>
  );
}
