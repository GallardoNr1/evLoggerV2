import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Zap, Battery, Tag } from "lucide-react";
import { toast } from "sonner";
import type { Vehicle, CreateVehicleInput } from "@/hooks/useVehicles";

interface EditVehicleSheetProps {
  vehicle: Vehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditVehicle: (id: string, patch: Partial<CreateVehicleInput>) => Promise<void>;
}

export const EditVehicleSheet = ({
  vehicle,
  open,
  onOpenChange,
  onEditVehicle,
}: EditVehicleSheetProps) => {
  const [name, setName] = useState(vehicle.name);
  const [consumption, setConsumption] = useState(vehicle.consumption.toString());
  const [batteryCapacity, setBatteryCapacity] = useState(
    vehicle.batteryCapacity?.toString() || ""
  );
  const [brand, setBrand] = useState(vehicle.brand || "");
  const [model, setModel] = useState(vehicle.model || "");
  const [saving, setSaving] = useState(false);

  // Reset form when vehicle changes or sheet opens
  useEffect(() => {
    if (open) {
      setName(vehicle.name);
      setConsumption(vehicle.consumption.toString());
      setBatteryCapacity(vehicle.batteryCapacity?.toString() || "");
      setBrand(vehicle.brand || "");
      setModel(vehicle.model || "");
    }
  }, [open, vehicle]);

  const canSave = name.trim() && consumption && Number.parseFloat(consumption) > 0;

  const handleSubmit = async () => {
    if (!canSave) return;

    setSaving(true);
    try {
      await onEditVehicle(vehicle.id, {
        name: name.trim(),
        consumption: Number.parseFloat(consumption),
        batteryCapacity: batteryCapacity ? Number.parseFloat(batteryCapacity) : null,
        brand: brand.trim() || null,
        model: model.trim() || null,
      });

      toast.success("Vehículo actualizado", {
        position: "top-center",
      });

      onOpenChange(false);
    } catch (err) {
      console.error("Error editing vehicle:", err);
      toast.error("Error al actualizar el vehículo", {
        position: "top-center",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card pb-8"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Car className="h-5 w-5 text-primary" />
            Editar vehículo
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Nombre */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-4 w-4" />
              Nombre del vehículo *
            </Label>
            <Input
              placeholder="Ej: Mi Tesla, Ioniq 5..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl border-border bg-secondary text-lg"
            />
          </div>

          {/* Consumo */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-4 w-4" />
              Consumo medio *
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="15"
                value={consumption}
                onChange={(e) => setConsumption(e.target.value)}
                className="h-14 rounded-xl border-border bg-secondary pr-24 text-center font-mono text-2xl"
                step="0.1"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                kWh/100km
              </span>
            </div>
          </div>

          {/* Capacidad batería */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Battery className="h-4 w-4" />
              Capacidad batería (opcional)
            </Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="60"
                value={batteryCapacity}
                onChange={(e) => setBatteryCapacity(e.target.value)}
                className="h-12 rounded-xl border-border bg-secondary pr-16 text-center font-mono text-lg"
                step="0.1"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                kWh
              </span>
            </div>
          </div>

          {/* Marca y modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Marca</Label>
              <Input
                placeholder="Tesla"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="h-12 rounded-xl border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Modelo</Label>
              <Input
                placeholder="Model 3"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="h-12 rounded-xl border-border bg-secondary"
              />
            </div>
          </div>

          {/* Submit button */}
          <Button
            variant="glow"
            size="xl"
            className="w-full"
            onClick={handleSubmit}
            disabled={!canSave || saving}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
