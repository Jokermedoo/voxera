/*
  # Initial Database Schema for Voxera

  1. New Tables
    - `profiles` - User profiles with extended information
    - `rooms` - Audio rooms for conversations
    - `room_participants` - Track users in rooms with roles
    - `room_invitations` - Private room invitation system
    - `gifts` - Digital gifts catalog
    - `gift_transactions` - Gift sending history
    - `sound_effects` - Audio effects library
    - `polls` - Live voting system
    - `poll_votes` - Poll voting records
    - `leaderboards` - Room-based achievements
    - `follows` - User following system
    - `chat_messages` - Real-time chat messages
    - `notifications` - User notification system
    - `notification_preferences` - User notification settings
    - `reports` - Content moderation reports
    - `admin_actions` - Admin action audit log

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Create secure functions for common operations

  3. Performance
    - Add indexes for frequently queried columns
    - Optimize for real-time operations
*/

-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table for audio rooms
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL CHECK (room_type IN ('public', 'private')),
  audio_mode TEXT NOT NULL CHECK (audio_mode IN ('conversation', 'music', 'podcast', 'broadcast')),
  max_participants INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  background_image TEXT,
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'ar',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_participants table for tracking who's in each room
CREATE TABLE IF NOT EXISTS public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('host', 'co-host', 'speaker', 'listener')),
  is_muted BOOLEAN DEFAULT FALSE,
  is_speaking BOOLEAN DEFAULT FALSE,
  mute_until TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create room_invitations table for private room invites
CREATE TABLE IF NOT EXISTS public.room_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, invitee_id)
);

-- Create gifts table for digital gifts
CREATE TABLE IF NOT EXISTS public.gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  animation_url TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gift_transactions table for tracking gift sending
CREATE TABLE IF NOT EXISTS public.gift_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  total_price INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sound_effects table for audio effects
CREATE TABLE IF NOT EXISTS public.sound_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create polls table for live voting
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create poll_votes table for tracking votes
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Create leaderboards table for room achievements
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create follows table for user connections
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create chat_messages table for real-time chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'gift', 'reaction')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table for storing user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'follow', 'room_invite', 'room_join', 'gift_received', 
    'mention', 'room_started', 'poll_created', 'achievement',
    'admin_warning', 'system_announcement'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_preferences table for user settings
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  follow_notifications BOOLEAN DEFAULT TRUE,
  room_invite_notifications BOOLEAN DEFAULT TRUE,
  gift_notifications BOOLEAN DEFAULT TRUE,
  mention_notifications BOOLEAN DEFAULT TRUE,
  room_notifications BOOLEAN DEFAULT TRUE,
  poll_notifications BOOLEAN DEFAULT TRUE,
  achievement_notifications BOOLEAN DEFAULT TRUE,
  admin_notifications BOOLEAN DEFAULT TRUE,
  system_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create reports table for user reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('spam', 'harassment', 'inappropriate_content', 'fake_account', 'other')),
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')) DEFAULT 'pending',
  admin_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_actions table for audit logging
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for rooms
CREATE POLICY "rooms_select_all" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert_own" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "rooms_update_host" ON public.rooms FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "rooms_delete_host" ON public.rooms FOR DELETE USING (auth.uid() = host_id);

-- RLS Policies for room_participants
CREATE POLICY "participants_select_all" ON public.room_participants FOR SELECT USING (true);
CREATE POLICY "participants_insert_own" ON public.room_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "participants_update_own_or_host" ON public.room_participants FOR UPDATE 
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT host_id FROM public.rooms WHERE id = room_id
  ));
CREATE POLICY "participants_delete_own_or_host" ON public.room_participants FOR DELETE 
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT host_id FROM public.rooms WHERE id = room_id
  ));

-- RLS Policies for room_invitations
CREATE POLICY "invitations_select_own" ON public.room_invitations FOR SELECT 
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY "invitations_insert_own" ON public.room_invitations FOR INSERT 
  WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "invitations_update_invitee" ON public.room_invitations FOR UPDATE 
  USING (auth.uid() = invitee_id);
CREATE POLICY "invitations_delete_own" ON public.room_invitations FOR DELETE 
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- RLS Policies for gifts (read-only for users)
CREATE POLICY "gifts_select_all" ON public.gifts FOR SELECT USING (true);

-- RLS Policies for gift_transactions
CREATE POLICY "gift_transactions_select_all" ON public.gift_transactions FOR SELECT USING (true);
CREATE POLICY "gift_transactions_insert_own" ON public.gift_transactions FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for sound_effects (read-only for users)
CREATE POLICY "sound_effects_select_all" ON public.sound_effects FOR SELECT USING (true);

-- RLS Policies for polls
CREATE POLICY "polls_select_all" ON public.polls FOR SELECT USING (true);
CREATE POLICY "polls_insert_own" ON public.polls FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "polls_update_creator" ON public.polls FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "polls_delete_creator" ON public.polls FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for poll_votes
CREATE POLICY "poll_votes_select_all" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "poll_votes_insert_own" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "poll_votes_update_own" ON public.poll_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "poll_votes_delete_own" ON public.poll_votes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for leaderboards
CREATE POLICY "leaderboards_select_all" ON public.leaderboards FOR SELECT USING (true);
CREATE POLICY "leaderboards_insert_own" ON public.leaderboards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leaderboards_update_own" ON public.leaderboards FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for follows
CREATE POLICY "follows_select_all" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for chat_messages
CREATE POLICY "chat_messages_select_room_participants" ON public.chat_messages FOR SELECT 
  USING (
    room_id IN (
      SELECT room_id FROM public.room_participants WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "chat_messages_insert_own" ON public.chat_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications (users can only see their own)
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for notification_preferences
CREATE POLICY "notification_preferences_select_own" ON public.notification_preferences FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "notification_preferences_insert_own" ON public.notification_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notification_preferences_update_own" ON public.notification_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "reports_select_own_or_admin" ON public.reports FOR SELECT 
  USING (
    auth.uid() = reporter_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('moderator', 'admin', 'super_admin')
    )
  );
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_update_admin" ON public.reports FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('moderator', 'admin', 'super_admin')
  ));

-- RLS Policies for admin_actions (admin only)
CREATE POLICY "admin_actions_select_admin" ON public.admin_actions FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));
CREATE POLICY "admin_actions_insert_admin" ON public.admin_actions FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON public.rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON public.rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON public.room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON public.room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_room_id ON public.gift_transactions(room_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_receiver_id ON public.gift_transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_polls_room_id ON public.polls(room_id);
CREATE INDEX IF NOT EXISTS idx_polls_is_active ON public.polls(is_active);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);