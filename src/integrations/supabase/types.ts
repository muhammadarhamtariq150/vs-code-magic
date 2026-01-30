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
      adjustments: {
        Row: {
          adjustment_type: Database["public"]["Enums"]["adjustment_type"]
          amount: number
          created_at: string
          id: string
          processed_by: string
          reason: string | null
          turnover_multiplier: number
          turnover_required: number
          user_id: string
        }
        Insert: {
          adjustment_type: Database["public"]["Enums"]["adjustment_type"]
          amount: number
          created_at?: string
          id?: string
          processed_by: string
          reason?: string | null
          turnover_multiplier?: number
          turnover_required?: number
          user_id: string
        }
        Update: {
          adjustment_type?: Database["public"]["Enums"]["adjustment_type"]
          amount?: number
          created_at?: string
          id?: string
          processed_by?: string
          reason?: string | null
          turnover_multiplier?: number
          turnover_required?: number
          user_id?: string
        }
        Relationships: []
      }
      bank_details: {
        Row: {
          account_holder: string
          account_number: string
          bank_name: string
          created_at: string
          id: string
          ifsc_code: string | null
          is_primary: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          account_holder: string
          account_number: string
          bank_name: string
          created_at?: string
          id?: string
          ifsc_code?: string | null
          is_primary?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          account_holder?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: string
          ifsc_code?: string | null
          is_primary?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: Database["public"]["Enums"]["deposit_method"]
          sender_account: string | null
          status: Database["public"]["Enums"]["deposit_status"]
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["deposit_method"]
          sender_account?: string | null
          status?: Database["public"]["Enums"]["deposit_status"]
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["deposit_method"]
          sender_account?: string | null
          status?: Database["public"]["Enums"]["deposit_status"]
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_transactions: {
        Row: {
          bet_amount: number
          created_at: string
          game_name: string
          id: string
          result: string
          user_id: string
          win_amount: number
        }
        Insert: {
          bet_amount: number
          created_at?: string
          game_name: string
          id?: string
          result: string
          user_id: string
          win_amount?: number
        }
        Update: {
          bet_amount?: number
          created_at?: string
          game_name?: string
          id?: string
          result?: string
          user_id?: string
          win_amount?: number
        }
        Relationships: []
      }
      ip_logs: {
        Row: {
          device_info: string | null
          id: string
          ip_address: string
          logged_in_at: string
          user_id: string
        }
        Insert: {
          device_info?: string | null
          id?: string
          ip_address: string
          logged_in_at?: string
          user_id: string
        }
        Update: {
          device_info?: string | null
          id?: string
          ip_address?: string
          logged_in_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          account_name: string
          account_number: string
          additional_info: string | null
          bank_name: string | null
          created_at: string
          id: string
          ifsc_code: string | null
          is_active: boolean
          method: Database["public"]["Enums"]["deposit_method"]
          network: string | null
          qr_code_url: string | null
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          additional_info?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          ifsc_code?: string | null
          is_active?: boolean
          method: Database["public"]["Enums"]["deposit_method"]
          network?: string | null
          qr_code_url?: string | null
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          additional_info?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          ifsc_code?: string | null
          is_active?: boolean
          method?: Database["public"]["Enums"]["deposit_method"]
          network?: string | null
          qr_code_url?: string | null
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agent_id: string | null
          avatar_url: string | null
          banned_at: string | null
          banned_by: string | null
          created_at: string
          id: string
          is_banned: boolean
          phone: string | null
          security_password_hash: string | null
          updated_at: string
          user_id: string
          username: string
          withdrawal_forbidden: boolean
        }
        Insert: {
          agent_id?: string | null
          avatar_url?: string | null
          banned_at?: string | null
          banned_by?: string | null
          created_at?: string
          id?: string
          is_banned?: boolean
          phone?: string | null
          security_password_hash?: string | null
          updated_at?: string
          user_id: string
          username: string
          withdrawal_forbidden?: boolean
        }
        Update: {
          agent_id?: string | null
          avatar_url?: string | null
          banned_at?: string | null
          banned_by?: string | null
          created_at?: string
          id?: string
          is_banned?: boolean
          phone?: string | null
          security_password_hash?: string | null
          updated_at?: string
          user_id?: string
          username?: string
          withdrawal_forbidden?: boolean
        }
        Relationships: []
      }
      usdt_wallets: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          network: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          network?: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          network?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wager_tracking: {
        Row: {
          adjustment_id: string | null
          created_at: string
          deposit_id: string | null
          id: string
          is_fulfilled: boolean
          turnover_completed: number
          turnover_required: number
          updated_at: string
          user_id: string
        }
        Insert: {
          adjustment_id?: string | null
          created_at?: string
          deposit_id?: string | null
          id?: string
          is_fulfilled?: boolean
          turnover_completed?: number
          turnover_required?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          adjustment_id?: string | null
          created_at?: string
          deposit_id?: string | null
          id?: string
          is_fulfilled?: boolean
          turnover_completed?: number
          turnover_required?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wager_tracking_adjustment_id_fkey"
            columns: ["adjustment_id"]
            isOneToOne: false
            referencedRelation: "adjustments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wager_tracking_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wingo_admin_controls: {
        Row: {
          created_at: string
          duration_type: string
          id: string
          is_active: boolean | null
          next_number: number | null
          set_by: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_type: string
          id?: string
          is_active?: boolean | null
          next_number?: number | null
          set_by: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_type?: string
          id?: string
          is_active?: boolean | null
          next_number?: number | null
          set_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      wingo_bets: {
        Row: {
          amount: number
          bet_type: string
          bet_value: string
          created_at: string
          id: string
          is_winner: boolean | null
          payout: number | null
          potential_win: number
          round_id: string
          user_id: string
        }
        Insert: {
          amount: number
          bet_type: string
          bet_value: string
          created_at?: string
          id?: string
          is_winner?: boolean | null
          payout?: number | null
          potential_win: number
          round_id: string
          user_id: string
        }
        Update: {
          amount?: number
          bet_type?: string
          bet_value?: string
          created_at?: string
          id?: string
          is_winner?: boolean | null
          payout?: number | null
          potential_win?: number
          round_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wingo_bets_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "wingo_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      wingo_rounds: {
        Row: {
          admin_set_number: number | null
          created_at: string
          duration_type: string
          end_time: string
          id: string
          is_admin_controlled: boolean | null
          period_id: string
          start_time: string
          status: string
          winning_color: string | null
          winning_number: number | null
          winning_size: string | null
        }
        Insert: {
          admin_set_number?: number | null
          created_at?: string
          duration_type: string
          end_time: string
          id?: string
          is_admin_controlled?: boolean | null
          period_id: string
          start_time?: string
          status?: string
          winning_color?: string | null
          winning_number?: number | null
          winning_size?: string | null
        }
        Update: {
          admin_set_number?: number | null
          created_at?: string
          duration_type?: string
          end_time?: string
          id?: string
          is_admin_controlled?: boolean | null
          period_id?: string
          start_time?: string
          status?: string
          winning_color?: string | null
          winning_number?: number | null
          winning_size?: string | null
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          account_details: Json
          amount: number
          created_at: string
          id: string
          method: string
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_details?: Json
          amount: number
          created_at?: string
          id?: string
          method: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_details?: Json
          amount?: number
          created_at?: string
          id?: string
          method?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      adjustment_type:
        | "bonus_add"
        | "bonus_reduce"
        | "manual_add"
        | "manual_reduce"
        | "wager_add"
        | "wager_reduce"
      app_role: "admin" | "user"
      deposit_method:
        | "usdt"
        | "easypaisa"
        | "jazzcash"
        | "paytm"
        | "googlepay"
        | "phonepay"
        | "binance"
      deposit_status: "pending" | "confirmed" | "rejected"
      withdrawal_status:
        | "pending"
        | "review"
        | "processing"
        | "success"
        | "rejected"
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
    Enums: {
      adjustment_type: [
        "bonus_add",
        "bonus_reduce",
        "manual_add",
        "manual_reduce",
        "wager_add",
        "wager_reduce",
      ],
      app_role: ["admin", "user"],
      deposit_method: [
        "usdt",
        "easypaisa",
        "jazzcash",
        "paytm",
        "googlepay",
        "phonepay",
        "binance",
      ],
      deposit_status: ["pending", "confirmed", "rejected"],
      withdrawal_status: [
        "pending",
        "review",
        "processing",
        "success",
        "rejected",
      ],
    },
  },
} as const
