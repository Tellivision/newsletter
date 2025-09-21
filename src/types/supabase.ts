export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      subscribers: {
        Row: {
          id: string
          email: string
          name: string | null
          status: 'active' | 'unsubscribed' | 'bounced'
          tags: string[] | null
          subscribed_at: string
          unsubscribed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          status?: 'active' | 'unsubscribed' | 'bounced'
          tags?: string[] | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          status?: 'active' | 'unsubscribed' | 'bounced'
          tags?: string[] | null
          subscribed_at?: string
          unsubscribed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          id: string
          user_id: string
          subject: string
          content: string
          preview_text: string | null
          status: 'draft' | 'scheduled' | 'sent' | 'failed'
          scheduled_at: string | null
          sent_at: string | null
          recipient_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          content: string
          preview_text?: string | null
          status?: 'draft' | 'scheduled' | 'sent' | 'failed'
          scheduled_at?: string | null
          sent_at?: string | null
          recipient_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          content?: string
          preview_text?: string | null
          status?: 'draft' | 'scheduled' | 'sent' | 'failed'
          scheduled_at?: string | null
          sent_at?: string | null
          recipient_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletters_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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