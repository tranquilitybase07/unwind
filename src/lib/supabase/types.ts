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
      ai_learning_logs: {
        Row: {
          ai_input: string
          ai_output: Json
          ai_task: string
          confidence_score: number | null
          created_at: string | null
          id: string
          item_id: string | null
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          ai_input: string
          ai_output: Json
          ai_task: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          ai_input?: string
          ai_output?: Json
          ai_task?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          item_id?: string | null
          user_feedback?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_learning_logs_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learning_logs_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_this_week_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learning_logs_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_today_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learning_logs_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_worries_vault_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learning_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          emoji: string | null
          id: string
          is_system: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order: number
          emoji?: string | null
          id?: string
          is_system?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          emoji?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
        }
        Relationships: []
      }
      completions_log: {
        Row: {
          completed_at: string | null
          completion_method: string | null
          completion_time_minutes: number | null
          id: string
          item_id: string
          procrastination_duration_hours: number | null
          user_id: string
          user_mood_after: string | null
          user_mood_before: string | null
          was_procrastinated: boolean | null
        }
        Insert: {
          completed_at?: string | null
          completion_method?: string | null
          completion_time_minutes?: number | null
          id?: string
          item_id: string
          procrastination_duration_hours?: number | null
          user_id: string
          user_mood_after?: string | null
          user_mood_before?: string | null
          was_procrastinated?: boolean | null
        }
        Update: {
          completed_at?: string | null
          completion_method?: string | null
          completion_time_minutes?: number | null
          id?: string
          item_id?: string
          procrastination_duration_hours?: number | null
          user_id?: string
          user_mood_after?: string | null
          user_mood_before?: string | null
          was_procrastinated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "completions_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completions_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_this_week_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completions_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_today_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completions_log_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_worries_vault_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completions_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      item_tags: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          tag: string
          tag_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          tag: string
          tag_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          tag?: string
          tag_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_this_week_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_today_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_worries_vault_view"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          ai_confidence: number | null
          blocked_by_item_id: string | null
          category_id: string
          completed_at: string | null
          completion_time_minutes: number | null
          created_at: string | null
          custom_tags: string[] | null
          deadline_confidence: number | null
          deadline_extracted_from_text: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          emotional_weight_score: number | null
          final_priority_score: number | null
          id: string
          importance_score: number | null
          is_all_day: boolean | null
          is_worry_spiral: boolean | null
          item_type: string | null
          parent_task_id: string | null
          priority: string | null
          spiral_breakdown: Json | null
          status: string | null
          title: string
          updated_at: string | null
          urgency_score: number | null
          user_edited: boolean | null
          user_id: string
          user_mood_after_completion: string | null
          user_notes: string | null
          voice_dump_id: string | null
          worry_acknowledgment_text: string | null
        }
        Insert: {
          ai_confidence?: number | null
          blocked_by_item_id?: string | null
          category_id: string
          completed_at?: string | null
          completion_time_minutes?: number | null
          created_at?: string | null
          custom_tags?: string[] | null
          deadline_confidence?: number | null
          deadline_extracted_from_text?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          emotional_weight_score?: number | null
          final_priority_score?: number | null
          id?: string
          importance_score?: number | null
          is_all_day?: boolean | null
          is_worry_spiral?: boolean | null
          item_type?: string | null
          parent_task_id?: string | null
          priority?: string | null
          spiral_breakdown?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          urgency_score?: number | null
          user_edited?: boolean | null
          user_id: string
          user_mood_after_completion?: string | null
          user_notes?: string | null
          voice_dump_id?: string | null
          worry_acknowledgment_text?: string | null
        }
        Update: {
          ai_confidence?: number | null
          blocked_by_item_id?: string | null
          category_id?: string
          completed_at?: string | null
          completion_time_minutes?: number | null
          created_at?: string | null
          custom_tags?: string[] | null
          deadline_confidence?: number | null
          deadline_extracted_from_text?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          emotional_weight_score?: number | null
          final_priority_score?: number | null
          id?: string
          importance_score?: number | null
          is_all_day?: boolean | null
          is_worry_spiral?: boolean | null
          item_type?: string | null
          parent_task_id?: string | null
          priority?: string | null
          spiral_breakdown?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          urgency_score?: number | null
          user_edited?: boolean | null
          user_id?: string
          user_mood_after_completion?: string | null
          user_notes?: string | null
          voice_dump_id?: string | null
          worry_acknowledgment_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_blocked_by_item_id_fkey"
            columns: ["blocked_by_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_blocked_by_item_id_fkey"
            columns: ["blocked_by_item_id"]
            isOneToOne: false
            referencedRelation: "user_this_week_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_blocked_by_item_id_fkey"
            columns: ["blocked_by_item_id"]
            isOneToOne: false
            referencedRelation: "user_today_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_blocked_by_item_id_fkey"
            columns: ["blocked_by_item_id"]
            isOneToOne: false
            referencedRelation: "user_worries_vault_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "user_this_week_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "user_today_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "user_worries_vault_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_voice_dump_id_fkey"
            columns: ["voice_dump_id"]
            isOneToOne: false
            referencedRelation: "voice_dumps"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_tracking: {
        Row: {
          anxiety_level: number | null
          capture_time: string | null
          id: string
          mood_description: string | null
          related_category_id: string | null
          stress_level: number | null
          user_id: string
        }
        Insert: {
          anxiety_level?: number | null
          capture_time?: string | null
          id?: string
          mood_description?: string | null
          related_category_id?: string | null
          stress_level?: number | null
          user_id: string
        }
        Update: {
          anxiety_level?: number | null
          capture_time?: string | null
          id?: string
          mood_description?: string | null
          related_category_id?: string | null
          stress_level?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_tracking_related_category_id_fkey"
            columns: ["related_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mood_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_items: {
        Row: {
          created_at: string | null
          custom_interval_days: number | null
          days_of_week: number[] | null
          frequency: string
          id: string
          is_active: boolean | null
          item_id: string
          last_occurrence_date: string | null
          next_occurrence_date: string | null
          reminder_location: string | null
          reminder_time: string | null
          reminder_type: string | null
          times_per_week: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_interval_days?: number | null
          days_of_week?: number[] | null
          frequency: string
          id?: string
          is_active?: boolean | null
          item_id: string
          last_occurrence_date?: string | null
          next_occurrence_date?: string | null
          reminder_location?: string | null
          reminder_time?: string | null
          reminder_type?: string | null
          times_per_week?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_interval_days?: number | null
          days_of_week?: number[] | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          item_id?: string
          last_occurrence_date?: string | null
          next_occurrence_date?: string | null
          reminder_location?: string | null
          reminder_time?: string | null
          reminder_type?: string | null
          times_per_week?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_this_week_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_today_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_worries_vault_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string | null
          dismissed_at: string | null
          id: string
          is_quiet_hours_bypass: boolean | null
          item_id: string
          recurring_item_id: string | null
          reminder_text: string | null
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          snooze_until: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          is_quiet_hours_bypass?: boolean | null
          item_id: string
          recurring_item_id?: string | null
          reminder_text?: string | null
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          snooze_until?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          is_quiet_hours_bypass?: boolean | null
          item_id?: string
          recurring_item_id?: string | null
          reminder_text?: string | null
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          snooze_until?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_this_week_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_today_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "user_worries_vault_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_recurring_item_id_fkey"
            columns: ["recurring_item_id"]
            isOneToOne: false
            referencedRelation: "recurring_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_tags: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          suggested_for_users: boolean | null
          tag: string
          tag_category: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          suggested_for_users?: boolean | null
          tag: string
          tag_category?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          suggested_for_users?: boolean | null
          tag?: string
          tag_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sample_tags_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          ai_suggestion_level: string | null
          color_scheme: string | null
          compact_mode: boolean | null
          created_at: string | null
          enable_behavioral_learning: boolean | null
          enable_location_reminders: boolean | null
          enable_mood_tracking: boolean | null
          enable_spiral_detection: boolean | null
          haptic_feedback_enabled: boolean | null
          id: string
          notification_style: string | null
          sound_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_suggestion_level?: string | null
          color_scheme?: string | null
          compact_mode?: boolean | null
          created_at?: string | null
          enable_behavioral_learning?: boolean | null
          enable_location_reminders?: boolean | null
          enable_mood_tracking?: boolean | null
          enable_spiral_detection?: boolean | null
          haptic_feedback_enabled?: boolean | null
          id?: string
          notification_style?: string | null
          sound_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_suggestion_level?: string | null
          color_scheme?: string | null
          compact_mode?: boolean | null
          created_at?: string | null
          enable_behavioral_learning?: boolean | null
          enable_location_reminders?: boolean | null
          enable_mood_tracking?: boolean | null
          enable_spiral_detection?: boolean | null
          haptic_feedback_enabled?: boolean | null
          id?: string
          notification_style?: string | null
          sound_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          anxiety_type: string | null
          created_at: string | null
          email: string
          id: string
          last_active_at: string | null
          max_reminders_per_day: number | null
          notification_enabled: boolean | null
          preferred_language: string | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string | null
          total_dumps: number | null
          total_items: number | null
          updated_at: string | null
        }
        Insert: {
          anxiety_type?: string | null
          created_at?: string | null
          email: string
          id?: string
          last_active_at?: string | null
          max_reminders_per_day?: number | null
          notification_enabled?: boolean | null
          preferred_language?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          total_dumps?: number | null
          total_items?: number | null
          updated_at?: string | null
        }
        Update: {
          anxiety_type?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_active_at?: string | null
          max_reminders_per_day?: number | null
          notification_enabled?: boolean | null
          preferred_language?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          total_dumps?: number | null
          total_items?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      voice_dumps: {
        Row: {
          ai_model_version: string | null
          ai_processing_time_ms: number | null
          audio_duration_seconds: number | null
          created_at: string | null
          error_message: string | null
          id: string
          processed_at: string | null
          processing_status: string | null
          transcription: string
          transcription_confidence: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_model_version?: string | null
          ai_processing_time_ms?: number | null
          audio_duration_seconds?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          processing_status?: string | null
          transcription: string
          transcription_confidence?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_model_version?: string | null
          ai_processing_time_ms?: number | null
          audio_duration_seconds?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed_at?: string | null
          processing_status?: string | null
          transcription?: string
          transcription_confidence?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_dumps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_this_week_view: {
        Row: {
          category: string | null
          category_id: string | null
          due_date: string | null
          id: string | null
          priority: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_today_view: {
        Row: {
          category: string | null
          category_id: string | null
          due_date: string | null
          due_time: string | null
          final_priority_score: number | null
          id: string | null
          priority: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_worries_vault_view: {
        Row: {
          created_at: string | null
          id: string | null
          is_worry_spiral: boolean | null
          priority: string | null
          spiral_breakdown: Json | null
          tags: string[] | null
          title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
