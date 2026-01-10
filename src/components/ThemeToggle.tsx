import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="flex items-center justify-between rounded-xl bg-secondary p-4">
      <div>
        <p className="font-medium text-foreground">Tema</p>
        <p className="text-xs text-muted-foreground">Apariencia de la app</p>
      </div>
      <div className="flex gap-1">
        <Button
          variant={theme === "dark" ? "default" : "ghost"}
          size="icon"
          onClick={() => setTheme("dark")}
          aria-label="Tema oscuro"
          className={cn(
            "h-10 w-10",
            theme === "dark" && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
        >
          <Moon className="h-5 w-5" />
        </Button>
        <Button
          variant={theme === "light" ? "default" : "ghost"}
          size="icon"
          onClick={() => setTheme("light")}
          aria-label="Tema claro"
          className={cn(
            "h-10 w-10",
            theme === "light" && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
        >
          <Sun className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
