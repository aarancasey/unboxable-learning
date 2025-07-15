-- Temporarily disable RLS on content_library to allow uploads without authentication
ALTER TABLE public.content_library DISABLE ROW LEVEL SECURITY;

-- Also create a public storage policy for content-library bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-library', 'content-library', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create permissive storage policies
CREATE POLICY "Anyone can upload to content-library" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'content-library');

CREATE POLICY "Anyone can view content-library files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'content-library');