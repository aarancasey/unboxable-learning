-- Add Learn More settings to settings table
INSERT INTO public.settings (key, value) VALUES 
  ('learn_more_enabled', 'false'),
  ('learn_more_title', 'Learn More About Our Program'),
  ('learn_more_content', 'Our comprehensive leadership program is designed to help you develop the skills needed for tomorrow''s challenges.')
ON CONFLICT (key) DO NOTHING;