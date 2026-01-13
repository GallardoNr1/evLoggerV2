/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ESIOSValue {
  value: number;
  datetime: string; // "2026-01-12T00:00:00.000+01:00" (inicio del tramo)
  geo_id: number;
  geo_name: string;
}

interface ESIOSIndicator {
  values: ESIOSValue[];
}

interface ESIOSResponse {
  indicator: ESIOSIndicator;
}

interface PriceResult {
  hour: number; // 0..23 (inicio del tramo)
  price: number; // €/kWh
  datetime: string; // string original con offset
  startsAt: string; // string con offset (no UTC)
  endsAt: string; // string con offset (no UTC)
}

interface DbPrice {
  starts_at: string;
  ends_at: string;
  price_per_kwh: number;
}

/**
 * Extrae HH (00..23) del string ISO con offset.
 * No depende de la TZ del runtime.
 */
function extractHour(datetime: string): number {
  const hh = datetime.slice(11, 13);
  const n = Number(hh);
  return Number.isFinite(n) ? n : -1;
}

/**
 * Devuelve el offset del datetime tipo "+01:00" o "+02:00" o "Z".
 */
function extractOffset(datetime: string): string {
  const m = datetime.match(/([+-]\d{2}:\d{2}|Z)$/);
  return m ? m[1] : "+00:00";
}

/**
 * Construye endsAt sumando 1 hora manteniendo el offset del string de entrada.
 * (No usa TZ del runtime; usa el offset del propio string).
 */
function addOneHourKeepOffset(startsAt: string): string {
  // Formato esperado: YYYY-MM-DDTHH:mm:ss(.sss)?(+/-HH:MM|Z)
  const offset = extractOffset(startsAt);
  const base = startsAt.replace(/([+-]\d{2}:\d{2}|Z)$/, ""); // sin offset

  // base puede ser "2026-01-12T00:00:00.000" o "2026-01-12T00:00:00"
  const [datePart, timePart] = base.split("T");
  const hh = Number(timePart.slice(0, 2));
  const rest = timePart.slice(2); // ":00:00.000" etc.

  const nextH = (hh + 1) % 24;
  const nextDate =
    hh === 23
      ? (() => {
          // sumar 1 día a datePart (YYYY-MM-DD) sin TZ:
          const [y, m, d] = datePart.split("-").map(Number);
          const dt = new Date(y, m - 1, d);
          dt.setDate(dt.getDate() + 1);
          const yy = dt.getFullYear();
          const mm = String(dt.getMonth() + 1).padStart(2, "0");
          const dd = String(dt.getDate()).padStart(2, "0");
          return `${yy}-${mm}-${dd}`;
        })()
      : datePart;

  const nextTime = `${String(nextH).padStart(2, "0")}${rest}`;
  return `${nextDate}T${nextTime}${offset}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for date parameter
    let dateStr: string;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        dateStr = body.date || new Date().toISOString().split("T")[0];
      } catch {
        dateStr = new Date().toISOString().split("T")[0];
      }
    } else {
      const url = new URL(req.url);
      dateStr =
        url.searchParams.get("date") || new Date().toISOString().split("T")[0];
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    // ⚠️ Mejor no “hardcodear” +01:00 porque en verano es +02:00.
    // Para el cache lookup, usaremos rango en UTC del día local sería ideal,
    // pero como estás guardando con offset, aquí mantenemos el filtro simple:
    // buscamos por starts_at que empiece por `${dateStr}T`
    console.log(`Checking database for prices on ${dateStr}`);

    const { data: existingPrices, error: dbError } = await supabase
      .from("electricity_prices")
      .select("starts_at, ends_at, price_per_kwh")
      .like("starts_at", `${dateStr}T%`)
      .order("starts_at", { ascending: true });

    if (dbError) {
      console.error("Database error:", dbError);
    }

    if (existingPrices && existingPrices.length >= 24) {
      console.log(
        `Found ${existingPrices.length} prices in database, returning cached data`,
      );

      const prices: PriceResult[] = existingPrices
        .map((item: DbPrice) => {
          const hour = extractHour(item.starts_at); // ✅ siempre desde string
          return {
            hour,
            price: item.price_per_kwh,
            datetime: item.starts_at,
            startsAt: item.starts_at,
            endsAt: item.ends_at,
          };
        })
        .sort((a, b) => a.hour - b.hour);

      return new Response(
        JSON.stringify({
          prices,
          date: dateStr,
          count: prices.length,
          source: "cache",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Fetch from ESIOS
    console.log("Prices not found in database, fetching from ESIOS API");

    const apiKey = Deno.env.get("VITE_ESIOS_API_KEY");
    if (!apiKey) throw new Error("ESIOS API key not configured");

    const esiosUrl = `https://api.esios.ree.es/indicators/1001?start_date=${dateStr}T00:00&end_date=${dateStr}T23:59`;

    console.log("Fetching PVPC prices from ESIOS API:", esiosUrl);

    const response = await fetch(esiosUrl, {
      headers: {
        Accept: "application/json; application/vnd.esios-api-v1+json",
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ESIOS API error:", response.status, errorText);
      throw new Error(`ESIOS API error: ${response.status}`);
    }

    const data: ESIOSResponse = await response.json();

    const peninsulaValues = (data.indicator?.values || []).filter(
      (item) => item.geo_id === 8741,
    );

    console.log("Filtered Peninsula prices:", peninsulaValues.length);

    if (peninsulaValues.length === 0) {
      return new Response(
        JSON.stringify({
          prices: [],
          date: dateStr,
          count: 0,
          source: "api",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // ✅ FIX horas + guardado sin UTC
    const prices: PriceResult[] = peninsulaValues
      .map((item) => {
        // En indicador 1001, datetime es INICIO del tramo (tu dump incluye T00:00)
        const hour = extractHour(item.datetime);
        const startsAt = item.datetime; // ✅ mantener offset
        const endsAt = addOneHourKeepOffset(startsAt); // ✅ +1h manteniendo offset

        return {
          hour,
          price: item.value / 1000, // €/kWh
          datetime: item.datetime,
          startsAt,
          endsAt,
        };
      })
      .sort((a, b) => a.hour - b.hour);

    // Save to DB
    console.log("Saving prices to database...");

    const pricesToInsert = prices.map((p) => ({
      starts_at: p.startsAt, // ✅ con offset, no UTC
      ends_at: p.endsAt, // ✅ con offset
      price_per_kwh: p.price,
      source: "ESIOS",
      currency: "EUR",
    }));

    const { error: insertError } = await supabase
      .from("electricity_prices")
      .upsert(pricesToInsert, {
        onConflict: "starts_at",
        ignoreDuplicates: true,
      });

    if (insertError) {
      console.error("Error saving prices to database:", insertError);
    } else {
      console.log(`Saved ${pricesToInsert.length} prices to database`);
    }

    return new Response(
      JSON.stringify({
        prices,
        date: dateStr,
        count: prices.length,
        source: "api",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching prices:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
