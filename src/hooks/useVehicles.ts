import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type VehicleType = 'EV' | 'DIESEL' | 'GASOLINA' | 'GLP';

export type Vehicle = {
  id: string;
  name: string;
  type: VehicleType;
  consumption: number;
  brand?: string | null;
  model?: string | null;
  batteryCapacity?: number | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateVehicleInput = {
  name: string;
  type: VehicleType;
  consumption: number;
  brand?: string | null;
  model?: string | null;
  batteryCapacity?: number | null;
  isFavorite?: boolean;
};

// Map Supabase row to Vehicle type
function mapRow(row: any): Vehicle {
  return {
    id: row.id,
    name: row.name,
    type: row.type as VehicleType,
    consumption: Number(row.consumption),
    brand: row.brand ?? null,
    model: row.model ?? null,
    batteryCapacity: row.battery_capacity != null ? Number(row.battery_capacity) : null,
    isFavorite: !!row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useVehicles() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vehicles = [], isLoading: loading, error, refetch: refresh } = useQuery({
    queryKey: ['vehicles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const addMutation = useMutation({
    mutationFn: async (input: CreateVehicleInput) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          user_id: user.id,
          name: input.name,
          type: input.type,
          consumption: input.consumption,
          brand: input.brand ?? null,
          model: input.model ?? null,
          battery_capacity: input.batteryCapacity ?? null,
          is_favorite: input.isFavorite ?? false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<CreateVehicleInput> }) => {
      const updateData: Record<string, any> = {};
      if (patch.name !== undefined) updateData.name = patch.name;
      if (patch.type !== undefined) updateData.type = patch.type;
      if (patch.consumption !== undefined) updateData.consumption = patch.consumption;
      if (patch.brand !== undefined) updateData.brand = patch.brand;
      if (patch.model !== undefined) updateData.model = patch.model;
      if (patch.batteryCapacity !== undefined) updateData.battery_capacity = patch.batteryCapacity;
      if (patch.isFavorite !== undefined) updateData.is_favorite = patch.isFavorite;

      const { error } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('No user');
      
      // First, set all vehicles to not favorite
      await supabase
        .from('vehicles')
        .update({ is_favorite: false })
        .eq('user_id', user.id);
      
      // Then set the selected one as favorite
      const { error } = await supabase
        .from('vehicles')
        .update({ is_favorite: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const addVehicle = async (input: CreateVehicleInput) => {
    return addMutation.mutateAsync(input);
  };

  const editVehicle = async (id: string, patch: Partial<CreateVehicleInput>) => {
    return editMutation.mutateAsync({ id, patch });
  };

  const removeVehicle = async (id: string) => {
    return removeMutation.mutateAsync(id);
  };

  const toggleFavorite = async (id: string) => {
    return toggleFavoriteMutation.mutateAsync(id);
  };

  const favoriteVehicle = vehicles.find(v => v.isFavorite) || vehicles[0] || null;

  return { 
    vehicles, 
    favoriteVehicle,
    loading, 
    error: error as Error | null, 
    refresh, 
    addVehicle, 
    editVehicle, 
    removeVehicle,
    toggleFavorite 
  };
}
