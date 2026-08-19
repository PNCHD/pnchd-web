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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      client_feature_toggles: {
        Row: {
          feature_key: string
          id: string
          is_enabled: boolean
          organization_id: string
          updated_at: string
        }
        Insert: {
          feature_key: string
          id?: string
          is_enabled?: boolean
          organization_id: string
          updated_at?: string
        }
        Update: {
          feature_key?: string
          id?: string
          is_enabled?: boolean
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_feature_toggles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_signers: {
        Row: {
          document_id: string
          docuseal_submitter_id: string | null
          id: string
          organization_id: string
          profile_id: string | null
          signed_at: string | null
          signer_email: string
          signer_name: string
          signing_ip: string | null
          status: string
        }
        Insert: {
          document_id: string
          docuseal_submitter_id?: string | null
          id?: string
          organization_id: string
          profile_id?: string | null
          signed_at?: string | null
          signer_email: string
          signer_name: string
          signing_ip?: string | null
          status?: string
        }
        Update: {
          document_id?: string
          docuseal_submitter_id?: string | null
          id?: string
          organization_id?: string
          profile_id?: string | null
          signed_at?: string | null
          signer_email?: string
          signer_name?: string
          signing_ip?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_signers_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_signers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_signers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          completed_storage_path: string | null
          created_at: string
          created_by: string
          docuseal_submission_id: string | null
          id: string
          organization_id: string
          project_id: string | null
          status: string
          storage_path: string
          title: string
          type: string
        }
        Insert: {
          completed_storage_path?: string | null
          created_at?: string
          created_by: string
          docuseal_submission_id?: string | null
          id?: string
          organization_id: string
          project_id?: string | null
          status?: string
          storage_path: string
          title: string
          type?: string
        }
        Update: {
          completed_storage_path?: string | null
          created_at?: string
          created_by?: string
          docuseal_submission_id?: string | null
          id?: string
          organization_id?: string
          project_id?: string | null
          status?: string
          storage_path?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string
          due_date: string | null
          id: string
          organization_id: string
          paid_at: string | null
          project_id: string | null
          proposal_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          subtotal_cents: number
          tax_cents: number | null
          title: string
          total_cents: number
        }
        Insert: {
          client_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          organization_id: string
          paid_at?: string | null
          project_id?: string | null
          proposal_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          subtotal_cents?: number
          tax_cents?: number | null
          title: string
          total_cents?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          organization_id?: string
          paid_at?: string | null
          project_id?: string | null
          proposal_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          subtotal_cents?: number
          tax_cents?: number | null
          title?: string
          total_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
          description: string
          id: string
          organization_id: string
          parent_id: string
          parent_type: string
          quantity: number
          sort_order: number
          total_cents: number
          unit_price_cents: number
        }
        Insert: {
          description: string
          id?: string
          organization_id: string
          parent_id: string
          parent_type: string
          quantity?: number
          sort_order?: number
          total_cents: number
          unit_price_cents: number
        }
        Update: {
          description?: string
          id?: string
          organization_id?: string
          parent_id?: string
          parent_type?: string
          quantity?: number
          sort_order?: number
          total_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "line_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      module_subscriptions: {
        Row: {
          activated_at: string
          deactivated_at: string | null
          id: string
          is_active: boolean
          module_key: string
          organization_id: string
          stripe_subscription_item_id: string | null
        }
        Insert: {
          activated_at?: string
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          module_key: string
          organization_id: string
          stripe_subscription_item_id?: string | null
        }
        Update: {
          activated_at?: string
          deactivated_at?: string | null
          id?: string
          is_active?: boolean
          module_key?: string
          organization_id?: string
          stripe_subscription_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          organization_id: string
          recipient_id: string
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          organization_id: string
          recipient_id: string
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          organization_id?: string
          recipient_id?: string
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          founding_member: boolean
          founding_member_modules_locked_at: string | null
          founding_member_price_cents: number | null
          id: string
          name: string
          owner_id: string | null
          seat_count: number
          stripe_connect_account_id: string | null
          stripe_connect_onboarded: boolean
          stripe_customer_id: string | null
        }
        Insert: {
          created_at?: string
          founding_member?: boolean
          founding_member_modules_locked_at?: string | null
          founding_member_price_cents?: number | null
          id?: string
          name: string
          owner_id?: string | null
          seat_count?: number
          stripe_connect_account_id?: string | null
          stripe_connect_onboarded?: boolean
          stripe_customer_id?: string | null
        }
        Update: {
          created_at?: string
          founding_member?: boolean
          founding_member_modules_locked_at?: string | null
          founding_member_price_cents?: number | null
          id?: string
          name?: string
          owner_id?: string | null
          seat_count?: number
          stripe_connect_account_id?: string | null
          stripe_connect_onboarded?: boolean
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          organization_id: string | null
          phone: string | null
          push_token: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          organization_id?: string | null
          phone?: string | null
          push_token?: string | null
          role: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string | null
          phone?: string | null
          push_token?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_assignments: {
        Row: {
          assigned_at: string
          id: string
          is_active: boolean
          organization_id: string
          profile_id: string
          project_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          is_active?: boolean
          organization_id: string
          profile_id: string
          project_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          profile_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          client_id: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          organization_id: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          client_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          approved_at: string | null
          client_id: string
          created_at: string
          id: string
          notes: string | null
          organization_id: string
          project_id: string | null
          status: string
          subtotal_cents: number
          tax_cents: number | null
          tax_rate_percent: number | null
          title: string
          total_cents: number
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          client_id: string
          created_at?: string
          id?: string
          notes?: string | null
          organization_id: string
          project_id?: string | null
          status?: string
          subtotal_cents?: number
          tax_cents?: number | null
          tax_rate_percent?: number | null
          title: string
          total_cents?: number
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          client_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          status?: string
          subtotal_cents?: number
          tax_cents?: number | null
          tax_rate_percent?: number | null
          title?: string
          total_cents?: number
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_locations: {
        Row: {
          accuracy_meters: number | null
          driver_id: string
          id: string
          latitude: number
          longitude: number
          organization_id: string
          recorded_at: string
          vehicle_id: string
        }
        Insert: {
          accuracy_meters?: number | null
          driver_id: string
          id?: string
          latitude: number
          longitude: number
          organization_id: string
          recorded_at?: string
          vehicle_id: string
        }
        Update: {
          accuracy_meters?: number | null
          driver_id?: string
          id?: string
          latitude?: number
          longitude?: number
          organization_id?: string
          recorded_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_locations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          assigned_driver_id: string | null
          created_at: string
          id: string
          is_active: boolean
          license_plate: string | null
          name: string
          organization_id: string
        }
        Insert: {
          assigned_driver_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          license_plate?: string | null
          name: string
          organization_id: string
        }
        Update: {
          assigned_driver_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          license_plate?: string | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          attempts: number
          completed_at: string | null
          error_message: string | null
          event_id: string
          event_type: string | null
          id: string
          provider: string
          received_at: string
          status: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          error_message?: string | null
          event_id: string
          event_type?: string | null
          id?: string
          provider: string
          received_at?: string
          status?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          error_message?: string | null
          event_id?: string
          event_type?: string | null
          id?: string
          provider?: string
          received_at?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_webhook_event: {
        Args: {
          p_event_id: string
          p_event_type?: string
          p_provider: string
          p_stale_after?: string
        }
        Returns: boolean
      }
      complete_webhook_event: {
        Args: { p_event_id: string; p_provider: string }
        Returns: undefined
      }
      current_user_is_admin: { Args: never; Returns: boolean }
      current_user_is_contractor: { Args: never; Returns: boolean }
      current_user_organization_id: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      fail_webhook_event: {
        Args: {
          p_error_message: string
          p_event_id: string
          p_provider: string
        }
        Returns: undefined
      }
      has_active_module: {
        Args: { check_module_key: string }
        Returns: boolean
      }
      is_client_feature_enabled: {
        Args: { check_feature_key: string }
        Returns: boolean
      }
      is_client_feature_enabled_for_org: {
        Args: { p_feature_key: string; p_organization_id: string }
        Returns: boolean
      }
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
