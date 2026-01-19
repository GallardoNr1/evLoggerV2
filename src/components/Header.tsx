import { Zap } from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";

export const Header = () => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 flex justify-center pointer-events-none px-4"
      style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
      role="banner"
    >
      <div className="max-w-md w-full pointer-events-auto">
        <div className="flex items-center justify-between px-1 py-1">
          {/* Logo pill */}
          <div className="flex items-center gap-2 rounded-full bg-card/90 backdrop-blur-xl border border-border/50 pl-1.5 pr-4 py-1.5 shadow-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-md">
              <Zap className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">EVLogger</span>
          </div>

          {/* Profile pill */}
          <div className="rounded-full bg-card/90 backdrop-blur-xl border border-border/50 shadow-lg">
            <ProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
