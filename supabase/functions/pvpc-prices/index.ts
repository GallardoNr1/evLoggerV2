/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ESIOSValue {
  value: number; // €/MWh
  datetime: string; // e.g. "2026-01-12T00:00:00.000+01:00" (inicio del tramo)
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
  hour: number; // 0..23 (inicio del tramo en hora España)
  price: number; // €/kWh
  datetime: string; // datetime original con +01:00/+02:00
}

/**
 * Extrae HH (00..23) del string ISO con offset.
 * No depende de la TZ del runtime (que en Supabase suele ser UTC).
 */
function extractHour(datetime: string): number {
  const hh = datetime.slice(11, 13);
  const n = Number(hh);
  return Number.isFinite(n) ? n : -1;
}

function isValidDateStr(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

async function readDateStr(req: Request): Promise<string> {
  // POST: body.date, GET: query param date, fallback: hoy (UTC)
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const date = body?.date;
      if (typeof date === "string" && isValidDateStr(date)) return date;
    } catch {
      // ignore
    }
  } else {
    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    if (date && isValidDateStr(date)) return date;
  }

  // Fallback (hoy)
  return new Date().toISOString().split("T")[0];
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("VITE_ESIOS_API_KEY");
    if (!apiKey) throw new Error("ESIOS API key not configured");

    const dateStr = await readDateStr(req);
    if (!isValidDateStr(dateStr)) {
      return new Response(
        JSON.stringify({ error: "Invalid date format. Use YYYY-MM-DD" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const esiosUrl = `https://api.esios.ree.es/indicators/1001?start_date=${dateStr}T00:00&end_date=${dateStr}T23:59`;

    // --- LOGS mínimos útiles ---
    console.log("PVPC request:", {
      method: req.method,
      dateStr,
      esiosUrl,
      runtimeTZ: Deno.env.get("TZ") ?? "(not set)",
      nowISO: new Date().toISOString(),
    });

    const response = await fetch(esiosUrl, {
      headers: {
        Accept: "application/json; application/vnd.esios-api-v1+json",
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ESIOS API error:", { status: response.status, errorText });
      return new Response(
        JSON.stringify({ error: `ESIOS API error: ${response.status}` }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data: ESIOSResponse = await response.json();
    const all = data.indicator?.values ?? [];

    // Filtra Península (8741)
    const peninsula = all.filter((v) => v.geo_id === 8741);

    // Mapea: datetime es INICIO del tramo -> hour = HH del string
    const prices: PriceResult[] = peninsula
      .map((item) => {
        const hour = extractHour(item.datetime);

        return {
          hour,
          price: item.value / 1000, // €/kWh
          datetime: item.datetime,
        };
      })
      .filter((p) => p.hour >= 0 && p.hour <= 23)
      .sort((a, b) => a.hour - b.hour);

    // Logs de verificación (solo 3 items)
    console.log("PVPC peninsula summary:", {
      totalValues: all.length,
      peninsulaValues: peninsula.length,
      returned: prices.length,
      first3: prices.slice(0, 3),
      last3: prices.slice(-3),
    });

    return new Response(
      JSON.stringify({
        prices,
        date: dateStr,
        count: prices.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("PVPC function error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
