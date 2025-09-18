-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sound_effects table for audio effects
CREATE TABLE IF NOT EXISTS public.sound_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create polls table for live voting
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
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
  achievements JSONB DEFAULT '[]',
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
  UNIQUE(follower_id, following_id)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON public.rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON public.rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON public.room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON public.room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_transactions_room_id ON public.gift_transactions(room_id);
CREATE INDEX IF NOT EXISTS idx_polls_room_id ON public.polls(room_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
