import { useVehicles, Vehicle } from "@/hooks/useVehicles";
import { VehicleCard } from "@/components/VehicleCard";
import { AddVehicleSheet } from "@/components/AddVehicleSheet";
import { EditVehicleSheet } from "@/components/EditVehicleSheet";
import { Car, Plus } from "lucide-react";
import { toast } from "sonner";
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
import { useState } from "react";

export function VehiclesSettings() {
  const { vehicles, loading, addVehicle, editVehicle, removeVehicle, toggleFavorite } =
    useVehicles();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await removeVehicle(deleteId);
      toast.success("Vehículo eliminado", {
        position: "top-center",
      });
    } catch (err) {
      toast.error("Error al eliminar el vehículo", {
        position: "top-center",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleSetFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
      toast.success("Vehículo principal actualizado", {
        position: "top-center",
      });
    } catch (err) {
      toast.error("Error al actualizar favorito", {
        position: "top-center",
      });
    }
  };
  const handleEdit = (id: string) => {
    const vehicle = vehicles.find((v) => v.id === id);
    if (vehicle) {
      setEditingVehicle(vehicle);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
        <div className="h-6 w-40 bg-secondary rounded mb-4" />
        <div className="h-24 bg-secondary rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Mis Vehículos</h3>
        <AddVehicleSheet
          onAddVehicle={addVehicle}
          trigger={
            <button className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
              <Plus className="h-4 w-4" />
              Añadir
            </button>
          }
        />
      </div>

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-secondary p-4 mb-3">
            <Car className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-1">
            No tienes vehículos registrados
          </p>
          <p className="text-xs text-muted-foreground">
            Añade tu primer EV para empezar a registrar cargas
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSetFavorite={handleSetFavorite}
              onEdit={handleEdit}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Las sesiones de carga asociadas
              no se eliminarán pero perderán la referencia al vehículo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit vehicle sheet */}
      {editingVehicle && (
        <EditVehicleSheet
          vehicle={editingVehicle}
          open={!!editingVehicle}
          onOpenChange={(open) => !open && setEditingVehicle(null)}
          onEditVehicle={async (id, patch) => {
            await editVehicle(id, patch);
            setEditingVehicle(null);
          }}
        />
      )}
    </div>
  );
}
