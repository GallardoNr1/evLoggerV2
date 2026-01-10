export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      charge_sessions: {
        Row: {
          average_price: number | null
          base_cost: number | null
          cost: number | null
          created_at: string
          currency: string | null
          discounted_cost: number | null
          ended_at: string
          id: string
          kwh: number
          location: string | null
          started_at: string
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          average_price?: number | null
          base_cost?: number | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          discounted_cost?: number | null
          ended_at: string
          id?: string
          kwh: number
          location?: string | null
          started_at: string
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          average_price?: number | null
          base_cost?: number | null
          cost?: number | null
          created_at?: string
          currency?: string | null
          discounted_cost?: number | null
          ended_at?: string
          id?: string
          kwh?: number
          location?: string | null
          started_at?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charge_sessions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      electricity_prices: {
        Row: {
          created_at: string
          currency: string
          ends_at: string
          id: string
          price_per_kwh: number
          source: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          ends_at: string
          id?: string
          price_per_kwh: number
          source?: string
          starts_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          ends_at?: string
          id?: string
          price_per_kwh?: number
          source?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          contract_type: string
          cost_view_mode: string
          created_at: string
          fixed_price_per_kwh: number | null
          fuel_consumption_l100km: number | null
          fuel_price_per_liter: number | null
          has_social_bonus: boolean
          id: string
          show_fuel_savings: boolean | null
          social_bonus_discount_percent: number
          social_bonus_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contract_type?: string
          cost_view_mode?: string
          created_at?: string
          fixed_price_per_kwh?: number | null
          fuel_consumption_l100km?: number | null
          fuel_price_per_liter?: number | null
          has_social_bonus?: boolean
          id?: string
          show_fuel_savings?: boolean | null
          social_bonus_discount_percent?: number
          social_bonus_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contract_type?: string
          cost_view_mode?: string
          created_at?: string
          fixed_price_per_kwh?: number | null
          fuel_consumption_l100km?: number | null
          fuel_price_per_liter?: number | null
          has_social_bonus?: boolean
          id?: string
          show_fuel_savings?: boolean | null
          social_bonus_discount_percent?: number
          social_bonus_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          battery_capacity: number | null
          brand: string | null
          connector_type: string | null
          consumption: number
          created_at: string
          efficiency_wh_km: number | null
          id: string
          is_favorite: boolean
          model: string | null
          name: string
          notes: string | null
          power_kw: number | null
          range_km: number | null
          type: string
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          battery_capacity?: number | null
          brand?: string | null
          connector_type?: string | null
          consumption?: number
          created_at?: string
          efficiency_wh_km?: number | null
          id?: string
          is_favorite?: boolean
          model?: string | null
          name: string
          notes?: string | null
          power_kw?: number | null
          range_km?: number | null
          type?: string
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          battery_capacity?: number | null
          brand?: string | null
          connector_type?: string | null
          consumption?: number
          created_at?: string
          efficiency_wh_km?: number | null
          id?: string
          is_favorite?: boolean
          model?: string | null
          name?: string
          notes?: string | null
          power_kw?: number | null
          range_km?: number | null
          type?: string
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
