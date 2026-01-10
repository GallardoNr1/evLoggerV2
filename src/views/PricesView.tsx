import { Loader2 } from "lucide-react";
import SegmentedControl from "@/components/SegmentedControl";
import { CurrentPriceCard } from "@/components/CurrentPriceCard";
import { PriceChart } from "@/components/PriceChart";
import { PriceBreakdownList } from "@/components/PriceBreakdownList";
import type { HourlyPrice } from "@/types/evlogger";
import type { PriceDay } from "@/hooks/usePVPCPrices";

interface PricesViewProps {
  priceDay: PriceDay;
  onPriceDayChange: (day: PriceDay) => void;
  tomorrowAvailable: boolean;
  pricesLoading: boolean;
  pricesError: Error | null;
  prices: HourlyPrice[];
  currentHour: number;
  currentPrice: HourlyPrice;
  nextPrice?: HourlyPrice;
  minPrice: number;
  maxPrice: number;
}

export const PricesView = ({
  priceDay,
  onPriceDayChange,
  tomorrowAvailable,
  pricesLoading,
  pricesError,
  prices,
  currentHour,
  currentPrice,
  nextPrice,
  minPrice,
  maxPrice,
}: PricesViewProps) => {
  return (
    <>
      {/* Day selector */}
      <section className="animate-fade-in">
        <SegmentedControl
          options={[
            { name: "Ayer", value: "yesterday" },
            { name: "Hoy", value: "today" },
            {
              name: "Mañana",
              value: "tomorrow",
              disabled: !tomorrowAvailable,
              disabledToast: "Precios no disponibles!!",
            },
          ]}
          value={priceDay}
          onChange={(val) => onPriceDayChange(val as PriceDay)}
        />
        {!tomorrowAvailable && priceDay === "today" && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Los precios de mañana se publican sobre las 20:30h
          </p>
        )}
      </section>

      {/* Current price - only show for today */}
      {priceDay === "today" && (
        <section className="animate-fade-in">
          {pricesLoading ? (
            <div className="flex items-center justify-center rounded-3xl border border-border bg-card p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">
                Cargando precios PVPC...
              </span>
            </div>
          ) : (
            <CurrentPriceCard
              currentPrice={currentPrice}
              nextPrice={nextPrice}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          )}
        </section>
      )}

      {/* Loading state for other days */}
      {priceDay !== "today" && pricesLoading && (
        <section className="animate-fade-in">
          <div className="flex items-center justify-center rounded-3xl border border-border bg-card p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Cargando precios de{" "}
              {priceDay === "yesterday" ? "ayer" : "mañana"}...
            </span>
          </div>
        </section>
      )}

      {/* Error state */}
      {pricesError && (
        <section className="animate-fade-in">
          <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">
              Error al cargar precios: {pricesError.message}
            </p>
          </div>
        </section>
      )}

      {/* Full price chart */}
      <section
        className="animate-fade-in"
        style={{ animationDelay: "100ms" }}
      >
        {!pricesLoading && prices.length > 0 && (
          <PriceChart
            prices={prices}
            currentHour={priceDay === "today" ? currentHour : undefined}
          />
        )}
      </section>

      {/* Price breakdown list */}
      {!pricesLoading && prices.length > 0 && (
        <section
          className="animate-fade-in rounded-2xl border border-border bg-card p-4"
          style={{ animationDelay: "200ms" }}
        >
          <h3 className="mb-3 font-semibold text-foreground">
            Desglose por hora{" "}
            {priceDay === "yesterday"
              ? "(ayer)"
              : priceDay === "tomorrow"
              ? "(mañana)"
              : ""}
          </h3>
          <PriceBreakdownList
            prices={prices}
            currentHour={currentHour}
            priceDay={priceDay}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </section>
      )}
    </>
  );
};
