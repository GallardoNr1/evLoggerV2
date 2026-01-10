import { useState, useEffect } from "react";
import SegmentedControl from "@/components/SegmentedControl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/useSettings";
import type { ElectricityContractType } from "@/hooks/useSettings";
import { toast } from "sonner";
import { Zap, Lock } from "lucide-react";

const CONTRACT_OPTIONS = [
  {
    value: "PVPC" as ElectricityContractType,
    name: "PVPC",
    description: "Precio variable por hora según mercado",
  },
  {
    value: "FIXED_SINGLE" as ElectricityContractType,
    name: "Precio fijo",
    description: "Mismo precio siempre (mercado libre)",
  },
];

export function ContractTypeSettings() {
  const { settings, loading, updateSettings } = useSettings();
  const [contractType, setContractType] =
    useState<ElectricityContractType>("PVPC");
  const [fixedPrice, setFixedPrice] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Solo sincronizar desde settings una vez al cargar
  useEffect(() => {
    if (settings && !isInitialized) {
      setContractType(settings.contractType);
      setFixedPrice(settings.fixedPricePerKwh?.toString() ?? "0.15");
      setIsInitialized(true);
    }
  }, [settings, isInitialized]);

  const handleContractTypeChange = async (value: string) => {
    const newType = value as ElectricityContractType;
    setContractType(newType);

    await updateSettings({
      contractType: newType,
      fixedPricePerKwh:
        newType === "FIXED_SINGLE" ? Number.parseFloat(fixedPrice) || 0.15 : null,
    });

    toast.success(
      newType === "PVPC"
        ? "Contrato PVPC seleccionado"
        : "Contrato de precio fijo seleccionado",
      {
        position: "top-center",
      },
    );
  };

  const handleFixedPriceChange = async (value: string) => {
    setFixedPrice(value);
    const numValue = Number.parseFloat(value);

    if (!Number.isNaN(numValue) && numValue > 0) {
      await updateSettings({
        fixedPricePerKwh: numValue,
      });
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
        <div className="h-6 w-40 bg-secondary rounded mb-4" />
        <div className="h-12 bg-secondary rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Tipo de contrato
      </h3>

      <div className="space-y-4">
        {/* Selector de tipo */}
        <div className="rounded-xl bg-secondary p-4 space-y-3">
          <Label className="font-medium text-foreground">
            Tipo de tarifa eléctrica
          </Label>
          <SegmentedControl
            options={CONTRACT_OPTIONS.map((o) => ({
              name: o.name,
              value: o.value,
            }))}
            value={contractType}
            onChange={handleContractTypeChange}
          />
        </div>

        {/* Info del tipo seleccionado */}
        <div
          className={`rounded-xl p-4 ${
            contractType === "PVPC"
              ? "bg-success/10 border border-success/30"
              : "bg-warning/10 border border-warning/30"
          }`}
        >
          <div className="flex items-start gap-3">
            {contractType === "PVPC" ? (
              <Zap className="h-5 w-5 text-success mt-0.5" />
            ) : (
              <Lock className="h-5 w-5 text-warning mt-0.5" />
            )}
            <div>
              <p
                className={`font-medium ${
                  contractType === "PVPC" ? "text-success" : "text-warning"
                }`}
              >
                {contractType === "PVPC"
                  ? "PVPC Regulado"
                  : "Precio Fijo (Mercado Libre)"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {contractType === "PVPC"
                  ? "El precio varía cada hora según el mercado eléctrico. Se usan los precios horarios reales de ESIOS/REE para calcular el coste de cada carga."
                  : "Tu comercializadora te factura siempre el mismo precio por kWh, sin importar la hora del día."}
              </p>
            </div>
          </div>
        </div>

        {/* Input precio fijo */}
        {contractType === "FIXED_SINGLE" && (
          <div className="rounded-xl bg-secondary p-4 space-y-3">
            <Label
              htmlFor="fixed-price"
              className="font-medium text-foreground"
            >
              Precio fijo por kWh
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="fixed-price"
                type="number"
                step="0.01"
                min="0.01"
                max="1"
                value={fixedPrice}
                onChange={(e) => handleFixedPriceChange(e.target.value)}
                className="text-right font-mono"
                placeholder="0.15"
              />
              <span className="text-muted-foreground font-medium">€/kWh</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Introduce el precio por kWh que aparece en tu contrato
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
