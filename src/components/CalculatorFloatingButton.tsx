import { useState } from "react";
import { Calculator } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChargingCalculator } from "@/components/ChargingCalculator";

export const CalculatorFloatingButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex flex-none h-12 w-12 items-center justify-center  rounded-full bg-secondary border border-border text-foreground shadow-lg transition-all hover:scale-105 hover:bg-secondary/80 active:scale-95"
          aria-label="Calculadora de carga"
        >
          <Calculator className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto rounded-t-3xl"
      >
        <SheetHeader className="mb-4">
          <SheetTitle>Calculadora de Carga</SheetTitle>
        </SheetHeader>
        <ChargingCalculator />
      </SheetContent>
    </Sheet>
  );
};
