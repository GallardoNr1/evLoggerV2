/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ESIOSValue {
  value: number;
  datetime: string;
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
  hour: number;
  price: number;
  datetime: string;
  startsAt: string;
  endsAt: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('VITE_ESIOS_API_KEY')
    
    if (!apiKey) {
      console.error('ESIOS API key not configured')
      throw new Error('ESIOS API key not configured')
    }

    // Parse request body for date parameter
    let dateStr: string;
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        dateStr = body.date || new Date().toISOString().split('T')[0];
      } catch {
        dateStr = new Date().toISOString().split('T')[0];
      }
    } else {
      // GET request - use query params or today
      const url = new URL(req.url);
      dateStr = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    }
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    
    // PVPC indicator ID: 1001 (Precio voluntario para el pequeño consumidor)
    const url = `https://api.esios.ree.es/indicators/1001?start_date=${dateStr}T00:00&end_date=${dateStr}T23:59`
    
    console.log('Fetching PVPC prices from ESIOS API:', url)
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json; application/vnd.esios-api-v1+json',
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('ESIOS API error:', response.status, errorText)
      throw new Error(`ESIOS API error: ${response.status}`)
    }
    
    const data: ESIOSResponse = await response.json()
    console.log('Successfully fetched prices, entries:', data.indicator?.values?.length || 0)
    
    // Filter only Peninsula prices (geo_id: 8741) and transform
    const peninsulaValues = (data.indicator?.values || []).filter(
      (item) => item.geo_id === 8741
    )
    
    console.log('Filtered Peninsula prices:', peninsulaValues.length)
    
    const prices: PriceResult[] = peninsulaValues.map((item) => {
      const startsAt = new Date(item.datetime);
      const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000); // +1 hour
      
      // Extract hour from the original datetime string to preserve Spanish timezone
      // The API returns datetime like "2024-01-11T00:00:00.000+01:00"
      const hourMatch = item.datetime.match(/T(\d{2}):/);
      const hour = hourMatch ? parseInt(hourMatch[1], 10) : startsAt.getUTCHours();
      
      return {
        hour,
        price: item.value / 1000, // Convert from €/MWh to €/kWh
        datetime: item.datetime,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
      }
    }).sort((a, b) => a.hour - b.hour)
    
    return new Response(JSON.stringify({ 
      prices,
      date: dateStr,
      count: prices.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching prices:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})