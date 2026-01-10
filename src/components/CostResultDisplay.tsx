import { Loader2 } from "lucide-react";
import { type SessionCostResult } from "@/lib/sessionCostCalculator";
import { getRelativePriceColor } from "@/lib/priceUtils";
import { formatCurrency } from "@/lib/priceUtils";

interface CostResultDisplayProps {
  calculating: boolean;
  costError: string | null;
  costResult: SessionCostResult | null;
  isFixedContract: boolean;
}

export function CostResultDisplay({
  calculating,
  costError,
  costResult,
  isFixedContract,
}: CostResultDisplayProps) {
  if (calculating) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-secondary p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Calculando coste...
        </span>
      </div>
    );
  }

  if (costError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{costError}</p>
      </div>
    );
  }

  if (!costResult) {
    return null;
  }

  // Proteger contra NaN
  const safeBaseCost = isNaN(costResult.baseCost) ? 0 : costResult.baseCost;
  const safeDiscountedCost = isNaN(costResult.discountedCost) ? safeBaseCost : costResult.discountedCost;
  const hasDiscount = safeBaseCost > 0 && safeDiscountedCost < safeBaseCost;

  return (
    <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
      {/* Main cost display */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Coste total</span>
        <span className="font-mono text-2xl font-bold text-primary">
          {formatCurrency(safeDiscountedCost)}
        </span>
      </div>

      {/* Show base cost if there's a discount */}
      {hasDiscount && (
        <div className="flex items-center justify-between border-t border-border/50 pt-2">
          <span className="text-xs text-muted-foreground">Sin bono social</span>
          <span className="font-mono text-sm text-muted-foreground line-through">
            {formatCurrency(safeBaseCost)}
          </span>
        </div>
      )}

      {/* Price breakdown */}
      <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-2 text-xs">
        <div>
          <span className="text-muted-foreground">
            {isFixedContract ? "Precio fijo" : "Precio medio"}
          </span>
          <p className="font-mono font-medium text-foreground">
            {(costResult.averagePrice * 100).toFixed(2)}¢/kWh
          </p>
        </div>
        {!isFixedContract && costResult.hoursCharged > 0 && (
          <div>
            <span className="text-muted-foreground">Horas de carga</span>
            <p className="font-mono font-medium text-foreground">
              {costResult.hoursCharged.toFixed(1)}h
            </p>
          </div>
        )}
      </div>

      {/* Hours used - only for PVPC */}
      {!isFixedContract && costResult.pricesUsed.length > 0 && (
        <div className="border-t border-border/50 pt-2">
          <span className="text-xs text-muted-foreground">
            Precios usados ({costResult.pricesUsed.length} horas)
          </span>

          <div className="mt-1 flex flex-wrap gap-1">
            {costResult.pricesUsed.map((p) => (
              <span
                key={p.hour}
                className={`font-mono text-sm font-semibold ${getRelativePriceColor(
                  p.price,
                  costResult.dayMinPrice,
                  costResult.dayMaxPrice,
                )}`}
              >
                {p.hour.toString().padStart(2, "0")}h:{" "}
                {(p.price * 100).toFixed(1)}¢
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
