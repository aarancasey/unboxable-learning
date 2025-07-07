-- Create storage bucket for course logos
INSERT INTO storage.buckets (id, name, public) VALUES ('course-logos', 'course-logos', true);

-- Create policies for course logos bucket
CREATE POLICY "Course logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-logos');

CREATE POLICY "Authenticated users can upload course logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update course logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete course logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-logos' AND auth.uid() IS NOT NULL);

-- Add logo_url field to courses table
ALTER TABLE public.courses ADD COLUMN logo_url TEXT;

-- Add logo_url field to course_schedules table  
ALTER TABLE public.course_schedules ADD COLUMN logo_url TEXT;