
-- ============================================================
-- Migración: Ajustar tablas a supabase-schema.sql
-- ============================================================

-- 1. USER_SETTINGS: Renombrar columnas y añadir nuevas
ALTER TABLE public.user_settings 
  RENAME COLUMN fixed_price TO fixed_price_per_kwh;

ALTER TABLE public.user_settings 
  RENAME COLUMN ice_consumption TO fuel_consumption_l100km;

ALTER TABLE public.user_settings 
  RENAME COLUMN fuel_price TO fuel_price_per_liter;

-- Cambiar social_bonus_discount a social_bonus_discount_percent (real)
ALTER TABLE public.user_settings 
  DROP COLUMN social_bonus_discount;

ALTER TABLE public.user_settings 
  ADD COLUMN social_bonus_discount_percent REAL NOT NULL DEFAULT 0;

-- Añadir columnas faltantes
ALTER TABLE public.user_settings 
  ADD COLUMN IF NOT EXISTS social_bonus_type TEXT NOT NULL DEFAULT 'NONE';

ALTER TABLE public.user_settings 
  ADD COLUMN IF NOT EXISTS show_fuel_savings BOOLEAN DEFAULT true;

ALTER TABLE public.user_settings 
  ADD COLUMN IF NOT EXISTS cost_view_mode TEXT NOT NULL DEFAULT 'SIMPLE';

-- 2. VEHICLES: Añadir columnas adicionales
ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS range_km INTEGER;

ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS year INTEGER;

ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS power_kw INTEGER;

ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS connector_type TEXT;

ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS efficiency_wh_km REAL;

ALTER TABLE public.vehicles 
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. CHARGE_SESSIONS: Añadir columnas de coste detallado
ALTER TABLE public.charge_sessions 
  ADD COLUMN IF NOT EXISTS base_cost REAL;

ALTER TABLE public.charge_sessions 
  ADD COLUMN IF NOT EXISTS discounted_cost REAL;

ALTER TABLE public.charge_sessions 
  ADD COLUMN IF NOT EXISTS average_price REAL;

-- Hacer vehicle_id NOT NULL con default handling
-- (no podemos cambiar a NOT NULL si hay datos nulos existentes)

-- 4. CREAR TABLA electricity_prices si no existe
CREATE TABLE IF NOT EXISTS public.electricity_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  price_per_kwh REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  source TEXT NOT NULL DEFAULT 'ESIOS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(starts_at, ends_at, source)
);

-- Índices para electricity_prices
CREATE INDEX IF NOT EXISTS idx_electricity_prices_starts_at ON public.electricity_prices(starts_at);
CREATE INDEX IF NOT EXISTS idx_electricity_prices_source ON public.electricity_prices(source);

-- RLS para electricity_prices
ALTER TABLE public.electricity_prices ENABLE ROW LEVEL SECURITY;

-- Políticas para electricity_prices (drop si existen antes de crear)
DROP POLICY IF EXISTS "Authenticated users can view prices" ON public.electricity_prices;
DROP POLICY IF EXISTS "Service role can manage prices" ON public.electricity_prices;

CREATE POLICY "Authenticated users can view prices"
  ON public.electricity_prices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage prices"
  ON public.electricity_prices FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger para electricity_prices
DROP TRIGGER IF EXISTS update_electricity_prices_updated_at ON public.electricity_prices;
CREATE TRIGGER update_electricity_prices_updated_at
  BEFORE UPDATE ON public.electricity_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
