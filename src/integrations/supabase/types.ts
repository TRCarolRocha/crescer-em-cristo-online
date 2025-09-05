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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      agenda_eventos: {
        Row: {
          criado_em: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          id: string
          local: string | null
          status: boolean | null
          titulo: string
        }
        Insert: {
          criado_em?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          id?: string
          local?: string | null
          status?: boolean | null
          titulo: string
        }
        Update: {
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          id?: string
          local?: string | null
          status?: boolean | null
          titulo?: string
        }
        Relationships: []
      }
      avisos: {
        Row: {
          ativo: boolean
          categoria: string | null
          created_at: string
          descricao: string | null
          id: string
          imagem_url: string | null
          ordem: number
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          ordem?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          ordem?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_questions: {
        Row: {
          content_id: string | null
          correct_answer: string | null
          created_at: string | null
          id: string
          options: Json | null
          ordem: number | null
          question: string
          question_type: string | null
        }
        Insert: {
          content_id?: string | null
          correct_answer?: string | null
          created_at?: string | null
          id?: string
          options?: Json | null
          ordem?: number | null
          question: string
          question_type?: string | null
        }
        Update: {
          content_id?: string | null
          correct_answer?: string | null
          created_at?: string | null
          id?: string
          options?: Json | null
          ordem?: number | null
          question?: string
          question_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_questions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "conteudos"
            referencedColumns: ["id"]
          },
        ]
      }
      conteudos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          ordem: number
          pdf_url: string | null
          texto: string | null
          titulo: string
          trilha_id: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          pdf_url?: string | null
          texto?: string | null
          titulo: string
          trilha_id: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          pdf_url?: string | null
          texto?: string | null
          titulo?: string
          trilha_id?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conteudos_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "discipleship_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      devocionais: {
        Row: {
          created_at: string
          data: string
          id: string
          pergunta_1: string
          pergunta_2: string
          pergunta_3: string
          referencia: string
          tema: string
          texto_central: string
          updated_at: string
          versiculo: string
        }
        Insert: {
          created_at?: string
          data: string
          id?: string
          pergunta_1: string
          pergunta_2: string
          pergunta_3: string
          referencia: string
          tema: string
          texto_central: string
          updated_at?: string
          versiculo: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          pergunta_1?: string
          pergunta_2?: string
          pergunta_3?: string
          referencia?: string
          tema?: string
          texto_central?: string
          updated_at?: string
          versiculo?: string
        }
        Relationships: []
      }
      devocional_historico: {
        Row: {
          aprendizado: string | null
          completado: boolean
          created_at: string
          devocional_id: string
          gratidao: string | null
          id: string
          oracao: string | null
          resposta_1: string | null
          resposta_2: string | null
          resposta_3: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aprendizado?: string | null
          completado?: boolean
          created_at?: string
          devocional_id: string
          gratidao?: string | null
          id?: string
          oracao?: string | null
          resposta_1?: string | null
          resposta_2?: string | null
          resposta_3?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aprendizado?: string | null
          completado?: boolean
          created_at?: string
          devocional_id?: string
          gratidao?: string | null
          id?: string
          oracao?: string | null
          resposta_1?: string | null
          resposta_2?: string | null
          resposta_3?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devocional_historico_devocional_id_fkey"
            columns: ["devocional_id"]
            isOneToOne: false
            referencedRelation: "devocionais"
            referencedColumns: ["id"]
          },
        ]
      }
      devocional_stats: {
        Row: {
          created_at: string
          id: string
          melhor_streak: number
          streak_atual: number
          total_completados: number
          ultimo_devocional: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          melhor_streak?: number
          streak_atual?: number
          total_completados?: number
          ultimo_devocional?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          melhor_streak?: number
          streak_atual?: number
          total_completados?: number
          ultimo_devocional?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      diagnosticos: {
        Row: {
          data_resposta: string | null
          id: string
          respostas: Json
          user_id: string | null
        }
        Insert: {
          data_resposta?: string | null
          id?: string
          respostas: Json
          user_id?: string | null
        }
        Update: {
          data_resposta?: string | null
          id?: string
          respostas?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      diagnostics: {
        Row: {
          answers: Json
          completed_at: string | null
          id: string
          result: string
          user_id: string
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          id?: string
          result: string
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          id?: string
          result?: string
          user_id?: string
        }
        Relationships: []
      }
      discipleship_tracks: {
        Row: {
          allowed_groups: string[] | null
          allowed_levels: string[] | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration: string | null
          id: string
          lessons: number | null
          level: string
          title: string
          topics: string[] | null
        }
        Insert: {
          allowed_groups?: string[] | null
          allowed_levels?: string[] | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          id?: string
          lessons?: number | null
          level: string
          title: string
          topics?: string[] | null
        }
        Update: {
          allowed_groups?: string[] | null
          allowed_levels?: string[] | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          id?: string
          lessons?: number | null
          level?: string
          title?: string
          topics?: string[] | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string
          id: string
          registered_at: string | null
          user_id: string
        }
        Insert: {
          event_id: string
          id?: string
          registered_at?: string | null
          user_id: string
        }
        Update: {
          event_id?: string
          id?: string
          registered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          event_date: string
          event_time: string
          id: string
          location: string | null
          max_participants: number | null
          organizer: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          event_date: string
          event_time: string
          id?: string
          location?: string | null
          max_participants?: number | null
          organizer?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          event_date?: string
          event_time?: string
          id?: string
          location?: string | null
          max_participants?: number | null
          organizer?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      member_groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          conteudo: string
          destinatario_id: string | null
          enviada_em: string | null
          id: string
          lida: boolean | null
          remetente_id: string
        }
        Insert: {
          conteudo: string
          destinatario_id?: string | null
          enviada_em?: string | null
          id?: string
          lida?: boolean | null
          remetente_id: string
        }
        Update: {
          conteudo?: string
          destinatario_id?: string | null
          enviada_em?: string | null
          id?: string
          lida?: boolean | null
          remetente_id?: string
        }
        Relationships: []
      }
      message_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          message_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          message_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_comments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_likes: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_likes_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          group_id: string | null
          id: string
          image_url: string | null
          type: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          image_url?: string | null
          type?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          image_url?: string | null
          type?: string | null
        }
        Relationships: []
      }
      ministerios_departamentos: {
        Row: {
          id: string
          nome: string
        }
        Insert: {
          id?: string
          nome: string
        }
        Update: {
          id?: string
          nome?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          notification_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          notification_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          notification_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          birth_date: string | null
          created_at: string | null
          department: string | null
          full_name: string | null
          id: string
          ministry: string | null
          phone: string | null
          role: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          department?: string | null
          full_name?: string | null
          id: string
          ministry?: string | null
          phone?: string | null
          role?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          created_at?: string | null
          department?: string | null
          full_name?: string | null
          id?: string
          ministry?: string | null
          phone?: string | null
          role?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      study_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          leader_id: string
          max_members: number | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          leader_id: string
          max_members?: number | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          leader_id?: string
          max_members?: number | null
          name?: string
        }
        Relationships: []
      }
      user_content_progress: {
        Row: {
          answered_questions: boolean | null
          completed: boolean | null
          completed_at: string | null
          content_id: string | null
          created_at: string | null
          downloaded_pdf: boolean | null
          id: string
          read_text: boolean | null
          time_spent: number | null
          updated_at: string | null
          user_id: string
          watched_video: boolean | null
        }
        Insert: {
          answered_questions?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          content_id?: string | null
          created_at?: string | null
          downloaded_pdf?: boolean | null
          id?: string
          read_text?: boolean | null
          time_spent?: number | null
          updated_at?: string | null
          user_id: string
          watched_video?: boolean | null
        }
        Update: {
          answered_questions?: boolean | null
          completed?: boolean | null
          completed_at?: string | null
          content_id?: string | null
          created_at?: string | null
          downloaded_pdf?: boolean | null
          id?: string
          read_text?: boolean | null
          time_spent?: number | null
          updated_at?: string | null
          user_id?: string
          watched_video?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_content_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "conteudos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_question_responses: {
        Row: {
          answered_at: string | null
          id: string
          is_correct: boolean | null
          question_id: string | null
          response: string
          user_id: string
        }
        Insert: {
          answered_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          response: string
          user_id: string
        }
        Update: {
          answered_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          response?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "content_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_track_progress: {
        Row: {
          completed_at: string | null
          id: string
          progress: number | null
          started_at: string | null
          track_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          progress?: number | null
          started_at?: string | null
          track_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          progress?: number | null
          started_at?: string | null
          track_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_track_progress_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "discipleship_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
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
