/*
  # Seed Initial Data for Voxera

  1. Default Gifts
    - Basic emotional reactions
    - Premium gifts with higher values

  2. Sound Effects
    - Reaction sounds
    - Musical effects
    - Notification sounds

  3. System Data
    - Default categories
    - Initial configuration
*/

-- Insert default gifts
INSERT INTO public.gifts (name, icon, animation_url, price, category) VALUES
('Heart', '❤️', '/animations/heart.json', 10, 'emotions'),
('Star', '⭐', '/animations/star.json', 25, 'achievements'),
('Fire', '🔥', '/animations/fire.json', 50, 'reactions'),
('Diamond', '💎', '/animations/diamond.json', 100, 'premium'),
('Crown', '👑', '/animations/crown.json', 200, 'premium'),
('Rocket', '🚀', '/animations/rocket.json', 150, 'achievements'),
('Clap', '👏', '/animations/clap.json', 5, 'reactions'),
('Rose', '🌹', '/animations/rose.json', 75, 'emotions'),
('Trophy', '🏆', '/animations/trophy.json', 300, 'premium'),
('Lightning', '⚡', '/animations/lightning.json', 80, 'reactions')
ON CONFLICT DO NOTHING;

-- Insert default sound effects
INSERT INTO public.sound_effects (name, audio_url, icon, category, duration) VALUES
('Applause', '/sounds/applause.mp3', '👏', 'reactions', 3),
('Drum Roll', '/sounds/drumroll.mp3', '🥁', 'music', 5),
('Air Horn', '/sounds/airhorn.mp3', '📯', 'effects', 2),
('Bell', '/sounds/bell.mp3', '🔔', 'notifications', 1),
('Whistle', '/sounds/whistle.mp3', '🎵', 'effects', 2),
('Laugh Track', '/sounds/laugh.mp3', '😂', 'reactions', 4),
('Wow', '/sounds/wow.mp3', '😮', 'reactions', 2),
('Boo', '/sounds/boo.mp3', '👎', 'reactions', 3),
('Cheer', '/sounds/cheer.mp3', '🎉', 'reactions', 4),
('Silence', '/sounds/silence.mp3', '🤫', 'effects', 1)
ON CONFLICT DO NOTHING;