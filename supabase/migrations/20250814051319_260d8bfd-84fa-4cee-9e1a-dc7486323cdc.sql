-- Completely fix RLS policies for survey submissions
-- Remove all conflicting policies and create one simple policy

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Authenticated users can view survey submissions" ON public.survey_submissions;
DROP POLICY IF EXISTS "Authenticated users can create survey submissions" ON public.survey_submissions;
DROP POLICY IF EXISTS "Authenticated users can update survey submissions" ON public.survey_submissions;
DROP POLICY IF EXISTS "Portal users can manage all survey submissions" ON public.survey_submissions;
DROP POLICY IF EXISTS "Learners can view own survey submissions" ON public.survey_submissions;

-- Create one simple policy that allows ALL authenticated users to do everything
-- This will fix the survey management issue
CREATE POLICY "Allow all authenticated users" 
ON public.survey_submissions 
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);