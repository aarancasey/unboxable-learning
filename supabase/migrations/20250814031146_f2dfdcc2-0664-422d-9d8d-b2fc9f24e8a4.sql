-- Check current RLS policies on learners table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'learners';

-- Fix RLS policies for learners table to allow public read access for authentication
DROP POLICY IF EXISTS "Public can read learners for authentication" ON public.learners;
DROP POLICY IF EXISTS "Authenticated users can manage learners" ON public.learners;

-- Create a policy that allows anonymous users to read learners for authentication
CREATE POLICY "Allow anonymous read for authentication" 
ON public.learners 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Create a policy that allows authenticated users to manage learners
CREATE POLICY "Allow authenticated manage learners" 
ON public.learners 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);