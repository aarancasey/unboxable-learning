-- Enable RLS on learners table if not already enabled
ALTER TABLE public.learners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that may be causing issues
DROP POLICY IF EXISTS "Allow all authenticated users full access to learners" ON public.learners;

-- Create proper RLS policies for learners table
-- Allow anyone to read learners (needed for login verification)
CREATE POLICY "Public can read learners for authentication"
ON public.learners 
FOR SELECT 
USING (true);

-- Allow authenticated users to manage learners (for admin functions)
CREATE POLICY "Authenticated users can manage learners"
ON public.learners 
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);