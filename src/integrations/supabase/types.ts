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
      autonomous_actions: {
        Row: {
          action_description: string
          action_type: string
          approval_required: boolean
          approved_by: string | null
          completed_at: string | null
          confidence_score: number
          created_at: string
          executed_at: string | null
          execution_status: string
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          output_data: Json | null
          risk_assessment: string
        }
        Insert: {
          action_description: string
          action_type: string
          approval_required?: boolean
          approved_by?: string | null
          completed_at?: string | null
          confidence_score: number
          created_at?: string
          executed_at?: string | null
          execution_status?: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          risk_assessment: string
        }
        Update: {
          action_description?: string
          action_type?: string
          approval_required?: boolean
          approved_by?: string | null
          completed_at?: string | null
          confidence_score?: number
          created_at?: string
          executed_at?: string | null
          execution_status?: string
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          risk_assessment?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          audio_duration: number | null
          confidence_score: number | null
          has_audio: boolean | null
          id: string
          message_context: Json | null
          message_text: string
          mining_data: Json | null
          sender: string
          session_id: string
          timestamp: string
        }
        Insert: {
          audio_duration?: number | null
          confidence_score?: number | null
          has_audio?: boolean | null
          id?: string
          message_context?: Json | null
          message_text: string
          mining_data?: Json | null
          sender: string
          session_id: string
          timestamp?: string
        }
        Update: {
          audio_duration?: number | null
          confidence_score?: number | null
          has_audio?: boolean | null
          id?: string
          message_context?: Json | null
          message_text?: string
          mining_data?: Json | null
          sender?: string
          session_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_activity: string
          session_name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity?: string
          session_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_activity?: string
          session_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      conversation_memory: {
        Row: {
          conversation_context: Json
          created_at: string
          id: string
          ip_address: unknown
          last_interaction: string
          multimodal_context: Json | null
          neural_embeddings: Json | null
          session_fingerprint: string
          total_interactions: number | null
          updated_at: string
        }
        Insert: {
          conversation_context?: Json
          created_at?: string
          id?: string
          ip_address: unknown
          last_interaction?: string
          multimodal_context?: Json | null
          neural_embeddings?: Json | null
          session_fingerprint: string
          total_interactions?: number | null
          updated_at?: string
        }
        Update: {
          conversation_context?: Json
          created_at?: string
          id?: string
          ip_address?: unknown
          last_interaction?: string
          multimodal_context?: Json | null
          neural_embeddings?: Json | null
          session_fingerprint?: string
          total_interactions?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      debate_matches: {
        Row: {
          compatibility_score: number
          created_at: string
          id: string
          matched_at: string | null
          status: string
          topic: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          compatibility_score: number
          created_at?: string
          id?: string
          matched_at?: string | null
          status?: string
          topic: string
          user1_id: string
          user2_id: string
        }
        Update: {
          compatibility_score?: number
          created_at?: string
          id?: string
          matched_at?: string | null
          status?: string
          topic?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      eliza_knowledge_base: {
        Row: {
          access_count: number | null
          confidence_level: number
          content: string
          created_at: string
          id: string
          last_accessed: string | null
          relevance_score: number
          source: string | null
          topic: string
          updated_at: string
        }
        Insert: {
          access_count?: number | null
          confidence_level?: number
          content: string
          created_at?: string
          id?: string
          last_accessed?: string | null
          relevance_score?: number
          source?: string | null
          topic: string
          updated_at?: string
        }
        Update: {
          access_count?: number | null
          confidence_level?: number
          content?: string
          created_at?: string
          id?: string
          last_accessed?: string | null
          relevance_score?: number
          source?: string | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      feed_analysis: {
        Row: {
          accuracy_scores: Json | null
          analysis_type: string
          content_analyzed: Json
          created_at: string
          id: string
          insights: Json
          user_id: string
        }
        Insert: {
          accuracy_scores?: Json | null
          analysis_type?: string
          content_analyzed: Json
          created_at?: string
          id?: string
          insights: Json
          user_id: string
        }
        Update: {
          accuracy_scores?: Json | null
          analysis_type?: string
          content_analyzed?: Json
          created_at?: string
          id?: string
          insights?: Json
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accuracy_rating: number | null
          bio: string | null
          created_at: string
          debate_score: number | null
          display_name: string | null
          id: string
          interests: string[] | null
          political_leaning: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_rating?: number | null
          bio?: string | null
          created_at?: string
          debate_score?: number | null
          display_name?: string | null
          id?: string
          interests?: string[] | null
          political_leaning?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_rating?: number | null
          bio?: string | null
          created_at?: string
          debate_score?: number | null
          display_name?: string | null
          id?: string
          interests?: string[] | null
          political_leaning?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sighting_media: {
        Row: {
          caption: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_primary: boolean | null
          sighting_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_primary?: boolean | null
          sighting_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_primary?: boolean | null
          sighting_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sighting_media_sighting_id_fkey"
            columns: ["sighting_id"]
            isOneToOne: false
            referencedRelation: "sightings"
            referencedColumns: ["id"]
          },
        ]
      }
      sightings: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          confidence_rating: number | null
          created_at: string
          description: string
          encounter_type: Database["public"]["Enums"]["sighting_type"]
          id: string
          latitude: number
          location_name: string
          longitude: number
          mystery_tags: string[] | null
          sighting_date: string
          sighting_time: string | null
          status: Database["public"]["Enums"]["sighting_status"]
          title: string
          updated_at: string
          user_id: string | null
          weather_conditions: string | null
          witness_count: number | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          confidence_rating?: number | null
          created_at?: string
          description: string
          encounter_type: Database["public"]["Enums"]["sighting_type"]
          id?: string
          latitude: number
          location_name: string
          longitude: number
          mystery_tags?: string[] | null
          sighting_date: string
          sighting_time?: string | null
          status?: Database["public"]["Enums"]["sighting_status"]
          title: string
          updated_at?: string
          user_id?: string | null
          weather_conditions?: string | null
          witness_count?: number | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          confidence_rating?: number | null
          created_at?: string
          description?: string
          encounter_type?: Database["public"]["Enums"]["sighting_type"]
          id?: string
          latitude?: number
          location_name?: string
          longitude?: number
          mystery_tags?: string[] | null
          sighting_date?: string
          sighting_time?: string | null
          status?: Database["public"]["Enums"]["sighting_status"]
          title?: string
          updated_at?: string
          user_id?: string | null
          weather_conditions?: string | null
          witness_count?: number | null
        }
        Relationships: []
      }
      social_media_posts: {
        Row: {
          accuracy_score: number | null
          analysis_result: Json | null
          created_at: string
          id: string
          platform: string
          post_content: string
          post_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_score?: number | null
          analysis_result?: Json | null
          created_at?: string
          id?: string
          platform: string
          post_content: string
          post_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_score?: number | null
          analysis_result?: Json | null
          created_at?: string
          id?: string
          platform?: string
          post_content?: string
          post_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_mining_updates: boolean | null
          created_at: string
          id: string
          notification_frequency: string | null
          preferred_language: string | null
          preferred_voice: string | null
          theme_preference: string | null
          updated_at: string
          user_id: string | null
          voice_enabled: boolean | null
        }
        Insert: {
          auto_mining_updates?: boolean | null
          created_at?: string
          id?: string
          notification_frequency?: string | null
          preferred_language?: string | null
          preferred_voice?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string | null
          voice_enabled?: boolean | null
        }
        Update: {
          auto_mining_updates?: boolean | null
          created_at?: string
          id?: string
          notification_frequency?: string | null
          preferred_language?: string | null
          preferred_voice?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string | null
          voice_enabled?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_conversation_memory: {
        Args: { p_ip_address: unknown; p_session_fingerprint: string }
        Returns: boolean
      }
      update_conversation_memory: {
        Args: {
          p_ip_address: unknown
          p_message: Json
          p_multimodal_data?: Json
          p_neural_context?: Json
          p_session_fingerprint: string
        }
        Returns: string
      }
    }
    Enums: {
      sighting_status: "pending" | "approved" | "rejected"
      sighting_type:
        | "visual"
        | "footprint"
        | "sound"
        | "smell"
        | "structure"
        | "hair_sample"
        | "other"
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
      sighting_status: ["pending", "approved", "rejected"],
      sighting_type: [
        "visual",
        "footprint",
        "sound",
        "smell",
        "structure",
        "hair_sample",
        "other",
      ],
    },
  },
} as const
