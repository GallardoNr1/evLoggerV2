import { useState, useEffect, useMemo } from "react";
import SliderToggle from "@/components/SliderToggle";
import DiscountSlider from "@/components/DiscountSlider";
import SegmentedControl from "@/components/SegmentedControl";
import { Label } from "@/components/ui/label";
import { useSettings, type SocialBonusType } from "@/hooks/useSettings";
import { toast } from "sonner";

// Límites de descuento por tipo de bono social
const BONUS_OPTIONS: {
  value: SocialBonusType;
  label: string;
  defaultDiscount: number;
  minDiscount: number;
  maxDiscount: number;
}[] = [
  {
    value: "NONE",
    label: "Sin bono social",
    defaultDiscount: 0,
    minDiscount: 0,
    maxDiscount: 0,
  },
  {
    value: "VULNERABLE",
    label: "Consumidor vulnerable",
    defaultDiscount: 25,
    minDiscount: 20,
    maxDiscount: 30,
  },
  {
    value: "VULNERABLE_SEVERE",
    label: "Vulnerable severo",
    defaultDiscount: 40,
    minDiscount: 35,
    maxDiscount: 50,
  },
  {
    value: "EXCLUSION_RISK",
    label: "Riesgo de exclusión social",
    defaultDiscount: 40,
    minDiscount: 35,
    maxDiscount: 50,
  },
];

export function SocialBonusSettings() {
  const { settings, loading, updateSettings } = useSettings();
  const [hasSocialBonus, setHasSocialBonus] = useState(false);
  const [bonusType, setBonusType] = useState<SocialBonusType>("NONE");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Solo sincronizar desde settings una vez al cargar, no en cada cambio
  useEffect(() => {
    if (settings && !isInitialized) {
      setHasSocialBonus(settings.hasSocialBonus);
      setBonusType(settings.socialBonusType);
      const discount = settings.socialBonusDiscountPercent;
      setDiscountPercent(isNaN(discount) || discount === null || discount === undefined ? 0 : discount);
      setIsInitialized(true);
    }
  }, [settings, isInitialized]);

  const handleToggleBonus = async (checked: boolean) => {
    setHasSocialBonus(checked);
    if (!checked) {
      setBonusType("NONE");
      setDiscountPercent(0);
      await updateSettings({
        hasSocialBonus: false,
        socialBonusType: "NONE",
        socialBonusDiscountPercent: 0,
      });
      toast.success("Bono social desactivado", {
        position: "top-center",
      });
    }
  };

  const handleBonusTypeChange = async (value: SocialBonusType) => {
    setBonusType(value);
    const option = BONUS_OPTIONS.find((o) => o.value === value);
    const newDiscount = option?.defaultDiscount ?? 0;
    setDiscountPercent(newDiscount);

    await updateSettings({
      hasSocialBonus: true,
      socialBonusType: value,
      socialBonusDiscountPercent: newDiscount,
    });
    toast.success("Tipo de bono social actualizado", {
      position: "top-center",
    });
  };

  const handleDiscountChange = async (value: number) => {
    setDiscountPercent(value);

    await updateSettings({
      socialBonusDiscountPercent: value,
    });
  };

  // Obtener límites del slider según tipo de bono
  const sliderLimits = useMemo(() => {
    const option = BONUS_OPTIONS.find((o) => o.value === bonusType);
    return {
      min: option?.minDiscount ?? 0,
      max: option?.maxDiscount ?? 100,
    };
  }, [bonusType]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
        <div className="h-6 w-32 bg-secondary rounded mb-4" />
        <div className="h-12 bg-secondary rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Bono Social
      </h3>

      <div className="space-y-4">
        {/* Toggle bono social */}
        <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
          <div className="flex-1">
            <Label
              htmlFor="social-bonus"
              className="font-medium text-foreground"
            >
              Tengo bono social
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Descuento en la factura eléctrica
            </p>
          </div>
          <SliderToggle
            id="social-bonus"
            checked={hasSocialBonus}
            onChange={handleToggleBonus}
          />
        </div>

        {/* Tipo de bono */}
        {hasSocialBonus && (
          <>
            <div className="rounded-xl bg-secondary p-4 space-y-3">
              <Label className="font-medium text-foreground">
                Tipo de bono social
              </Label>
              <SegmentedControl
                options={[
                  { name: "Vulnerable", value: "VULNERABLE" },
                  { name: "Severo", value: "VULNERABLE_SEVERE" },
                  { name: "Exclusión", value: "EXCLUSION_RISK" },
                ]}
                value={bonusType}
                onChange={(val) =>
                  handleBonusTypeChange(val as SocialBonusType)
                }
              />
            </div>

            {/* Porcentaje de descuento con slider */}
            <div className="rounded-xl bg-secondary p-4 space-y-2">
              <DiscountSlider
                label="Porcentaje de descuento"
                min={sliderLimits.min}
                max={sliderLimits.max}
                value={discountPercent}
                onChange={handleDiscountChange}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Se aplicará este descuento al calcular el coste de las cargas
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
