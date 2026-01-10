import { useRef, useEffect } from "react";
import { getRelativePriceColor } from "@/lib/priceUtils";
import type { HourlyPrice } from "@/types/evlogger";
import type { PriceDay } from "@/hooks/usePVPCPrices";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface PriceBreakdownListProps {
  prices: HourlyPrice[];
  currentHour: number;
  priceDay: PriceDay;
  minPrice: number;
  maxPrice: number;
}

const getBadgeClassName = (
  isCurrentHour: boolean,
  isPast: boolean,
  isYesterday: boolean,
): string => {
  if (isCurrentHour) {
    return "bg-primary/10 border border-primary/30";
  }
  if (isPast || isYesterday) {
    return "opacity-50";
  }
  return "hover:bg-secondary";
};

export const PriceBreakdownList = ({
  prices,
  currentHour,
  priceDay,
  minPrice,
  maxPrice,
}: PriceBreakdownListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentHourRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      priceDay === "today" &&
      currentHourRef.current &&
      containerRef.current
    ) {
      const container = containerRef.current;
      const element = currentHourRef.current;

      // Center the current hour in the visible area
      const containerHeight = container.clientHeight;
      const elementTop = element.offsetTop;
      const elementHeight = element.clientHeight;

      container.scrollTop =
        elementTop - containerHeight / 2 + elementHeight / 2;
    }
  }, [priceDay, prices]);

  return (
    <div
      ref={containerRef}
      className="max-h-64 space-y-1 overflow-y-auto scroll-smooth"
    >
      {prices.map((price) => {
        const isCurrentHour =
          priceDay === "today" && price.hour === currentHour;
        const isPast = priceDay === "today" && price.hour < currentHour;
        const isYesterday = priceDay === "yesterday";

        return (
          <Badge
            key={price.hour}
            variant="outline"
            ref={isCurrentHour ? currentHourRef : undefined}
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-2 transition-colors",
              getBadgeClassName(isCurrentHour, isPast, isYesterday),
            )}
          >
            <span className="text-sm text-muted-foreground">
              {price.hour.toString().padStart(2, "0")}:00
              {isCurrentHour && (
                <span className="ml-2 text-xs text-primary">• Ahora</span>
              )}
            </span>
            <span
              className={`font-mono text-sm font-semibold ${getRelativePriceColor(
                price.price,
                minPrice,
                maxPrice,
              )}`}
            >
              {(price.price * 100).toFixed(2)}¢/kWh
            </span>
          </Badge>
        );
      })}
    </div>
  );
};
