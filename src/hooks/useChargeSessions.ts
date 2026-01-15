import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ChargeSession = {
  id: string;
  vehicleId: string | null;
  startedAt: string;
  endedAt: string;
  kWh: number;
  cost: number | null;
  baseCost: number | null;
  averagePrice: number | null;
  currency: string;
  location: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateChargeSessionInput = {
  vehicleId?: string | null;
  startedAt: string;
  endedAt: string;
  kWh: number;
  cost?: number | null;
  baseCost?: number | null;
  averagePrice?: number | null;
  currency?: string;
  location?: string | null;
};

// Map Supabase row to ChargeSession type
function mapRow(row: any): ChargeSession {
  return {
    id: row.id,
    vehicleId: row.vehicle_id ?? null,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    kWh: Number(row.kwh),
    cost: row.cost != null ? Number(row.cost) : null,
    baseCost: row.base_cost != null ? Number(row.base_cost) : null,
    averagePrice: row.average_price != null ? Number(row.average_price) : null,
    currency: row.currency ?? 'EUR',
    location: row.location ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useChargeSessions(vehicleId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading: loading, error, refetch: refresh } = useQuery({
    queryKey: ['charge_sessions', user?.id, vehicleId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('charge_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });
      
      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const addMutation = useMutation({
    mutationFn: async (input: CreateChargeSessionInput) => {
      if (!user) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('charge_sessions')
        .insert({
          user_id: user.id,
          vehicle_id: input.vehicleId ?? null,
          started_at: input.startedAt,
          ended_at: input.endedAt,
          kwh: input.kWh,
          cost: input.cost ?? null,
          base_cost: input.baseCost ?? null,
          average_price: input.averagePrice ?? null,
          currency: input.currency ?? 'EUR',
          location: input.location ?? 'home',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['charge_sessions'] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('charge_sessions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['charge_sessions'] }),
  });

  const addSession = async (input: CreateChargeSessionInput) => {
    return addMutation.mutateAsync(input);
  };

  const removeSession = async (id: string) => {
    return removeMutation.mutateAsync(id);
  };

  return { sessions, loading, error: error as Error | null, refresh, addSession, removeSession };
}
