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
import { Button } from "./ui/button";

export const CalculatorFloatingButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="xl"
          className="h-14 w-14 rounded-full p-0 shadow-lg [&_svg]:size-6"
          aria-label="Calculadora de carga"
        >
          <Calculator className="h-6 w-6" />
        </Button>
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
