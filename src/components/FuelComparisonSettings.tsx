import { useState, useEffect } from "react";
import { Fuel, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SliderToggle from "@/components/SliderToggle";
import { useSettings } from "@/hooks/useSettings";
import { toast } from "sonner";

export const FuelComparisonSettings = () => {
  const { settings, updateSettings } = useSettings();

  const [fuelConsumption, setFuelConsumption] = useState("7.0");
  const [fuelPrice, setFuelPrice] = useState("1.55");
  const [showSavings, setShowSavings] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Solo sincronizar desde settings una vez al cargar
  useEffect(() => {
    if (settings && !isInitialized) {
      setFuelConsumption(settings.fuelConsumptionL100km.toString());
      setFuelPrice(settings.fuelPricePerLiter.toString());
      setShowSavings(settings.showFuelSavings);
      setIsInitialized(true);
    }
  }, [settings, isInitialized]);

  const handleToggle = async (enabled: boolean) => {
    setShowSavings(enabled);
    await updateSettings({ showFuelSavings: enabled });
    toast.success(
      enabled ? "Comparación activada" : "Comparación desactivada",
      {
        position: "top-center",
      },
    );
  };

  const handleFuelConsumptionChange = async (value: string) => {
    setFuelConsumption(value);
    const num = Number.parseFloat(value);
    if (!Number.isNaN(num) && num > 0 && num <= 30) {
      await updateSettings({ fuelConsumptionL100km: num });
    }
  };

  const handleFuelPriceChange = async (value: string) => {
    setFuelPrice(value);
    const num = Number.parseFloat(value);
    if (!Number.isNaN(num) && num > 0 && num <= 5) {
      await updateSettings({ fuelPricePerLiter: num });
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-warning/10 p-2">
            <Fuel className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Comparación con combustible
            </h3>
            <p className="text-xs text-muted-foreground">
              Calcula cuánto ahorras vs. un coche de gasolina/diésel
            </p>
          </div>
        </div>
      </div>

      {/* Toggle para mostrar/ocultar ahorros */}
      <div className="mb-5 flex items-center justify-between rounded-xl bg-secondary p-4">
        <div className="flex items-center gap-3">
          <TrendingDown className="h-5 w-5 text-success" />
          <div>
            <p className="font-medium text-foreground">Mostrar ahorros</p>
            <p className="text-xs text-muted-foreground">
              Ver ahorro estimado en sesiones y estadísticas
            </p>
          </div>
        </div>
        <SliderToggle checked={showSavings} onChange={handleToggle} />
      </div>

      {showSavings && (
        <div className="space-y-4">
          {/* Consumo del vehículo de comparación */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Consumo del vehículo de combustión
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                min="3"
                max="20"
                value={fuelConsumption}
                onChange={(e) => handleFuelConsumptionChange(e.target.value)}
                className="w-24 text-center font-mono"
              />
              <span className="text-sm text-muted-foreground">L/100km</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Consumo medio del coche con el que comparar (ej: 7.0 para un
              compacto)
            </p>
          </div>

          {/* Precio del combustible */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Precio del combustible
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.01"
                min="0.5"
                max="3"
                value={fuelPrice}
                onChange={(e) => handleFuelPriceChange(e.target.value)}
                className="w-24 text-center font-mono"
              />
              <span className="text-sm text-muted-foreground">€/L</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Precio actual de gasolina o diésel en tu zona
            </p>
          </div>

          {/* Ejemplo de cálculo */}
          <div className="mt-4 rounded-xl bg-success/10 border border-success/20 p-4">
            <p className="text-sm text-success font-medium mb-1">
              Ejemplo de ahorro
            </p>
            <p className="text-xs text-muted-foreground">
              Con 50 kWh cargados (~330 km), un coche de {fuelConsumption}{" "}
              L/100km gastaría{" "}
              {(
                (330 / 100) *
                Number.parseFloat(fuelConsumption) *
                Number.parseFloat(fuelPrice)
              ).toFixed(2)}
              € en combustible vs. ~{(50 * 0.12).toFixed(2)}€ en electricidad.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
