/**
 * Supabase database types.
 *
 * Hand-authored to match supabase/migrations/001_initial_schema.sql.
 * To regenerate from the live/local database once the Supabase CLI is linked:
 *
 *   pnpm db:types        # supabase gen types typescript --local
 *
 * Keep this file in sync with the migrations until generation is wired up.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['admins']['Insert']>;
        Relationships: [];
      };
      revision_requests: {
        Row: {
          id: string;
          requester: string;
          body: string;
          urgency: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          requester: string;
          body: string;
          urgency?: number;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['revision_requests']['Insert']>;
        Relationships: [];
      };
      revision_comments: {
        Row: {
          id: string;
          revision_id: string;
          author: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          revision_id: string;
          author: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['revision_comments']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'revision_comments_revision_id_fkey';
            columns: ['revision_id'];
            referencedRelation: 'revision_requests';
            referencedColumns: ['id'];
          },
        ];
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>;
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content_md: string | null;
          content_json: Json | null;
          seo_title: string | null;
          seo_description: string | null;
          og_image_url: string | null;
          status: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string | null;
          content_md?: string | null;
          content_json?: Json | null;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          status?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['pages']['Insert']>;
        Relationships: [];
      };
      menu_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['menu_categories']['Insert']>;
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number | null;
          currency: string;
          image_url: string | null;
          tags: string[];
          allergens: string[];
          dietary_flags: string[];
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price?: number | null;
          currency?: string;
          image_url?: string | null;
          tags?: string[];
          allergens?: string[];
          dietary_flags?: string[];
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'menu_items_category_id_fkey';
            columns: ['category_id'];
            referencedRelation: 'menu_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      media_assets: {
        Row: {
          id: string;
          source_url: string | null;
          storage_path: string | null;
          alt: string | null;
          title: string | null;
          caption: string | null;
          width: number | null;
          height: number | null;
          mime_type: string | null;
          context: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_url?: string | null;
          storage_path?: string | null;
          alt?: string | null;
          title?: string | null;
          caption?: string | null;
          width?: number | null;
          height?: number | null;
          mime_type?: string | null;
          context?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['media_assets']['Insert']>;
        Relationships: [];
      };
      reservation_requests: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          party_size: number;
          requested_date: string;
          requested_time: string;
          message: string | null;
          status: string;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          party_size: number;
          requested_date: string;
          requested_time: string;
          message?: string | null;
          status?: string;
          source?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reservation_requests']['Insert']>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          subject: string | null;
          message: string;
          status: string;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          subject?: string | null;
          message: string;
          status?: string;
          source?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['contact_messages']['Insert']>;
        Relationships: [];
      };
      redirects: {
        Row: {
          id: string;
          source_path: string;
          target_path: string;
          status_code: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_path: string;
          target_path: string;
          status_code?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['redirects']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
