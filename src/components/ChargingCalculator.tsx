import { useState, useMemo } from "react";
import { Calculator, Battery, Clock, Zap, Gauge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useVehicles } from "@/hooks/useVehicles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ChargingCalculator = () => {
  const { vehicles } = useVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [batteryCapacity, setBatteryCapacity] = useState<number>(60); // kWh
  const [currentPercent, setCurrentPercent] = useState<number>(20);
  const [targetPercent, setTargetPercent] = useState<number>(80);
  const [hoursAvailable, setHoursAvailable] = useState<number>(8);
  const [voltage, setVoltage] = useState<number>(230); // Voltios

  // Común en España: monofásico 230V, trifásico 400V
  const [phases, setPhases] = useState<1 | 3>(1);

  const calculation = useMemo(() => {
    const percentToCharge = targetPercent - currentPercent;
    if (percentToCharge <= 0 || hoursAvailable <= 0 || batteryCapacity <= 0) {
      return null;
    }

    const kWhNeeded = (percentToCharge / 100) * batteryCapacity;
    const kWRequired = kWhNeeded / hoursAvailable;

    // Cálculo de amperios según fases
    // Monofásico: P = V × I × cosφ (cosφ ≈ 1 para carga EV)
    // Trifásico: P = √3 × V × I × cosφ
    let ampsRequired: number;
    if (phases === 1) {
      ampsRequired = (kWRequired * 1000) / voltage;
    } else {
      ampsRequired = (kWRequired * 1000) / (Math.sqrt(3) * voltage);
    }

    // Amperajes típicos de cargadores domésticos
    const standardAmps = [6, 8, 10, 13, 16, 20, 25, 32];
    const recommendedAmps =
      standardAmps.find((a) => a >= ampsRequired) ??
      standardAmps[standardAmps.length - 1];

    // Recalcular kW real con amperaje recomendado
    let actualKW: number;
    if (phases === 1) {
      actualKW = (recommendedAmps * voltage) / 1000;
    } else {
      actualKW = (Math.sqrt(3) * voltage * recommendedAmps) / 1000;
    }

    const actualHours = kWhNeeded / actualKW;

    return {
      kWhNeeded: kWhNeeded.toFixed(1),
      kWRequired: kWRequired.toFixed(2),
      ampsRequired: ampsRequired.toFixed(1),
      recommendedAmps,
      actualKW: actualKW.toFixed(2),
      actualHours: actualHours.toFixed(1),
      willFinishOnTime: actualHours <= hoursAvailable,
    };
  }, [
    currentPercent,
    targetPercent,
    hoursAvailable,
    batteryCapacity,
    voltage,
    phases,
  ]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Calculadora de carga</h3>
      </div>

      <div className="space-y-4">
        {/* Vehículo / Capacidad batería */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Capacidad batería (kWh)
          </Label>
          <div className="flex gap-2">
            {vehicles.length > 0 && (
              <Select
                value={selectedVehicleId}
                onValueChange={(id) => {
                  setSelectedVehicleId(id);
                  // Si tuviéramos capacidad de batería por vehículo, la setearíamos aquí
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecciona vehículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input
              type="number"
              value={batteryCapacity}
              onChange={(e) => setBatteryCapacity(Number(e.target.value))}
              className="w-24"
              min={10}
              max={200}
            />
          </div>
        </div>

        {/* Porcentaje actual */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm text-muted-foreground">
              Batería actual
            </Label>
            <span className="text-sm font-medium text-foreground">
              {currentPercent}%
            </span>
          </div>
          <Slider
            value={[currentPercent]}
            onValueChange={([val]) => setCurrentPercent(val)}
            min={0}
            max={100}
            step={1}
            className="py-2"
          />
        </div>

        {/* Porcentaje objetivo */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm text-muted-foreground">Objetivo</Label>
            <span className="text-sm font-medium text-foreground">
              {targetPercent}%
            </span>
          </div>
          <Slider
            value={[targetPercent]}
            onValueChange={([val]) => setTargetPercent(val)}
            min={0}
            max={100}
            step={1}
            className="py-2"
          />
        </div>

        {/* Horas disponibles */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm text-muted-foreground">
              Horas disponibles
            </Label>
            <span className="text-sm font-medium text-foreground">
              {hoursAvailable}h
            </span>
          </div>
          <Slider
            value={[hoursAvailable]}
            onValueChange={([val]) => setHoursAvailable(val)}
            min={1}
            max={24}
            step={0.5}
            className="py-2"
          />
        </div>

        {/* Configuración eléctrica */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Voltaje</Label>
            <Select
              value={voltage.toString()}
              onValueChange={(v) => setVoltage(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="230">230V (Monofásico)</SelectItem>
                <SelectItem value="400">400V (Trifásico)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Fases</Label>
            <Select
              value={phases.toString()}
              onValueChange={(v) => setPhases(Number(v) as 1 | 3)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Monofásico</SelectItem>
                <SelectItem value="3">Trifásico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resultados */}
        {calculation && (
          <div className="mt-4 rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Resultado
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-background p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Battery className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    kWh a cargar
                  </span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {calculation.kWhNeeded}
                </p>
              </div>

              <div className="rounded-lg bg-background p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    kW necesarios
                  </span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {calculation.kWRequired}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-success/10 border border-success/30 p-3">
              <p className="text-sm text-muted-foreground mb-1">
                Configuración recomendada
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-success">
                    {calculation.recommendedAmps}A
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({calculation.actualKW} kW)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{calculation.actualHours}h</span>
                </div>
              </div>
              {!calculation.willFinishOnTime && (
                <p className="mt-2 text-xs text-warning">
                  ⚠️ Con {calculation.recommendedAmps}A tardará más de las{" "}
                  {hoursAvailable}h disponibles
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              * Cálculo mínimo requerido: {calculation.ampsRequired}A a{" "}
              {voltage}V {phases === 1 ? "monofásico" : "trifásico"}
            </p>
          </div>
        )}

        {!calculation && currentPercent >= targetPercent && (
          <div className="mt-4 rounded-xl bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              El porcentaje objetivo debe ser mayor que el actual
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
