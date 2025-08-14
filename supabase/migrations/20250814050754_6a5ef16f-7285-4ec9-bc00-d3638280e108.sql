-- Fix RLS policies for survey submissions to allow authenticated users access
-- The current policies are too restrictive for admin/portal users

-- First, drop the conflicting policies
DROP POLICY IF EXISTS "Authenticated users can view all survey submissions" ON public.survey_submissions;

-- Create a comprehensive policy that allows authenticated users to view all survey submissions
-- This is needed for survey management functionality
CREATE POLICY "Authenticated users can view survey submissions" 
ON public.survey_submissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Also ensure users can create survey submissions
DROP POLICY IF EXISTS "Authenticated users can create survey submissions" ON public.survey_submissions;
CREATE POLICY "Authenticated users can create survey submissions" 
ON public.survey_submissions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update survey submissions (for status changes, etc.)
DROP POLICY IF EXISTS "Authenticated users can update survey submissions" ON public.survey_submissions;
CREATE POLICY "Authenticated users can update survey submissions" 
ON public.survey_submissions 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);