import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Zap,
  Clock,
  Battery,
  MapPin,
  Calendar,
  Loader2,
  Euro,
  Car,
  Home,
  Plug,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateSessionCost,
  type SessionCostResult,
} from "@/lib/sessionCostCalculator";
import { useSettings } from "@/hooks/useSettings";
import { useVehicles } from "@/hooks/useVehicles";
import { toast } from "sonner";
import { CostResultDisplay } from "@/components/CostResultDisplay";
import { formatCurrency } from "@/lib/priceUtils";

const getLocationHelpText = (
  isHome: boolean,
  isFixedContract: boolean,
  fixedPricePerKwh?: number,
): string => {
  if (!isHome) {
    return "Introduce el coste que has pagado";
  }
  if (isFixedContract) {
    return `Coste calculado con tarifa fija (${(
      (fixedPricePerKwh ?? 0) * 100
    ).toFixed(2)}¢/kWh)`;
  }
  return "El coste se calculará automáticamente con precios PVPC";
};

interface SubmitButtonContentProps {
  saving: boolean;
  calculating: boolean;
}

const SubmitButtonContent = ({
  saving,
  calculating,
}: SubmitButtonContentProps) => {
  if (saving) {
    return (
      <>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Guardando...
      </>
    );
  }
  if (calculating) {
    return (
      <>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Calculando...
      </>
    );
  }
  return <>Guardar sesión</>;
};

interface AddSessionSheetProps {
  onAddSession?: (session: {
    date: string;
    startTime: string;
    endTime: string;
    kWhCharged: number;
    location: string;
    baseCost: number;
    discountedCost: number;
    averagePrice: number;
    vehicleId: string;
  }) => Promise<void>;
}

export const AddSessionSheet = ({ onAddSession }: AddSessionSheetProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [kWh, setKWh] = useState("");
  const [location, setLocation] = useState<"Casa" | "Fuera">("Casa");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [manualCost, setManualCost] = useState("");

  const [costResult, setCostResult] = useState<SessionCostResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [costError, setCostError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { settings } = useSettings();
  const { vehicles, favoriteVehicle, refresh: refreshVehicles } = useVehicles();

  // Determinar si es tarifa fija (no necesita horas)
  const isFixedContract = settings?.contractType === "FIXED_SINGLE";

  // Refresh vehicles when sheet opens
  useEffect(() => {
    if (open) {
      refreshVehicles();
    }
  }, [open, refreshVehicles]);

  // Set favorite vehicle as default when available
  useEffect(() => {
    if (!vehicleId && favoriteVehicle) {
      setVehicleId(favoriteVehicle.id);
    }
  }, [vehicleId, favoriteVehicle]);

  const isHome = location === "Casa";

  // Helper para determinar si se puede calcular el coste
  const checkCanCalculate = (): boolean => {
    const hasValidKwh =
      !!date && !!kWh && Number.parseFloat(kWh) > 0 && !!vehicleId;

    if (!isHome) {
      // Fuera de casa: necesitamos coste manual
      return hasValidKwh && !!manualCost && Number.parseFloat(manualCost) > 0;
    }

    if (isFixedContract) {
      // Tarifa fija: solo fecha, kWh y vehículo
      return hasValidKwh;
    }

    // PVPC: también necesitamos horas
    return hasValidKwh && !!startTime && !!endTime;
  };

  const canCalculate = checkCanCalculate();

  // Calcular coste cuando cambian los parámetros
  const calculateCost = useCallback(async () => {
    if (!canCalculate) {
      setCostResult(null);
      setCostError(null);
      return;
    }

    setCalculating(true);
    setCostError(null);

    try {
      const result = await calculateSessionCost(
        startTime,
        endTime,
        date,
        Number.parseFloat(kWh),
        settings,
      );
      setCostResult(result);
    } catch (err) {
      console.error("Error calculating cost:", err);
      setCostError(
        err instanceof Error ? err.message : "Error al calcular coste",
      );
      setCostResult(null);
    } finally {
      setCalculating(false);
    }
  }, [canCalculate, startTime, endTime, date, kWh, settings]);

  // Debounce del cálculo
  useEffect(() => {
    const timeout = setTimeout(() => {
      calculateCost();
    }, 500);

    return () => clearTimeout(timeout);
  }, [calculateCost]);

  const handleSubmit = async () => {
    const canSubmit = isHome
      ? canCalculate && costResult && vehicleId
      : canCalculate && vehicleId;

    if (!canSubmit || saving) return;

    setSaving(true);
    try {
      const kWhValue = Number.parseFloat(kWh);
      const cost = isHome
        ? costResult!.discountedCost
        : Number.parseFloat(manualCost);
      const avgPrice = isHome ? costResult!.averagePrice : cost / kWhValue;

      await onAddSession?.({
        date,
        startTime: isHome ? startTime : "",
        endTime: isHome ? endTime : "",
        kWhCharged: kWhValue,
        location,
        baseCost: isHome ? costResult!.baseCost : cost,
        discountedCost: cost,
        averagePrice: avgPrice,
        vehicleId,
      });

      toast.success("Sesión guardada correctamente", {
        position: "top-center",
      });

      // Reset form
      setDate(new Date().toISOString().split("T")[0]);
      setStartTime("");
      setEndTime("");
      setKWh("");
      setManualCost("");
      setLocation("Casa");
      setVehicleId(favoriteVehicle?.id || "");
      setCostResult(null);
      setOpen(false);
    } catch (err) {
      console.error("Error saving session:", err);
      toast.error("Error al guardar la sesión", {
        position: "top-center",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="glow"
          size="lg"
          className="h-12 w-12 rounded-full p-0 shadow-lg flex-none"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card pb-8"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-primary" />
            Nueva sesión de carga
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Vehicle selector */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Car className="h-4 w-4" />
              Vehículo *
            </Label>
            {vehicles.length === 0 ? (
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-center">
                <p className="text-sm text-warning">
                  No hay vehículos configurados
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Añade un vehículo en Ajustes primero
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {vehicles.map((v) => (
                  <Button
                    key={v.id}
                    variant={vehicleId === v.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVehicleId(v.id)}
                    className={cn(
                      "relative",
                      vehicleId === v.id &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background",
                    )}
                  >
                    <Car className="h-4 w-4" />
                    {v.name}
                    {v.isFavorite && <Star className="h-3 w-3 fill-current" />}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Date input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Fecha de la carga
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="h-12 rounded-xl border-border bg-secondary text-center font-mono text-lg"
            />
          </div>

          {/* Location toggle */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Ubicación
            </Label>
            <div className="flex gap-2">
              <Button
                variant={location === "Casa" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setLocation("Casa")}
              >
                <Home className="h-4 w-4" />
                Casa
              </Button>
              <Button
                variant={location === "Fuera" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setLocation("Fuera")}
              >
                <Plug className="h-4 w-4" />
                Fuera
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {getLocationHelpText(
                isHome,
                isFixedContract,
                settings?.fixedPricePerKwh,
              )}
            </p>
          </div>

          {/* Time inputs - only for home charging with PVPC (not fixed price) */}
          {isHome && !isFixedContract && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Inicio
                </Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-12 rounded-xl border-border bg-secondary text-center font-mono text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Fin
                </Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-12 rounded-xl border-border bg-secondary text-center font-mono text-lg"
                />
              </div>
            </div>
          )}

          {/* kWh input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Battery className="h-4 w-4" />
              Energía cargada
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.0"
                value={kWh}
                onChange={(e) => setKWh(e.target.value)}
                className="h-14 rounded-xl border-border bg-secondary pr-16 text-center font-mono text-2xl"
                step="0.1"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                kWh
              </span>
            </div>
          </div>

          {/* Manual cost input - only for outside charging */}
          {!isHome && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Euro className="h-4 w-4" />
                Coste pagado
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={manualCost}
                  onChange={(e) => setManualCost(e.target.value)}
                  className="h-14 rounded-xl border-border bg-secondary pr-12 text-center font-mono text-2xl"
                  step="0.01"
                  min="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  €
                </span>
              </div>
            </div>
          )}

          {/* Cost calculation result - only for home charging */}
          {isHome && canCalculate && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Euro className="h-4 w-4" />
                Coste estimado
              </Label>

              <CostResultDisplay
                calculating={calculating}
                costError={costError}
                costResult={costResult}
                isFixedContract={isFixedContract}
              />
            </div>
          )}

          {/* Submit button */}
          <Button
            variant="glow"
            size="xl"
            className="w-full"
            onClick={handleSubmit}
            disabled={
              !canCalculate || (isHome && !costResult) || calculating || saving
            }
          >
            <SubmitButtonContent saving={saving} calculating={calculating} />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
