export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          is_verified: boolean
          role: 'user' | 'moderator' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          is_verified?: boolean
          role?: 'user' | 'moderator' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          is_verified?: boolean
          role?: 'user' | 'moderator' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          title: string
          description: string | null
          host_id: string
          room_type: 'public' | 'private'
          audio_mode: 'conversation' | 'music' | 'podcast' | 'broadcast'
          max_participants: number
          is_active: boolean
          background_image: string | null
          tags: string[]
          language: string
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          host_id: string
          room_type: 'public' | 'private'
          audio_mode: 'conversation' | 'music' | 'podcast' | 'broadcast'
          max_participants?: number
          is_active?: boolean
          background_image?: string | null
          tags?: string[]
          language?: string
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          host_id?: string
          room_type?: 'public' | 'private'
          audio_mode?: 'conversation' | 'music' | 'podcast' | 'broadcast'
          max_participants?: number
          is_active?: boolean
          background_image?: string | null
          tags?: string[]
          language?: string
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      room_participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          role: 'host' | 'co-host' | 'speaker' | 'listener'
          is_muted: boolean
          is_speaking: boolean
          mute_until: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          role: 'host' | 'co-host' | 'speaker' | 'listener'
          is_muted?: boolean
          is_speaking?: boolean
          mute_until?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          role?: 'host' | 'co-host' | 'speaker' | 'listener'
          is_muted?: boolean
          is_speaking?: boolean
          mute_until?: string | null
          joined_at?: string
        }
      }
      gifts: {
        Row: {
          id: string
          name: string
          icon: string
          animation_url: string | null
          price: number
          category: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          animation_url?: string | null
          price?: number
          category?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          animation_url?: string | null
          price?: number
          category?: string
          is_active?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: any
          is_read: boolean
          action_url: string | null
          sender_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: any
          is_read?: boolean
          action_url?: string | null
          sender_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: any
          is_read?: boolean
          action_url?: string | null
          sender_id?: string | null
          created_at?: string
        }
      }
    }
  }
}