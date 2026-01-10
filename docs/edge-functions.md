# EVLogger - Documentación de Edge Functions

## Resumen

| Función | Descripción | Secret requerido |
|---------|-------------|------------------|
| `pvpc-prices` | Proxy para API de ESIOS (precios PVPC) | `VITE_ESIOS_API_KEY` |

---

## 1. pvpc-prices

### Descripción
Proxy que obtiene los precios horarios de electricidad (PVPC) desde la API de ESIOS (Red Eléctrica de España).

### Endpoint
```
POST /functions/v1/pvpc-prices
GET  /functions/v1/pvpc-prices?date=YYYY-MM-DD
```

### Request

**POST Body:**
```json
{
  "date": "2024-01-15"  // Opcional, default: hoy
}
```

**GET Query:**
```
?date=2024-01-15
```

### Response
```json
{
  "prices": [
    {
      "hour": 0,
      "price": 0.12345,          // €/kWh
      "datetime": "2024-01-15T00:00:00.000Z",
      "startsAt": "2024-01-15T00:00:00.000Z",
      "endsAt": "2024-01-15T01:00:00.000Z"
    },
    // ... 24 horas
  ],
  "date": "2024-01-15",
  "count": 24
}
```

### Configuración requerida

#### Secret
```bash
# En Supabase Dashboard > Settings > Edge Functions > Secrets
VITE_ESIOS_API_KEY=tu_api_key_de_esios
```

**Obtener API Key de ESIOS:**
1. Ir a https://www.esios.ree.es/es
2. Registrarse como usuario
3. Solicitar token de API en el perfil

#### config.toml
```toml
project_id = "tu_project_id"

[functions.pvpc-prices]
verify_jwt = false
```

### Despliegue en Supabase propio

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Vincular proyecto
supabase link --project-ref TU_PROJECT_REF

# 4. Configurar secret
supabase secrets set VITE_ESIOS_API_KEY=tu_api_key

# 5. Desplegar función
supabase functions deploy pvpc-prices
```

### Código fuente

Ubicación: `supabase/functions/pvpc-prices/index.ts`

```typescript
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
      
      return {
        hour: startsAt.getHours(),
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
```

### Notas técnicas

- **Indicador ESIOS**: 1001 (PVPC)
- **Filtro geográfico**: `geo_id: 8741` (Península)
- **Conversión**: €/MWh → €/kWh (÷1000)
- **CORS**: Habilitado para todas las origenes
- **Métodos**: GET y POST soportados

---

## Llamar desde el frontend

```typescript
import { supabase } from "@/integrations/supabase/client";

// Opción 1: Usando supabase.functions.invoke
const { data, error } = await supabase.functions.invoke('pvpc-prices', {
  body: { date: '2024-01-15' }
});

// Opción 2: Fetch directo (para Supabase propio)
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/pvpc-prices?date=2024-01-15`,
  {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);
const data = await response.json();
```

---

## Migración a Supabase propio

1. Copia `supabase/functions/pvpc-prices/index.ts` a tu proyecto
2. Configura el secret `VITE_ESIOS_API_KEY`
3. Actualiza `config.toml` con tu `project_id`
4. Ejecuta `supabase functions deploy pvpc-prices`
5. Actualiza la URL en el frontend si no usas `supabase.functions.invoke`
