-- Insert default gifts
INSERT INTO public.gifts (name, icon, animation_url, price) VALUES
('Heart', '❤️', '/animations/heart.json', 10),
('Star', '⭐', '/animations/star.json', 25),
('Fire', '🔥', '/animations/fire.json', 50),
('Diamond', '💎', '/animations/diamond.json', 100),
('Crown', '👑', '/animations/crown.json', 200),
('Rocket', '🚀', '/animations/rocket.json', 150),
('Clap', '👏', '/animations/clap.json', 5),
('Rose', '🌹', '/animations/rose.json', 75)
ON CONFLICT DO NOTHING;

-- Insert default sound effects
INSERT INTO public.sound_effects (name, audio_url, icon, category) VALUES
('Applause', '/sounds/applause.mp3', '👏', 'reactions'),
('Drum Roll', '/sounds/drumroll.mp3', '🥁', 'music'),
('Air Horn', '/sounds/airhorn.mp3', '📯', 'effects'),
('Bell', '/sounds/bell.mp3', '🔔', 'notifications'),
('Whistle', '/sounds/whistle.mp3', '🎵', 'effects'),
('Laugh Track', '/sounds/laugh.mp3', '😂', 'reactions'),
('Wow', '/sounds/wow.mp3', '😮', 'reactions'),
('Boo', '/sounds/boo.mp3', '👎', 'reactions')
ON CONFLICT DO NOTHING;
