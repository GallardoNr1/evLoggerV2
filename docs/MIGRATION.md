# EVLogger - Guía de Migración a Supabase Propio + Monorepo

## 📊 Estado Actual

| Paso | Componente            | Estado                        |
| ---- | --------------------- | ----------------------------- |
| 1.1  | Esquema SQL           | ✅ `docs/supabase-schema.sql` |
| 1.2  | Edge Functions        | ✅ `docs/edge-functions.md`   |
| 1.3  | Exportar GitHub       | ⏳ Pendiente                  |
| 4.1  | Auth (Login/Registro) | ✅ Implementado               |
| 4.2  | Sincronización        | ❌ Pendiente                  |

---

## 🚀 Fase 1: Preparación

- [x] Esquema SQL generado → `docs/supabase-schema.sql`
- [x] Edge Functions documentadas → `docs/edge-functions.md`
- [x] Auth implementado → `src/pages/Auth.tsx`, `src/hooks/useAuth.ts`
- [ ] Exportar proyecto a GitHub

---

## 🗄️ Fase 2: Setup Supabase Propio

### 2.1 Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear cuenta / Login
3. **New Project** → Elegir nombre y región
4. Guardar las credenciales:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → Para Edge Functions (¡mantener privado!)

### 2.2 Ejecutar esquema SQL

1. Ir a **SQL Editor** en Supabase Dashboard
2. Copiar contenido de `docs/supabase-schema.sql`
3. Ejecutar

**Tablas que se crearán:**

- `profiles` - Perfil de usuario
- `vehicles` - Vehículos del usuario
- `charge_sessions` - Sesiones de carga
- `user_settings` - Configuración por usuario
- `electricity_prices` - Precios PVPC (compartida)

### 2.3 Configurar Auth

1. **Authentication** → **Providers**
2. Habilitar **Email** (ya está por defecto)
3. **Settings** → Desactivar "Confirm email" para desarrollo

### 2.4 Crear Storage Bucket

```sql
-- Ejecutar en SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Políticas RLS para avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 2.5 Desplegar Edge Function

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Vincular proyecto
supabase link --project-ref TU_PROJECT_REF

# Configurar secret (obtener de https://www.esios.ree.es)
supabase secrets set VITE_ESIOS_API_KEY=tu_api_key_esios

# Desplegar
supabase functions deploy pvpc-prices
```

---

## 🏗️ Fase 3: Setup Monorepo

### 3.1 Estructura recomendada

```
evlogger/
├── apps/
│   ├── web/                 # Frontend React (código actual)
│   │   ├── src/
│   │   ├── supabase/
│   │   │   └── functions/   # Edge Functions
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── api/                 # Backend NestJS (opcional)
│       ├── src/
│       └── package.json
│
├── packages/
│   └── shared/              # Tipos compartidos
│       ├── src/
│       │   ├── types.ts
│       │   └── index.ts
│       └── package.json
│
├── package.json             # Root con workspaces
├── pnpm-workspace.yaml
└── turbo.json               # Si usas Turborepo
```

### 3.2 Configurar pnpm workspaces

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 3.3 Root package.json

```json
{
  "name": "evlogger",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "dev:web": "pnpm --filter web dev",
    "dev:api": "pnpm --filter api dev"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### 3.4 Package Shared (Tipos)

**packages/shared/package.json:**

```json
{
  "name": "@evlogger/shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

**packages/shared/src/types.ts:**

```typescript
// Tipos compartidos entre web y api
export type VehicleType = "EV" | "PHEV";
export type ContractType = "PVPC" | "FIXED_SINGLE";
export type SocialBonusType = "NONE" | "VULNERABLE" | "SEVERE";
export type LocationType = "Casa" | "Fuera";

export interface Vehicle {
  id: string;
  userId: string;
  name: string;
  type: VehicleType;
  consumption: number;
  brand?: string;
  model?: string;
  batteryCapacity?: number;
  rangeKm?: number;
  year?: number;
  powerKw?: number;
  connectorType?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChargeSession {
  id: string;
  userId: string;
  vehicleId: string;
  startedAt: Date;
  endedAt: Date;
  kWh: number;
  location: LocationType;
  cost?: number;
  baseCost?: number;
  discountedCost?: number;
  averagePrice?: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  contractType: ContractType;
  fixedPricePerKwh?: number;
  hasSocialBonus: boolean;
  socialBonusType: SocialBonusType;
  socialBonusDiscountPercent: number;
  fuelConsumptionL100km: number;
  fuelPricePerLiter: number;
  showFuelSavings: boolean;
}

export interface ElectricityPrice {
  id: string;
  startsAt: Date;
  endsAt: Date;
  pricePerKwh: number;
  currency: string;
  source: string;
}
```

---

## ⚙️ Fase 4: Actualizar Frontend

### 4.1 Variables de entorno

Crear `.env` en la raíz del frontend:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_SUPABASE_PROJECT_ID=tu_project_id
```

### 4.2 Actualizar cliente Supabase

Modificar `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

### 4.3 Auth (✅ Ya implementado)

- Página `/auth` con login/registro
- Hook `useAuth` para estado de sesión
- Header con avatar y logout

### 4.4 Implementar Sync (⏳ Siguiente paso)

Estrategia de sincronización bidireccional:

```
┌─────────────────┐         ┌─────────────────┐
│   SQLite Local  │ ◄─────► │    Supabase     │
│   (offline)     │  sync   │    (cloud)      │
└─────────────────┘         └─────────────────┘
```

**Campos adicionales en SQLite:**

- `sync_status`: 'pending' | 'synced' | 'conflict'
- `remote_id`: UUID de Supabase
- `last_synced_at`: Timestamp

**Hook a implementar:**

```typescript
// hooks/useSync.ts
export function useSync() {
  const syncVehicles = async () => {
    /* ... */
  };
  const syncSessions = async () => {
    /* ... */
  };
  const syncSettings = async () => {
    /* ... */
  };

  return { syncVehicles, syncSessions, syncSettings };
}
```

---

## ✅ Checklist Final

### Supabase

- [ ] Proyecto creado
- [ ] Esquema SQL ejecutado
- [ ] Auth configurado (email confirm desactivado)
- [ ] Bucket `avatars` creado
- [ ] Secret `VITE_ESIOS_API_KEY` configurado
- [ ] Edge Function `pvpc-prices` desplegada

### Frontend

- [x] Auth implementado (login/registro)
- [ ] Variables de entorno configuradas
- [ ] Cliente Supabase actualizado
- [ ] Sincronización implementada

### Monorepo (opcional)

- [ ] Estructura de carpetas creada
- [ ] pnpm workspaces configurado
- [ ] Package shared con tipos

---

## 🛠️ Comandos útiles

```bash
# Desarrollo local
pnpm dev

# Build producción
pnpm build

# Sync Capacitor (mobile)
npx cap sync

# Desplegar Edge Functions
supabase functions deploy

# Ver logs Edge Functions
supabase functions logs pvpc-prices
```

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo](https://turbo.build/repo/docs)
- [ESIOS API](https://www.esios.ree.es) - Para obtener API key de precios
