import { useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmDeleteDialogProps = {
  /** Controla si está abierto */
  open: boolean;
  /** Cerrar (o cambiar estado) */
  onOpenChange: (open: boolean) => void;

  /** Acción confirmada */
  onConfirm: () => void;

  /** Textos */
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;

  /** Estilos opcionales */
  confirmClassName?: string;
  cancelClassName?: string;
};

const ConfirmDeleteDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "¿Eliminar elemento?",
  description = "Esta acción no se puede deshacer. Se eliminará permanentemente.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  confirmClassName = "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  cancelClassName = "bg-secondary",
}: ConfirmDeleteDialogProps) => {
  // Evita recrear strings/clases en cada render (no es obligatorio, pero es limpio)
  const content = useMemo(
    () => ({ title, description, confirmText, cancelText }),
    [title, description, confirmText, cancelText],
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>{content.title}</AlertDialogTitle>
          <AlertDialogDescription>{content.description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className={cancelClassName}>
            {content.cancelText}
          </AlertDialogCancel>

          <AlertDialogAction onClick={onConfirm} className={confirmClassName}>
            {content.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteDialog;
