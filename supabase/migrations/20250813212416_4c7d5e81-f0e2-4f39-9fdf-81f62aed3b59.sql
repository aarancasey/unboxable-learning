-- Drop the overly permissive policy that allows all operations for everyone
DROP POLICY "Allow all operations for demo" ON public.survey_submissions;

-- Create restrictive RLS policies for survey_submissions table

-- Portal users (admin, content_manager, facilitator) can manage all survey submissions
CREATE POLICY "Portal users can manage all survey submissions" 
ON public.survey_submissions 
FOR ALL 
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

-- Learners can only view their own survey submissions
CREATE POLICY "Learners can view own survey submissions" 
ON public.survey_submissions 
FOR SELECT 
USING (
  has_learner_access(auth.uid()) AND 
  learner_id IN (
    SELECT id FROM public.learners WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  )
);

-- Allow authenticated users to create survey submissions (for survey form submissions)
CREATE POLICY "Authenticated users can create survey submissions" 
ON public.survey_submissions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);