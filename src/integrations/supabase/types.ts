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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      conversation_messages: {
        Row: {
          content: string
          id: string
          message_type: string
          metadata: Json | null
          processing_data: Json | null
          session_id: string
          timestamp: string
        }
        Insert: {
          content: string
          id?: string
          message_type: string
          metadata?: Json | null
          processing_data?: Json | null
          session_id: string
          timestamp?: string
        }
        Update: {
          content?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          processing_data?: Json | null
          session_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "conversation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_sessions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          session_key: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          session_key: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          session_key?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conversation_summaries: {
        Row: {
          created_at: string
          end_message_id: string | null
          id: string
          message_count: number
          metadata: Json | null
          session_id: string
          start_message_id: string | null
          summary_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_message_id?: string | null
          id?: string
          message_count?: number
          metadata?: Json | null
          session_id: string
          start_message_id?: string | null
          summary_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_message_id?: string | null
          id?: string
          message_count?: number
          metadata?: Json | null
          session_id?: string
          start_message_id?: string | null
          summary_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      entity_relationships: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          relationship_type: string
          source_entity_id: string
          strength: number | null
          target_entity_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          relationship_type: string
          source_entity_id: string
          strength?: number | null
          target_entity_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          relationship_type?: string
          source_entity_id?: string
          strength?: number | null
          target_entity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_relationships_source_entity_id_fkey"
            columns: ["source_entity_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_relationships_target_entity_id_fkey"
            columns: ["target_entity_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      interaction_patterns: {
        Row: {
          confidence_score: number | null
          frequency: number | null
          id: string
          last_occurrence: string
          metadata: Json | null
          pattern_data: Json
          pattern_name: string
          session_key: string
        }
        Insert: {
          confidence_score?: number | null
          frequency?: number | null
          id?: string
          last_occurrence?: string
          metadata?: Json | null
          pattern_data: Json
          pattern_name: string
          session_key: string
        }
        Update: {
          confidence_score?: number | null
          frequency?: number | null
          id?: string
          last_occurrence?: string
          metadata?: Json | null
          pattern_data?: Json
          pattern_name?: string
          session_key?: string
        }
        Relationships: []
      }
      knowledge_entities: {
        Row: {
          confidence_score: number | null
          created_at: string
          description: string | null
          entity_name: string
          entity_type: string
          id: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          entity_name: string
          entity_type: string
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          entity_name?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_patterns: {
        Row: {
          confidence_score: number | null
          id: string
          last_used: string | null
          pattern_data: Json | null
          pattern_type: string
          usage_count: number | null
        }
        Insert: {
          confidence_score?: number | null
          id?: string
          last_used?: string | null
          pattern_data?: Json | null
          pattern_type: string
          usage_count?: number | null
        }
        Update: {
          confidence_score?: number | null
          id?: string
          last_used?: string | null
          pattern_data?: Json | null
          pattern_type?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      memory_contexts: {
        Row: {
          content: string
          context_type: string
          embedding: number[] | null
          id: string
          importance_score: number | null
          metadata: Json | null
          session_id: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          content: string
          context_type: string
          embedding?: number[] | null
          id?: string
          importance_score?: number | null
          metadata?: Json | null
          session_id: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          content?: string
          context_type?: string
          embedding?: number[] | null
          id?: string
          importance_score?: number | null
          metadata?: Json | null
          session_id?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_actions: {
        Row: {
          action_data: Json
          action_name: string
          action_type: string
          created_at: string
          id: string
          is_active: boolean | null
          last_execution: string | null
          metadata: Json | null
          next_execution: string | null
          schedule_expression: string
          session_key: string
        }
        Insert: {
          action_data: Json
          action_name: string
          action_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_execution?: string | null
          metadata?: Json | null
          next_execution?: string | null
          schedule_expression: string
          session_key: string
        }
        Update: {
          action_data?: Json
          action_name?: string
          action_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_execution?: string | null
          metadata?: Json | null
          next_execution?: string | null
          schedule_expression?: string
          session_key?: string
        }
        Relationships: []
      }
      task_executions: {
        Row: {
          error_message: string | null
          execution_end: string | null
          execution_start: string
          id: string
          metadata: Json | null
          result_data: Json | null
          status: string
          task_id: string
        }
        Insert: {
          error_message?: string | null
          execution_end?: string | null
          execution_start?: string
          id?: string
          metadata?: Json | null
          result_data?: Json | null
          status?: string
          task_id: string
        }
        Update: {
          error_message?: string | null
          execution_end?: string | null
          execution_start?: string
          id?: string
          metadata?: Json | null
          result_data?: Json | null
          status?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_executions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          execution_data: Json | null
          id: string
          metadata: Json | null
          parent_task_id: string | null
          priority: number | null
          scheduled_for: string | null
          session_key: string
          status: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          execution_data?: Json | null
          id?: string
          metadata?: Json | null
          parent_task_id?: string | null
          priority?: number | null
          scheduled_for?: string | null
          session_key: string
          status?: string
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          execution_data?: Json | null
          id?: string
          metadata?: Json | null
          parent_task_id?: string | null
          priority?: number | null
          scheduled_for?: string | null
          session_key?: string
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          preference_key: string
          preference_value: Json
          session_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          preference_key: string
          preference_value: Json
          session_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          preference_key?: string
          preference_value?: Json
          session_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      worker_registrations: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown
          is_active: boolean
          last_seen: string
          metadata: Json | null
          registration_date: string
          session_key: string | null
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: unknown
          is_active?: boolean
          last_seen?: string
          metadata?: Json | null
          registration_date?: string
          session_key?: string | null
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean
          last_seen?: string
          metadata?: Json | null
          registration_date?: string
          session_key?: string | null
          updated_at?: string
          worker_id?: string
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
