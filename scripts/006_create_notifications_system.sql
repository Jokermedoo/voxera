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

-- Enable RLS on notifications tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_action_url TEXT DEFAULT NULL,
  p_sender_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  user_preferences RECORD;
BEGIN
  -- Get user notification preferences
  SELECT * INTO user_preferences 
  FROM public.notification_preferences 
  WHERE user_id = p_user_id;
  
  -- If no preferences exist, create default ones
  IF NOT FOUND THEN
    INSERT INTO public.notification_preferences (user_id) VALUES (p_user_id);
    SELECT * INTO user_preferences 
    FROM public.notification_preferences 
    WHERE user_id = p_user_id;
  END IF;
  
  -- Check if user wants this type of notification
  IF (
    (p_type = 'follow' AND user_preferences.follow_notifications) OR
    (p_type = 'room_invite' AND user_preferences.room_invite_notifications) OR
    (p_type = 'gift_received' AND user_preferences.gift_notifications) OR
    (p_type = 'mention' AND user_preferences.mention_notifications) OR
    (p_type IN ('room_join', 'room_started') AND user_preferences.room_notifications) OR
    (p_type = 'poll_created' AND user_preferences.poll_notifications) OR
    (p_type = 'achievement' AND user_preferences.achievement_notifications) OR
    (p_type = 'admin_warning' AND user_preferences.admin_notifications) OR
    (p_type = 'system_announcement' AND user_preferences.system_notifications)
  ) THEN
    -- Create the notification
    INSERT INTO public.notifications (
      user_id, type, title, message, data, action_url, sender_id
    ) VALUES (
      p_user_id, p_type, p_title, p_message, p_data, p_action_url, p_sender_id
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = TRUE 
  WHERE id = notification_id AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications 
  SET is_read = TRUE 
  WHERE user_id = auth.uid() AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
