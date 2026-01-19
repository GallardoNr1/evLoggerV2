import { Battery } from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";

export const Header = () => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 flex justify-center pointer-events-none px-4"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
      role="banner"
    >
      <div className="max-w-md w-full rounded-2xl border border-border bg-card/95 backdrop-blur-lg shadow-lg pointer-events-auto">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Battery className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">EVLogger</h1>
              <p className="text-xs text-muted-foreground">Tu gestor de cargas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
