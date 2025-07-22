-- Fix content library RLS policies that are missing

-- Re-enable RLS on content_library table and create proper policies
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to access content library
CREATE POLICY "Authenticated users can view content library" 
ON public.content_library 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert content library" 
ON public.content_library 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update content library" 
ON public.content_library 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete content library" 
ON public.content_library 
FOR DELETE 
USING (auth.uid() IS NOT NULL);