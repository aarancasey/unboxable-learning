-- Critical Security Fixes for Survey and Learner Data

-- Enable RLS on survey_submissions table
ALTER TABLE public.survey_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all operations for demo" ON public.survey_submissions;

-- Create secure RLS policies for survey_submissions based on learner_id
CREATE POLICY "Learners can view own survey submissions"
ON public.survey_submissions
FOR SELECT
USING (
  -- Allow if current user's email matches the learner_id in learners table
  EXISTS (
    SELECT 1 FROM public.learners l 
    WHERE l.id = survey_submissions.learner_id 
    AND l.email = get_current_user_email()
  ) OR 
  has_portal_access(auth.uid())
);

CREATE POLICY "Learners can insert own survey submissions"
ON public.survey_submissions
FOR INSERT
WITH CHECK (
  -- Allow if current user's email matches the learner_id in learners table
  EXISTS (
    SELECT 1 FROM public.learners l 
    WHERE l.id = survey_submissions.learner_id 
    AND l.email = get_current_user_email()
  ) OR 
  has_portal_access(auth.uid())
);

CREATE POLICY "Portal users can update survey submissions"
ON public.survey_submissions
FOR UPDATE
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

CREATE POLICY "Portal users can delete survey submissions"
ON public.survey_submissions
FOR DELETE
USING (has_portal_access(auth.uid()));

-- Enable RLS on survey_progress table
ALTER TABLE public.survey_progress ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies for survey_progress
CREATE POLICY "Users can manage own survey progress"
ON public.survey_progress
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Portal users can view all survey progress"
ON public.survey_progress
FOR SELECT
USING (has_portal_access(auth.uid()));

-- Strengthen learner data protection
DROP POLICY IF EXISTS "Learners can view own data" ON public.learners;
DROP POLICY IF EXISTS "Portal users can manage all learners" ON public.learners;

CREATE POLICY "Learners can view only own data"
ON public.learners
FOR SELECT
USING (
  email = get_current_user_email() OR 
  has_portal_access(auth.uid())
);

CREATE POLICY "Portal users can manage all learners"
ON public.learners
FOR ALL
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

-- Secure participant_progress table  
DROP POLICY IF EXISTS "Authenticated users can manage participant progress" ON public.participant_progress;

CREATE POLICY "Participants can view own progress"
ON public.participant_progress
FOR SELECT
USING (
  participant_email = get_current_user_email() OR 
  has_portal_access(auth.uid())
);

CREATE POLICY "Portal users can manage participant progress"
ON public.participant_progress
FOR ALL
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

-- Secure external_survey_uploads table (only portal users should access)
DROP POLICY IF EXISTS "Portal users can manage external survey uploads" ON public.external_survey_uploads;

CREATE POLICY "Portal users can manage external survey uploads"
ON public.external_survey_uploads
FOR ALL
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

-- Fix database functions to have proper search_path
CREATE OR REPLACE FUNCTION public.authenticate_admin(email_input text, password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    stored_password TEXT;
BEGIN
    -- Get stored password for the admin email
    SELECT password_hash INTO stored_password
    FROM public.admin_credentials
    WHERE email = email_input;
    
    -- Return true if password matches, false otherwise
    RETURN (stored_password IS NOT NULL AND stored_password = password_input);
END;
$$;

-- Update activate_learner function with proper search_path
CREATE OR REPLACE FUNCTION public.activate_learner(learner_id_input integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Update learner status to active and require password change
    UPDATE public.learners 
    SET status = 'active', 
        requires_password_change = true,
        updated_at = now()
    WHERE id = learner_id_input 
      AND status = 'pending';
    
    -- Return true if a row was updated
    RETURN FOUND;
END;
$$;