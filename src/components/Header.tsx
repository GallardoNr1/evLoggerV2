import { Battery } from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";

export const Header = () => {
  return (
    <header
      className="sticky top-0 z-30 border-b border-border/50 bg-background/95 backdrop-blur-lg"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      role="banner"
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Battery className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">EVLogger</h1>
            <p className="text-xs text-muted-foreground">Tu gestor de cargas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};
