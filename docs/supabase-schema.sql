-- ============================================================
-- EVLogger - Esquema SQL para Supabase
-- Generado para migración desde SQLite local a Supabase Cloud
-- ============================================================

-- ============================================================
-- 1. FUNCIÓN AUXILIAR: Actualizar timestamps automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- 2. TABLA: profiles (perfil de usuario)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,                        -- URL del avatar en Storage
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. TABLA: vehicles (vehículos)
-- ============================================================
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'EV',
  consumption REAL NOT NULL,  -- kWh/100km
  
  brand TEXT,
  model TEXT,
  battery_capacity REAL,      -- kWh
  range_km INTEGER,
  year INTEGER,
  power_kw INTEGER,
  connector_type TEXT,
  efficiency_wh_km REAL,
  notes TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX idx_vehicles_is_favorite ON public.vehicles(is_favorite);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS para vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vehicles"
  ON public.vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
  ON public.vehicles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
  ON public.vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. TABLA: charge_sessions (sesiones de carga)
-- ============================================================
CREATE TABLE public.charge_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  kwh REAL NOT NULL,
  
  location TEXT DEFAULT 'Casa',          -- 'Casa' | 'Fuera'
  
  cost REAL,                             -- Coste final (deprecated, usar discounted_cost)
  base_cost REAL,                        -- Coste sin descuentos
  discounted_cost REAL,                  -- Coste con bono social aplicado
  average_price REAL,                    -- Precio medio €/kWh
  
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_charge_sessions_user_id ON public.charge_sessions(user_id);
CREATE INDEX idx_charge_sessions_vehicle_id ON public.charge_sessions(vehicle_id);
CREATE INDEX idx_charge_sessions_started_at ON public.charge_sessions(started_at);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_charge_sessions_updated_at
  BEFORE UPDATE ON public.charge_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS para charge_sessions
ALTER TABLE public.charge_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.charge_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.charge_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.charge_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.charge_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. TABLA: user_settings (configuración por usuario)
-- ============================================================
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contrato eléctrico
  contract_type TEXT NOT NULL DEFAULT 'PVPC',        -- 'PVPC' | 'FIXED_SINGLE'
  fixed_price_per_kwh REAL,                          -- Solo para FIXED_SINGLE
  
  -- Bono social
  has_social_bonus BOOLEAN NOT NULL DEFAULT false,
  social_bonus_type TEXT NOT NULL DEFAULT 'NONE',    -- 'NONE' | 'VULNERABLE' | 'SEVERE'
  social_bonus_discount_percent REAL NOT NULL DEFAULT 0,
  
  -- Comparativa combustible
  fuel_consumption_l100km REAL DEFAULT 7.0,
  fuel_price_per_liter REAL DEFAULT 1.55,
  show_fuel_savings BOOLEAN DEFAULT true,
  
  -- UI
  cost_view_mode TEXT NOT NULL DEFAULT 'SIMPLE',     -- 'SIMPLE' | 'DETAILED'
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS para user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Función para crear settings automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger para crear settings automáticamente
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_settings();

-- ============================================================
-- 6. TABLA: electricity_prices (precios PVPC - compartida/caché)
-- ============================================================
-- NOTA: Esta tabla es compartida entre usuarios (datos públicos de ESIOS)
-- No necesita user_id, pero sí RLS para lectura pública
CREATE TABLE public.electricity_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  price_per_kwh REAL NOT NULL,           -- €/kWh
  
  currency TEXT NOT NULL DEFAULT 'EUR',
  source TEXT NOT NULL DEFAULT 'ESIOS',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(starts_at, ends_at, source)
);

-- Índices
CREATE INDEX idx_electricity_prices_starts_at ON public.electricity_prices(starts_at);
CREATE INDEX idx_electricity_prices_source ON public.electricity_prices(source);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_electricity_prices_updated_at
  BEFORE UPDATE ON public.electricity_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS para electricity_prices (lectura pública, escritura solo desde Edge Functions)
ALTER TABLE public.electricity_prices ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer precios
CREATE POLICY "Authenticated users can view prices"
  ON public.electricity_prices FOR SELECT
  TO authenticated
  USING (true);

-- Solo service_role puede insertar/actualizar (Edge Functions)
CREATE POLICY "Service role can manage prices"
  ON public.electricity_prices FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 7. RESUMEN DE TABLAS Y RELACIONES
-- ============================================================
/*
  auth.users (Supabase Auth)
       │
       ├──► profiles (1:1)
       │
       ├──► user_settings (1:1)
       │
       ├──► vehicles (1:N)
       │         │
       │         └──► charge_sessions (1:N)
       │
       └──► electricity_prices (compartida, solo lectura)

  Flujo de registro:
  1. Usuario se registra → auth.users
  2. Trigger crea → profiles
  3. Trigger crea → user_settings (con defaults)
  4. Usuario añade → vehicles
  5. Usuario registra → charge_sessions
*/

-- ============================================================
-- 8. QUERIES DE EJEMPLO
-- ============================================================

-- Obtener todos los vehículos del usuario actual
-- SELECT * FROM vehicles WHERE user_id = auth.uid();

-- Obtener sesiones de carga del último mes
-- SELECT cs.*, v.name as vehicle_name
-- FROM charge_sessions cs
-- JOIN vehicles v ON cs.vehicle_id = v.id
-- WHERE cs.user_id = auth.uid()
--   AND cs.started_at >= now() - interval '1 month'
-- ORDER BY cs.started_at DESC;

-- Obtener configuración del usuario
-- SELECT * FROM user_settings WHERE user_id = auth.uid();

-- Obtener precios de hoy
-- SELECT * FROM electricity_prices
-- WHERE starts_at >= date_trunc('day', now())
--   AND starts_at < date_trunc('day', now()) + interval '1 day'
-- ORDER BY starts_at;
