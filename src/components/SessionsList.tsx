import { ChargingSession } from "@/types/evlogger";
import { SessionCard } from "./SessionCard";
import { History } from "lucide-react";
import { useState } from "react";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

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
  showFuelSavings = true,
}: SessionsListProps) => {
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
              showFuelSavings={showFuelSavings}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
