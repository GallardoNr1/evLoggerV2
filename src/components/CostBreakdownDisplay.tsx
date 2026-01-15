import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/priceUtils';
import { type CostBreakdown, ELECTRICITY_TAX_RATE, IVA_RATE } from '@/lib/costCalculator';
import { Receipt, Percent, Calculator } from 'lucide-react';

interface CostBreakdownDisplayProps {
  breakdown: CostBreakdown;
  hasSocialBonus: boolean;
  className?: string;
}

export function CostBreakdownDisplay({
  breakdown,
  hasSocialBonus,
  className,
}: CostBreakdownDisplayProps) {
  const electricityTaxPercent = (ELECTRICITY_TAX_RATE * 100).toFixed(2);
  const ivaPercent = (IVA_RATE * 100).toFixed(0);

  return (
    <div className={cn('rounded-xl border border-border bg-secondary/30 p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Desglose de costes</span>
      </div>

      <div className="space-y-2 text-sm">
        {/* Coste base de energía */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Coste energía</span>
          <span className="font-mono text-foreground">{formatCurrency(breakdown.baseCost)}</span>
        </div>

        {/* Bono social (si aplica) */}
        {hasSocialBonus && breakdown.bonusDiscount > 0 && (
          <div className="flex items-center justify-between text-success">
            <span className="flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Bono social
            </span>
            <span className="font-mono">-{formatCurrency(breakdown.bonusDiscount)}</span>
          </div>
        )}

        {/* Subtotal tras bono */}
        {hasSocialBonus && breakdown.bonusDiscount > 0 && (
          <div className="flex items-center justify-between border-t border-border/50 pt-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono text-foreground">{formatCurrency(breakdown.costAfterBonus)}</span>
          </div>
        )}

        {/* Impuesto electricidad */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            Imp. electricidad ({electricityTaxPercent}%)
          </span>
          <span className="font-mono text-foreground">{formatCurrency(breakdown.electricityTax)}</span>
        </div>

        {/* IVA */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">IVA ({ivaPercent}%)</span>
          <span className="font-mono text-foreground">{formatCurrency(breakdown.iva)}</span>
        </div>

        {/* Total final */}
        <div className="flex items-center justify-between border-t border-primary/30 pt-2 mt-2">
          <span className="font-medium text-foreground flex items-center gap-1">
            <Calculator className="h-3.5 w-3.5 text-primary" />
            Total con impuestos
          </span>
          <span className="font-mono font-bold text-primary text-base">
            {formatCurrency(breakdown.totalCost)}
          </span>
        </div>
      </div>
    </div>
  );
}
