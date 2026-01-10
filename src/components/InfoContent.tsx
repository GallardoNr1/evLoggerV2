import { 
  HelpCircle, 
  Calculator, 
  Settings, 
  AlertTriangle,
  Zap,
  Percent,
  BarChart3,
  Car,
  Fuel,
  TrendingDown,
  Clock,
  Battery,
  Home,
  Plug
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const InfoContent = () => {
  return (
    <div className="space-y-4">
      {/* Intro Card */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="rounded-xl bg-primary/20 p-2">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            ¿Qué hace EVLogger por ti?
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          EVLogger es tu asistente para controlar y optimizar el coste de cargar
          tu vehículo eléctrico. Registra tus sesiones de carga (en casa o fuera),
          consulta los precios de la luz en tiempo real y compara cuánto ahorras
          frente a un coche de combustible.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 rounded-lg bg-primary/10 p-2 w-fit">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <p className="font-medium text-foreground text-sm">Precios PVPC</p>
          <p className="text-xs text-muted-foreground mt-1">
            Consulta precios de ayer, hoy y mañana
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 rounded-lg bg-success/10 p-2 w-fit">
            <Battery className="h-5 w-5 text-success" />
          </div>
          <p className="font-medium text-foreground text-sm">Sesiones de carga</p>
          <p className="text-xs text-muted-foreground mt-1">
            Casa o cargadores públicos
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 rounded-lg bg-warning/10 p-2 w-fit">
            <Car className="h-5 w-5 text-warning" />
          </div>
          <p className="font-medium text-foreground text-sm">Múltiples vehículos</p>
          <p className="text-xs text-muted-foreground mt-1">
            Gestiona toda tu flota EV
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 rounded-lg bg-destructive/10 p-2 w-fit">
            <Fuel className="h-5 w-5 text-destructive" />
          </div>
          <p className="font-medium text-foreground text-sm">Ahorro vs combustible</p>
          <p className="text-xs text-muted-foreground mt-1">
            Compara con un coche tradicional
          </p>
        </div>
      </div>

      {/* Accordion Sections */}
      <Accordion type="single" collapsible className="space-y-3">
        {/* 1. Cómo se calcula el coste */}
        <AccordionItem 
          value="calculo" 
          className="rounded-2xl border border-border bg-card px-4 data-[state=open]:border-primary/30"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">
                Cómo se calcula el coste
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">
                    Cargas en casa (PVPC)
                  </span>
                </div>
                <p>
                  Para tarifas PVPC, los kWh se reparten entre las horas de carga
                  y se aplica el precio correspondiente a cada tramo horario.
                </p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">
                    Cargas en casa (Precio fijo)
                  </span>
                </div>
                <p>
                  Si tienes tarifa de precio fijo, el coste se calcula directamente
                  multiplicando los kWh por tu precio configurado (sin necesidad de
                  indicar horas).
                </p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Plug className="h-4 w-4 text-warning" />
                  <span className="font-medium text-foreground">
                    Cargas fuera de casa
                  </span>
                </div>
                <p>
                  Para cargas en cargadores públicos, simplemente introduces los kWh
                  cargados y el coste que has pagado.
                </p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Percent className="h-4 w-4 text-success" />
                  <span className="font-medium text-foreground">
                    Bono social
                  </span>
                </div>
                <p>
                  Si tienes <strong className="text-foreground">bono social</strong> configurado,
                  se aplica el descuento correspondiente sobre el coste de energía.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Precios de la luz */}
        <AccordionItem 
          value="precios" 
          className="rounded-2xl border border-border bg-card px-4 data-[state=open]:border-primary/30"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">
                Precios de la luz
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">Consulta precios PVPC</p>
                <p>
                  En la pestaña <strong className="text-foreground">Precios</strong> puedes ver los precios
                  de electricidad de ayer, hoy y mañana (disponibles tras las 20:30h).
                </p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">Colores relativos</p>
                <p>
                  Los colores indican si el precio es <span className="text-success font-medium">barato</span>,{" "}
                  <span className="text-warning font-medium">medio</span> o{" "}
                  <span className="text-destructive font-medium">caro</span> respecto al rango del día.
                </p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">Planifica tus cargas</p>
                <p>
                  Usa el gráfico y el desglose horario para identificar las mejores
                  horas para cargar y ahorrar en tu factura.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Calculadora de carga */}
        <AccordionItem 
          value="calculadora" 
          className="rounded-2xl border border-border bg-card px-4 data-[state=open]:border-primary/30"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">
                Calculadora de carga
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">¿Qué calcula?</p>
                <p>
                  La calculadora te ayuda a estimar el tiempo de carga necesario
                  y la potencia requerida para cargar tu vehículo.
                </p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">Cómo usarla</p>
                <p>
                  Indica la capacidad de batería, el porcentaje actual y objetivo,
                  las horas disponibles para cargar, y el tipo de instalación
                  (monofásica/trifásica).
                </p>
              </div>

              <div className="rounded-xl bg-primary/10 p-4 border border-primary/30">
                <p className="mb-1 font-medium text-primary">Acceso rápido</p>
                <p>
                  Pulsa el botón flotante con el icono de calculadora (📱) en la
                  esquina inferior izquierda.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Comparativa con combustible */}
        <AccordionItem 
          value="combustible" 
          className="rounded-2xl border border-border bg-card px-4 data-[state=open]:border-success/30"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <TrendingDown className="h-5 w-5 text-success" />
              </div>
              <span className="font-semibold text-foreground">
                Ahorro frente a combustible
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">¿Cómo se calcula?</p>
                <p>
                  EVLogger usa el consumo de tu vehículo (kWh/100km) para estimar
                  los kilómetros recorridos y compara con el coste de un coche
                  de combustible.
                </p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">Configura tu comparativa</p>
                <p>
                  En <strong className="text-foreground">Ajustes → Comparación combustible</strong> puedes
                  indicar el consumo (L/100km) y precio del combustible de referencia.
                </p>
              </div>

              <div className="rounded-xl bg-success/10 p-4 border border-success/30">
                <p className="mb-1 font-medium text-success">Visualización</p>
                <p>
                  Verás el ahorro en cada tarjeta de sesión, en las estadísticas
                  y en el gráfico comparativo de los últimos 6 meses.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Gestión de vehículos */}
        <AccordionItem 
          value="vehiculos" 
          className="rounded-2xl border border-border bg-card px-4 data-[state=open]:border-primary/30"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">
                Gestión de vehículos
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">Múltiples vehículos</p>
                <p>
                  Añade varios vehículos con su consumo (kWh/100km) y capacidad
                  de batería. Cada sesión se asigna a un vehículo.
                </p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">Vehículo favorito</p>
                <p>
                  Marca uno como favorito (⭐) y se preseleccionará
                  automáticamente al registrar nuevas cargas.
                </p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">Filtrar estadísticas</p>
                <p>
                  En la pestaña Stats puedes filtrar por vehículo para ver el
                  consumo y coste de cada uno por separado.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 6. Ajustes */}
        <AccordionItem 
          value="ajustes" 
          className="rounded-2xl border border-border bg-card px-4 data-[state=open]:border-primary/30"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">
                Ajustes disponibles
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">Tipo de contrato</p>
                <p>
                  Elige entre <strong className="text-foreground">PVPC regulado</strong> (precio variable)
                  o <strong className="text-foreground">precio fijo</strong> (mercado libre, indicando tu €/kWh).
                </p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">Bono social eléctrico</p>
                <p>
                  Configura si tienes bono social y su nivel de descuento
                  (vulnerable, vulnerable severo, riesgo de exclusión).
                </p>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-1 font-medium text-foreground">Comparación combustible</p>
                <p>
                  Ajusta el consumo (L/100km) y precio del litro para comparar
                  con un coche de combustible equivalente.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 7. Limitaciones */}
        <AccordionItem 
          value="limitaciones" 
          className="rounded-2xl border border-border bg-card px-4 data-[state=open]:border-warning/30"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/20 p-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <span className="font-semibold text-foreground">
                Importante: aproximaciones
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 pt-2">
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Los cálculos son estimaciones</strong> basadas en precios
                PVPC y tus ajustes. Tu factura real puede diferir por:
              </p>
              
              <ul className="space-y-2 rounded-xl bg-warning/10 p-4">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warning" />
                  <span>Cambios en tarifas o condiciones de tu contrato.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warning" />
                  <span>Redondeos o ajustes del comercializador.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warning" />
                  <span>El ahorro vs combustible usa el consumo de tu vehículo configurado.</span>
                </li>
              </ul>

              <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
                <p>
                  Usa estos datos como guía, la referencia definitiva{" "}
                  <strong className="text-warning">siempre será tu factura real</strong>.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Footer */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          EVLogger v1.0.0 • Datos PVPC de REE/ESIOS
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Almacenamiento local SQLite • Offline-first
        </p>
      </div>
    </div>
  );
};
