import { useState } from "react";
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
import { Plus, Car, Zap, Battery, Tag } from "lucide-react";
import { toast } from "sonner";
import type { CreateVehicleInput } from "@/hooks/useVehicles";

interface AddVehicleSheetProps {
  onAddVehicle: (vehicle: CreateVehicleInput) => Promise<string | void>;
  trigger?: React.ReactNode;
}

export const AddVehicleSheet = ({
  onAddVehicle,
  trigger,
}: AddVehicleSheetProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [consumption, setConsumption] = useState("");
  const [batteryCapacity, setBatteryCapacity] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = name.trim() && consumption && Number.parseFloat(consumption) > 0;

  const handleSubmit = async () => {
    if (!canSave) return;

    setSaving(true);
    try {
      await onAddVehicle({
        name: name.trim(),
        type: "EV",
        consumption: Number.parseFloat(consumption),
        batteryCapacity: batteryCapacity ? Number.parseFloat(batteryCapacity) : null,
        brand: brand.trim() || null,
        model: model.trim() || null,
        isFavorite: false,
      });

      toast.success("Vehículo añadido correctamente", {
        position: "top-center",
      });

      // Reset form
      setName("");
      setConsumption("");
      setBatteryCapacity("");
      setBrand("");
      setModel("");
      setOpen(false);
    } catch (err) {
      console.error("Error adding vehicle:", err);
      toast.error("Error al añadir el vehículo", {
        position: "top-center",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Añadir vehículo
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card pb-8"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Car className="h-5 w-5 text-primary" />
            Nuevo vehículo EV
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
            <p className="text-xs text-muted-foreground">
              Necesario para calcular km y ahorro
            </p>
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
            {saving ? "Guardando..." : "Guardar vehículo"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
