import { Home, BarChart3, Settings, Euro, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalculatorFloatingButton } from "./CalculatorFloatingButton";
import { AddSessionSheet } from "./AddSessionSheet";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: "dashboard", icon: Home, label: "Inicio" },
    { id: "prices", icon: Euro, label: "Precios" },
    { id: "stats", icon: BarChart3, label: "Stats" },
    { id: "info", icon: HelpCircle, label: "Info" },
    { id: "settings", icon: Settings, label: "Ajustes" },
  ];

  return (
    <nav
      className="fixed bottom-0 mx-auto max-w-md z-40 px-2 right-0 left-0"
      role="navigation"
      aria-label="Navegación principal"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
    >
      <div className="flex w-full items-center justify-between  gap-1">
        <CalculatorFloatingButton />
        <div className="flex items-center gap-1 rounded-full bg-card/90 backdrop-blur-xl border border-border/50 p-1.5 shadow-lg">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.label}
                className={cn(
                  "relative flex items-center justify-center rounded-full p-3 transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80",
                )}
              >
                <tab.icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive && "scale-110",
                  )}
                />
              </button>
            );
          })}
        </div>
        <AddSessionSheet />
      </div>
    </nav>
  );
};
