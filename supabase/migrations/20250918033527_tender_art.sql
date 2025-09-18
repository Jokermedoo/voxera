/*
  # Database Functions for Voxera

  1. User Management Functions
    - handle_new_user() - Auto-create profile on signup
    - update_user_last_seen() - Track user activity

  2. Notification Functions
    - create_notification() - Create notifications with preferences check
    - mark_notification_read() - Mark single notification as read
    - mark_all_notifications_read() - Mark all user notifications as read

  3. Room Management Functions
    - update_room_participant_count() - Auto-update participant counts
    - cleanup_old_chat_messages() - Clean old chat messages

  4. Security Functions
    - Various triggers for data integrity
*/

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', null)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update room participant count
CREATE OR REPLACE FUNCTION public.update_room_participant_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.rooms 
    SET current_participants = (
      SELECT COUNT(*) FROM public.room_participants 
      WHERE room_id = NEW.room_id
    )
    WHERE id = NEW.room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.rooms 
    SET current_participants = (
      SELECT COUNT(*) FROM public.room_participants 
      WHERE room_id = OLD.room_id
    )
    WHERE id = OLD.room_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers for room participant count
DROP TRIGGER IF EXISTS update_room_count_on_join ON public.room_participants;
CREATE TRIGGER update_room_count_on_join
  AFTER INSERT ON public.room_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_room_participant_count();

DROP TRIGGER IF EXISTS update_room_count_on_leave ON public.room_participants;
CREATE TRIGGER update_room_count_on_leave
  AFTER DELETE ON public.room_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_room_participant_count();

-- Function to create notification with preferences check
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

-- Function to automatically clean old messages
CREATE OR REPLACE FUNCTION public.cleanup_old_chat_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Keep only the last 1000 messages per room
  DELETE FROM public.chat_messages
  WHERE id NOT IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY room_id ORDER BY created_at DESC) as rn
      FROM public.chat_messages
    ) ranked
    WHERE rn <= 1000
  );
END;
$$;

-- Function to update user last seen
CREATE OR REPLACE FUNCTION public.update_user_last_seen()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET updated_at = NOW() 
  WHERE id = auth.uid();
  RETURN NULL;
END;
$$;