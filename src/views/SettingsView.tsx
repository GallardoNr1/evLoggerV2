import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehiclesSettings } from "@/components/VehiclesSettings";
import { ContractTypeSettings } from "@/components/ContractTypeSettings";
import { SocialBonusSettings } from "@/components/SocialBonusSettings";
import { FuelComparisonSettings } from "@/components/FuelComparisonSettings";
import { ThemeToggle } from "@/components/ThemeToggle";

export const SettingsView = () => {
  return (
    <section className="animate-fade-in space-y-4">

      {/* Vehicles Settings */}
      <VehiclesSettings />

      {/* Contract Type Settings */}
      <ContractTypeSettings />

      {/* Social Bonus Settings */}
      <SocialBonusSettings />

      {/* Fuel Comparison Settings */}
      <FuelComparisonSettings />

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          General
        </h3>

        <div className="space-y-4">
          <ThemeToggle />

          <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Base de datos local
                </p>
                <p className="text-xs text-muted-foreground">
                  SQLite • Datos en dispositivo
                </p>
              </div>
            </div>
            <div className="h-3 w-3 rounded-full bg-success" />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
            <div>
              <p className="font-medium text-foreground">
                Actualizar precios
              </p>
              <p className="text-xs text-muted-foreground">
                Última: hace 2 horas
              </p>
            </div>
            <Button variant="ghost" size="sm">
              Actualizar
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
            <div>
              <p className="font-medium text-foreground">
                Exportar datos
              </p>
              <p className="text-xs text-muted-foreground">CSV • JSON</p>
            </div>
            <Button variant="outline" size="sm">
              Exportar
            </Button>
          </div>

          <div className="rounded-xl bg-secondary p-4 text-center">
            <p className="text-xs text-muted-foreground">
              EV Logger v1.0.0 • Hecho con ⚡ en España
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
