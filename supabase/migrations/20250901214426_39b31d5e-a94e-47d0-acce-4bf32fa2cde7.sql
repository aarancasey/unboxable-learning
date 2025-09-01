-- Phase 1: Critical Data Protection & Security Fixes

-- Enable RLS on survey_submissions table if not already enabled
ALTER TABLE public.survey_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create new secure ones for survey_submissions
DROP POLICY IF EXISTS "Allow all operations for demo" ON public.survey_submissions;

CREATE POLICY "Learners can view own survey submissions"
ON public.survey_submissions
FOR SELECT
USING (
  participant_email = get_current_user_email() OR 
  has_portal_access(auth.uid())
);

CREATE POLICY "Learners can insert own survey submissions"
ON public.survey_submissions
FOR INSERT
WITH CHECK (
  participant_email = get_current_user_email() OR 
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

-- Create RLS policies for survey_progress
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

-- Update other functions to have proper search_path
CREATE OR REPLACE FUNCTION public.is_learner_owner(learner_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = learner_email
  );
$$;

CREATE OR REPLACE FUNCTION public.has_portal_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('admin', 'content_manager', 'facilitator')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_cms_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'content_manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_learner_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (role::text) = 'learner'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_learner_for_auth(email_input text)
RETURNS TABLE(id integer, email text, status text, name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT l.id, l.email, l.status, l.name
  FROM public.learners l
  WHERE l.email = email_input 
  AND l.status IN ('active', 'pending')
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;