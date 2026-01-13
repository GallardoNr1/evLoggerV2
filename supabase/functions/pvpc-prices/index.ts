/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

interface DbPrice {
  starts_at: string;
  ends_at: string;
  price_per_kwh: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    // First, check if prices exist in database for this date
    // We look for prices where starts_at is within the requested date (in Spanish timezone)
    const startOfDay = `${dateStr}T00:00:00+01:00`; // Spanish winter time
    const endOfDay = `${dateStr}T23:59:59+01:00`;
    
    console.log(`Checking database for prices on ${dateStr}`)
    
    const { data: existingPrices, error: dbError } = await supabase
      .from('electricity_prices')
      .select('starts_at, ends_at, price_per_kwh')
      .gte('starts_at', startOfDay)
      .lte('starts_at', endOfDay)
      .order('starts_at', { ascending: true })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // If we have 24 prices for the day, return them from database
    if (existingPrices && existingPrices.length >= 24) {
      console.log(`Found ${existingPrices.length} prices in database, returning cached data`)
      
      const prices: PriceResult[] = existingPrices.map((item: DbPrice) => {
        const startsAt = new Date(item.starts_at);
        // Extract hour from the starts_at timestamp in Spanish timezone
        const hourMatch = item.starts_at.match(/T(\d{2}):/);
        const hour = hourMatch ? parseInt(hourMatch[1], 10) : startsAt.getHours();
        
        return {
          hour,
          price: item.price_per_kwh,
          datetime: item.starts_at,
          startsAt: item.starts_at,
          endsAt: item.ends_at,
        }
      }).sort((a, b) => a.hour - b.hour);

      return new Response(JSON.stringify({ 
        prices,
        date: dateStr,
        count: prices.length,
        source: 'cache'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Prices not in database, fetch from ESIOS API
    console.log('Prices not found in database, fetching from ESIOS API')
    
    const apiKey = Deno.env.get('VITE_ESIOS_API_KEY')
    
    if (!apiKey) {
      console.error('ESIOS API key not configured')
      throw new Error('ESIOS API key not configured')
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

    if (peninsulaValues.length === 0) {
      return new Response(JSON.stringify({ 
        prices: [],
        date: dateStr,
        count: 0,
        source: 'api'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const prices: PriceResult[] = peninsulaValues.map((item) => {
      const startsAt = new Date(item.datetime);
      const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000); // +1 hour
      
      // Extract hour from the original datetime string to preserve Spanish timezone
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

    // Save prices to database for future requests
    console.log('Saving prices to database...')
    
    const pricesToInsert = prices.map(p => ({
      starts_at: p.startsAt,
      ends_at: p.endsAt,
      price_per_kwh: p.price,
      source: 'ESIOS',
      currency: 'EUR'
    }))

    const { error: insertError } = await supabase
      .from('electricity_prices')
      .upsert(pricesToInsert, { 
        onConflict: 'starts_at',
        ignoreDuplicates: true 
      })

    if (insertError) {
      console.error('Error saving prices to database:', insertError)
      // Continue anyway, we have the prices to return
    } else {
      console.log(`Saved ${pricesToInsert.length} prices to database`)
    }
    
    return new Response(JSON.stringify({ 
      prices,
      date: dateStr,
      count: prices.length,
      source: 'api'
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