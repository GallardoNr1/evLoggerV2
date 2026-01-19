import { Home, BarChart3, Settings, Zap, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: "dashboard", icon: Home, label: "Inicio" },
    { id: "prices", icon: Zap, label: "Precios" },
    { id: "stats", icon: BarChart3, label: "Stats" },
    { id: "info", icon: HelpCircle, label: "Info" },
    { id: "settings", icon: Settings, label: "Ajustes" },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none px-4"
      role="navigation"
      aria-label="Navegación principal"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
    >
      <div 
        className="max-w-md w-full rounded-2xl border border-border bg-card/95 backdrop-blur-lg shadow-lg pointer-events-auto"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              aria-label={tab.label}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon 
                className={cn(
                  "h-5 w-5 transition-transform",
                  activeTab === tab.id && "scale-110"
                )} 
              />
              <span className="text-xs font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute -bottom-0.5 h-0.5 w-8 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
