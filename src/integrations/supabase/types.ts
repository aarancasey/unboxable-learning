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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          created_at: string | null
          help_content: string | null
          help_title: string | null
          id: string
          intro_text: string | null
          story_content: string | null
          story_title: string | null
          title: string
          updated_at: string | null
          values_content: Json | null
          values_title: string | null
        }
        Insert: {
          created_at?: string | null
          help_content?: string | null
          help_title?: string | null
          id?: string
          intro_text?: string | null
          story_content?: string | null
          story_title?: string | null
          title: string
          updated_at?: string | null
          values_content?: Json | null
          values_title?: string | null
        }
        Update: {
          created_at?: string | null
          help_content?: string | null
          help_title?: string | null
          id?: string
          intro_text?: string | null
          story_content?: string | null
          story_title?: string | null
          title?: string
          updated_at?: string | null
          values_content?: Json | null
          values_title?: string | null
        }
        Relationships: []
      }
      admin_credentials: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password_hash: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password_hash: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password_hash?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          role: string
          sources: Json | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role: string
          sources?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          role?: string
          sources?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_rubrics: {
        Row: {
          category_id: string | null
          content_library_id: string | null
          created_at: string
          criteria: Json
          id: string
          name: string
          scoring_scale: Json
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          content_library_id?: string | null
          created_at?: string
          criteria: Json
          id?: string
          name: string
          scoring_scale: Json
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          content_library_id?: string | null
          created_at?: string
          criteria?: Json
          id?: string
          name?: string
          scoring_scale?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_rubrics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_rubrics_content_library_id_fkey"
            columns: ["content_library_id"]
            isOneToOne: false
            referencedRelation: "content_library"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string
          body: string
          category: string | null
          created_at: string
          edited_by: string | null
          featured: boolean | null
          featured_image_url: string | null
          id: string
          last_edited_at: string | null
          meta_description: string | null
          meta_title: string | null
          publish_date: string
          published: boolean
          published_at: string | null
          slug: string
          status: string | null
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          body: string
          category?: string | null
          created_at?: string
          edited_by?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          last_edited_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          publish_date?: string
          published?: boolean
          published_at?: string | null
          slug: string
          status?: string | null
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          body?: string
          category?: string | null
          created_at?: string
          edited_by?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          last_edited_at?: string | null
          meta_description?: string | null
          meta_title?: string | null
          publish_date?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          status?: string | null
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_content: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          form_subtitle: string | null
          form_title: string | null
          id: string
          office_hours: string | null
          phone: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          form_subtitle?: string | null
          form_title?: string | null
          id?: string
          office_hours?: string | null
          phone?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          form_subtitle?: string | null
          form_title?: string | null
          id?: string
          office_hours?: string | null
          phone?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          ai_generated: boolean | null
          confidence_score: number | null
          created_at: string
          description: string | null
          framework_section: string | null
          id: string
          name: string
          source_document_id: string | null
          suggested_merge_candidates: string[] | null
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          framework_section?: string | null
          id?: string
          name: string
          source_document_id?: string | null
          suggested_merge_candidates?: string[] | null
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          framework_section?: string | null
          id?: string
          name?: string
          source_document_id?: string | null
          suggested_merge_candidates?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      content_library: {
        Row: {
          category_id: string | null
          content_type: string
          created_at: string
          extracted_content: string
          file_url: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          original_filename: string | null
          tags: string[] | null
          title: string
          updated_at: string
          version: number | null
        }
        Insert: {
          category_id?: string | null
          content_type: string
          created_at?: string
          extracted_content: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          original_filename?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          version?: number | null
        }
        Update: {
          category_id?: string | null
          content_type?: string
          created_at?: string
          extracted_content?: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          original_filename?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_library_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      content_versions: {
        Row: {
          change_summary: string | null
          content: Json
          created_at: string | null
          created_by: string
          id: string
          is_current: boolean | null
          page_slug: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          content: Json
          created_at?: string | null
          created_by: string
          id?: string
          is_current?: boolean | null
          page_slug: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string
          id?: string
          is_current?: boolean | null
          page_slug?: string
          version_number?: number
        }
        Relationships: []
      }
      course_schedules: {
        Row: {
          color: string | null
          course_id: string
          course_name: string
          created_at: string
          description: string | null
          duration_type: string | null
          duration_value: number | null
          duration_weeks: number
          email_schedule_config: Json | null
          end_date: string
          enrolled_count: number
          id: string
          instructor: string | null
          location: string | null
          logo_url: string | null
          max_enrollment: number
          module_unlock_schedule: Json | null
          pre_course_survey_date: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          course_id: string
          course_name: string
          created_at?: string
          description?: string | null
          duration_type?: string | null
          duration_value?: number | null
          duration_weeks?: number
          email_schedule_config?: Json | null
          end_date: string
          enrolled_count?: number
          id?: string
          instructor?: string | null
          location?: string | null
          logo_url?: string | null
          max_enrollment: number
          module_unlock_schedule?: Json | null
          pre_course_survey_date?: string | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          course_id?: string
          course_name?: string
          created_at?: string
          description?: string | null
          duration_type?: string | null
          duration_value?: number | null
          duration_weeks?: number
          email_schedule_config?: Json | null
          end_date?: string
          enrolled_count?: number
          id?: string
          instructor?: string | null
          location?: string | null
          logo_url?: string | null
          max_enrollment?: number
          module_unlock_schedule?: Json | null
          pre_course_survey_date?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_timeline_events: {
        Row: {
          course_schedule_id: string | null
          created_at: string | null
          email_template_id: string | null
          event_data: Json | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          status: string | null
          target_recipients: Json | null
        }
        Insert: {
          course_schedule_id?: string | null
          created_at?: string | null
          email_template_id?: string | null
          event_data?: Json | null
          event_date: string
          event_time?: string | null
          event_type: string
          id?: string
          status?: string | null
          target_recipients?: Json | null
        }
        Update: {
          course_schedule_id?: string | null
          created_at?: string | null
          email_template_id?: string | null
          event_data?: Json | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          status?: string | null
          target_recipients?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "course_timeline_events_course_schedule_id_fkey"
            columns: ["course_schedule_id"]
            isOneToOne: false
            referencedRelation: "course_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_timeline_events_email_template_id_fkey"
            columns: ["email_template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          duration: string | null
          id: number
          logo_url: string | null
          max_enrollment: number | null
          module_list: Json | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: number
          logo_url?: string | null
          max_enrollment?: number | null
          module_list?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: number
          logo_url?: string | null
          max_enrollment?: number | null
          module_list?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          campaign_type: string
          course_schedule_id: string
          created_at: string
          email_content: string
          email_subject: string
          id: string
          recipient_email: string
          scheduled_date: string
          scheduled_time: string
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_type: string
          course_schedule_id: string
          created_at?: string
          email_content: string
          email_subject: string
          id?: string
          recipient_email: string
          scheduled_date: string
          scheduled_time: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          campaign_type?: string
          course_schedule_id?: string
          created_at?: string
          email_content?: string
          email_subject?: string
          id?: string
          recipient_email?: string
          scheduled_date?: string
          scheduled_time?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_course_schedule_id_fkey"
            columns: ["course_schedule_id"]
            isOneToOne: false
            referencedRelation: "course_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          content_template: string
          created_at: string | null
          html_template: string | null
          id: string
          is_default: boolean | null
          subject_template: string
          template_name: string
          template_type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          content_template: string
          created_at?: string | null
          html_template?: string | null
          id?: string
          is_default?: boolean | null
          subject_template: string
          template_name: string
          template_type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          content_template?: string
          created_at?: string | null
          html_template?: string | null
          id?: string
          is_default?: boolean | null
          subject_template?: string
          template_name?: string
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          background_image_url: string | null
          created_at: string | null
          cta_text: string | null
          cta_url: string | null
          id: string
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_image_url?: string | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          id?: string
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_image_url?: string | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          id?: string
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      insights_content: {
        Row: {
          created_at: string | null
          hero_description: string
          hero_title: string
          id: string
          topic_cards: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hero_description: string
          hero_title: string
          id?: string
          topic_cards?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hero_description?: string
          hero_title?: string
          id?: string
          topic_cards?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          confidence_score: number | null
          content: string
          content_library_id: string | null
          created_at: string
          id: string
          keywords: string[] | null
          knowledge_type: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          content: string
          content_library_id?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          knowledge_type?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          content?: string
          content_library_id?: string | null
          created_at?: string
          id?: string
          keywords?: string[] | null
          knowledge_type?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_content_library_id_fkey"
            columns: ["content_library_id"]
            isOneToOne: false
            referencedRelation: "content_library"
            referencedColumns: ["id"]
          },
        ]
      }
      learners: {
        Row: {
          cohort: string | null
          created_at: string | null
          email: string
          id: number
          name: string
          password: string | null
          requires_password_change: boolean | null
          role: string
          status: string
          survey_access_enabled: boolean | null
          team: string
          updated_at: string | null
        }
        Insert: {
          cohort?: string | null
          created_at?: string | null
          email: string
          id?: number
          name: string
          password?: string | null
          requires_password_change?: boolean | null
          role: string
          status?: string
          survey_access_enabled?: boolean | null
          team: string
          updated_at?: string | null
        }
        Update: {
          cohort?: string | null
          created_at?: string | null
          email?: string
          id?: number
          name?: string
          password?: string | null
          requires_password_change?: boolean | null
          role?: string
          status?: string
          survey_access_enabled?: boolean | null
          team?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      learning_insights: {
        Row: {
          confidence: number | null
          created_at: string
          description: string
          id: string
          insight_type: string
          related_documents: Json | null
          title: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          description: string
          id?: string
          insight_type: string
          related_documents?: Json | null
          title: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          description?: string
          id?: string
          insight_type?: string
          related_documents?: Json | null
          title?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string | null
          file_url: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          file_url: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          file_url?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      Media: {
        Row: {
          id: number
          Type: string | null
          Uploaded_at: string | null
          Url: string
        }
        Insert: {
          id?: number
          Type?: string | null
          Uploaded_at?: string | null
          Url?: string
        }
        Update: {
          id?: number
          Type?: string | null
          Uploaded_at?: string | null
          Url?: string
        }
        Relationships: []
      }
      module_schedules: {
        Row: {
          course_schedule_id: string
          created_at: string
          email_notification_date: string
          id: string
          is_unlocked: boolean
          module_id: string
          module_title: string
          module_type: string
          unlock_date: string
          unlock_time: string
          week_number: number
        }
        Insert: {
          course_schedule_id: string
          created_at?: string
          email_notification_date: string
          id?: string
          is_unlocked?: boolean
          module_id: string
          module_title: string
          module_type: string
          unlock_date: string
          unlock_time: string
          week_number: number
        }
        Update: {
          course_schedule_id?: string
          created_at?: string
          email_notification_date?: string
          id?: string
          is_unlocked?: boolean
          module_id?: string
          module_title?: string
          module_type?: string
          unlock_date?: string
          unlock_time?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "module_schedules_course_schedule_id_fkey"
            columns: ["course_schedule_id"]
            isOneToOne: false
            referencedRelation: "course_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      participant_progress: {
        Row: {
          course_schedule_id: string
          created_at: string
          id: string
          last_activity_at: string
          modules_completed: Json
          participant_email: string
          participant_name: string | null
          survey_completed: boolean
          survey_completed_at: string | null
        }
        Insert: {
          course_schedule_id: string
          created_at?: string
          id?: string
          last_activity_at?: string
          modules_completed?: Json
          participant_email: string
          participant_name?: string | null
          survey_completed?: boolean
          survey_completed_at?: string | null
        }
        Update: {
          course_schedule_id?: string
          created_at?: string
          id?: string
          last_activity_at?: string
          modules_completed?: Json
          participant_email?: string
          participant_name?: string | null
          survey_completed?: boolean
          survey_completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_progress_course_schedule_id_fkey"
            columns: ["course_schedule_id"]
            isOneToOne: false
            referencedRelation: "course_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      post_categories: {
        Row: {
          category_id: string
          post_id: string
        }
        Insert: {
          category_id: string
          post_id: string
        }
        Update: {
          category_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_revisions: {
        Row: {
          content: Json
          id: string
          post_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content: Json
          id?: string
          post_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          post_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_revisions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_revisions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      Posts: {
        Row: {
          Author_id: string | null
          Content: string | null
          created_at: string
          id: number
          Slug: string | null
          Title: string | null
          Updated_at: string | null
        }
        Insert: {
          Author_id?: string | null
          Content?: string | null
          created_at?: string
          id?: number
          Slug?: string | null
          Title?: string | null
          Updated_at?: string | null
        }
        Update: {
          Author_id?: string | null
          Content?: string | null
          created_at?: string
          id?: number
          Slug?: string | null
          Title?: string | null
          Updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services_content: {
        Row: {
          created_at: string | null
          id: string
          methodology_content: string | null
          methodology_title: string | null
          services: Json
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          methodology_content?: string | null
          methodology_title?: string | null
          services: Json
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          methodology_content?: string | null
          methodology_title?: string | null
          services?: Json
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      Settings: {
        Row: {
          id: string
          Site_logo: string | null
          Site_name: string
          Theme: string | null
        }
        Insert: {
          id?: string
          Site_logo?: string | null
          Site_name?: string
          Theme?: string | null
        }
        Update: {
          id?: string
          Site_logo?: string | null
          Site_name?: string
          Theme?: string | null
        }
        Relationships: []
      }
      survey_progress: {
        Row: {
          answers: Json
          created_at: string
          current_question: number
          current_section: number
          id: string
          participant_info: Json | null
          survey_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          current_question?: number
          current_section?: number
          id?: string
          participant_info?: Json | null
          survey_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          current_question?: number
          current_section?: number
          id?: string
          participant_info?: Json | null
          survey_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      survey_submissions: {
        Row: {
          id: number
          learner_id: number | null
          learner_name: string
          responses: Json
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          id?: number
          learner_id?: number | null
          learner_name: string
          responses: Json
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          id?: number
          learner_id?: number | null
          learner_name?: string
          responses?: Json
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_submissions_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author: string
          company: string | null
          created_at: string | null
          id: string
          quote: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          author: string
          company?: string | null
          created_at?: string | null
          id?: string
          quote: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          author?: string
          company?: string | null
          created_at?: string | null
          id?: string
          quote?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          role: string | null
        }
        Insert: {
          auth_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          auth_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string | null
        }
        Relationships: []
      }
      Users: {
        Row: {
          created_at: string
          Email: string
          id: number
        }
        Insert: {
          created_at?: string
          Email?: string
          id?: number
        }
        Update: {
          created_at?: string
          Email?: string
          id?: number
        }
        Relationships: []
      }
      why_choose_us_content: {
        Row: {
          created_at: string | null
          id: string
          reasons: Json
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reasons: Json
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reasons?: Json
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_learner: {
        Args: { learner_id_input: number }
        Returns: boolean
      }
      authenticate_admin: {
        Args: { email_input: string; password_input: string }
        Returns: boolean
      }
      authenticate_learner: {
        Args: { email_input: string; password_input?: string }
        Returns: {
          email: string
          id: number
          name: string
          password_valid: boolean
          requires_password_change: boolean
          status: string
        }[]
      }
      check_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_count: number
        }[]
      }
      create_content_version: {
        Args: { _change_summary?: string; _content: Json; _page_slug: string }
        Returns: string
      }
      get_current_user_email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_learner_for_auth: {
        Args: { email_input: string }
        Returns: {
          email: string
          id: number
          name: string
          status: string
        }[]
      }
      has_cms_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_learner_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_portal_access: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | { role_name: string }
        Returns: boolean
      }
      is_learner_owner: {
        Args: { learner_email: string }
        Returns: boolean
      }
      update_learner_password: {
        Args: { learner_id_input: number; new_password_input: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "content_manager"
        | "viewer"
        | "facilitator"
        | "learner"
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
      app_role: [
        "admin",
        "content_manager",
        "viewer",
        "facilitator",
        "learner",
      ],
    },
  },
} as const
