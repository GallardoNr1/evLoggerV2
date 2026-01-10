import { ChargingSession } from "@/types/evlogger";
import { SessionCard } from "./SessionCard";
import { History } from "lucide-react";
import { useState } from "react";
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

interface SessionsListProps {
  sessions: ChargingSession[];
  onSessionClick?: (session: ChargingSession) => void;
  onDeleteSession?: (id: string) => void;
  showFuelSavings?: boolean;
}

export const SessionsList = ({ 
  sessions, 
  onSessionClick, 
  onDeleteSession,
  showFuelSavings = true 
}: SessionsListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (deleteId && onDeleteSession) {
      onDeleteSession(deleteId);
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Últimas cargas</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {sessions.length} sesiones
        </span>
      </div>

      <div className="space-y-2">
        {sessions.map((session, index) => (
          <div 
            key={session.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <SessionCard 
              session={session} 
              onClick={() => onSessionClick?.(session)}
              onDelete={onDeleteSession ? setDeleteId : undefined}
              showFuelSavings={showFuelSavings}
            />
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sesión de carga?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La sesión será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
