import { HourlyPrice } from "@/types/evlogger";
import { getRelativePriceLevel } from "@/lib/priceUtils";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";

interface PriceChartProps {
  prices: HourlyPrice[];
  currentHour?: number;
}

export const PriceChart = ({ prices, currentHour }: PriceChartProps) => {
  const priceValues = prices.map(p => p.price);
  const minPriceEur = Math.min(...priceValues);
  const maxPriceEur = Math.max(...priceValues);

  const chartData = prices.map((p) => ({
    hour: `${p.hour}h`,
    price: p.price * 100, // Convert to cents for display
    isCurrent: currentHour !== undefined && p.hour === currentHour,
    priceLevel: getRelativePriceLevel(p.price, minPriceEur, maxPriceEur),
  }));

  const minPrice = minPriceEur * 100;
  const maxPrice = maxPriceEur * 100;

  // Find best hours (lowest prices)
  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
  const bestHours = sortedPrices.slice(0, 4).map(p => p.hour);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Precio por hora</h3>
          <p className="text-xs text-muted-foreground">Hoy • PVPC</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Bajo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">Medio</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Alto</span>
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="hour" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              interval={3}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              domain={[minPrice * 0.8, maxPrice * 1.1]}
              tickFormatter={(value) => `${value.toFixed(0)}¢`}
            />
            {currentHour !== undefined && (
              <ReferenceLine 
                x={`${currentHour}h`} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="3 3"
                strokeWidth={2}
              />
            )}
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Best hours recommendation */}
      <div className="mt-4 rounded-xl bg-success/10 p-3">
        <p className="text-xs text-success">
          <span className="font-semibold">💡 Mejores horas para cargar: </span>
          {bestHours.map((h, i) => (
            <span key={h}>
              {h}:00{i < bestHours.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};
