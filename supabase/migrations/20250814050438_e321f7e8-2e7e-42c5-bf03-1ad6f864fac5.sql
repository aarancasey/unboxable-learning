-- Fix RLS policy for survey submissions to allow authenticated users to view all submissions
-- This is needed for admin/portal users to see survey management

-- First, let's create a more permissive policy for authenticated users to view all survey submissions
CREATE POLICY "Authenticated users can view all survey submissions" 
ON public.survey_submissions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);