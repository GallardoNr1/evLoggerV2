import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type ElectricityContractType = 'PVPC' | 'FIXED_SINGLE';
export type SocialBonusType = 'NONE' | 'VULNERABLE' | 'VULNERABLE_SEVERE' | 'EXCLUSION_RISK';
export type CostViewMode = 'SIMPLE' | 'WITH_BREAKDOWN';

export type ElectricitySettings = {
  id: string;
  hasSocialBonus: boolean;
  socialBonusType: SocialBonusType;
  socialBonusDiscountPercent: number;
  costViewMode: CostViewMode;
  contractType: ElectricityContractType;
  fixedPricePerKwh: number | null;
  fuelConsumptionL100km: number;
  fuelPricePerLiter: number;
  showFuelSavings: boolean;
};

// Map Supabase row to ElectricitySettings type
// Column names match the actual table schema:
// - social_bonus_type, social_bonus_discount_percent
// - fuel_consumption_l100km, fuel_price_per_liter
// - fixed_price_per_kwh, show_fuel_savings, cost_view_mode
function mapRow(row: any): ElectricitySettings {
  return {
    id: row.id,
    hasSocialBonus: !!row.has_social_bonus,
    socialBonusType: (row.social_bonus_type ?? 'NONE') as SocialBonusType,
    socialBonusDiscountPercent: Number(row.social_bonus_discount_percent ?? 0),
    costViewMode: (row.cost_view_mode ?? 'SIMPLE') as CostViewMode,
    contractType: row.contract_type === 'PVPC' ? 'PVPC' : 'FIXED_SINGLE',
    fixedPricePerKwh: row.fixed_price_per_kwh != null ? Number(row.fixed_price_per_kwh) : null,
    fuelConsumptionL100km: Number(row.fuel_consumption_l100km ?? 7.0),
    fuelPricePerLiter: Number(row.fuel_price_per_liter ?? 1.55),
    showFuelSavings: row.show_fuel_savings !== false,
  };
}

export function useSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading: loading, error, refetch: refresh } = useQuery({
    queryKey: ['user_settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no settings exist, create default ones
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            contract_type: 'PVPC',
            has_social_bonus: false,
            social_bonus_type: 'NONE',
            social_bonus_discount_percent: 0,
            fuel_price_per_liter: 1.55,
            fuel_consumption_l100km: 7.0,
            show_fuel_savings: true,
            cost_view_mode: 'SIMPLE',
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return mapRow(newData);
      }
      
      return mapRow(data);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const updateMutation = useMutation({
    mutationFn: async (patch: Partial<Omit<ElectricitySettings, 'id'>>) => {
      if (!user || !settings) throw new Error('No user or settings');
      
      const updateData: Record<string, any> = {};
      
      if (patch.hasSocialBonus !== undefined) {
        updateData.has_social_bonus = patch.hasSocialBonus;
      }
      if (patch.socialBonusType !== undefined) {
        updateData.social_bonus_type = patch.socialBonusType;
      }
      if (patch.socialBonusDiscountPercent !== undefined) {
        updateData.social_bonus_discount_percent = patch.socialBonusDiscountPercent;
      }
      if (patch.contractType !== undefined) {
        updateData.contract_type = patch.contractType;
      }
      if (patch.fixedPricePerKwh !== undefined) {
        updateData.fixed_price_per_kwh = patch.fixedPricePerKwh;
      }
      if (patch.fuelConsumptionL100km !== undefined) {
        updateData.fuel_consumption_l100km = patch.fuelConsumptionL100km;
      }
      if (patch.fuelPricePerLiter !== undefined) {
        updateData.fuel_price_per_liter = patch.fuelPricePerLiter;
      }
      if (patch.showFuelSavings !== undefined) {
        updateData.show_fuel_savings = patch.showFuelSavings;
      }
      if (patch.costViewMode !== undefined) {
        updateData.cost_view_mode = patch.costViewMode;
      }

      const { error } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Return merged settings for optimistic update
      return { ...settings, ...patch };
    },
    onSuccess: (updatedSettings) => {
      // Optimistic update
      queryClient.setQueryData(['user_settings', user?.id], updatedSettings);
    },
  });

  const updateSettings = async (patch: Partial<Omit<ElectricitySettings, 'id'>>) => {
    return updateMutation.mutateAsync(patch);
  };

  return { 
    settings: settings ?? null, 
    loading, 
    error: error as Error | null, 
    refresh, 
    updateSettings 
  };
}
