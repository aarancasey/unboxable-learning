-- Phase 1: Critical Data Protection & Security Fixes

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create function to hash passwords securely
CREATE OR REPLACE FUNCTION public.hash_password(password_text text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT crypt(password_text, gen_salt('bf'));
$$;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION public.verify_password(password_text text, hashed_password text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT crypt(password_text, hashed_password) = hashed_password;
$$;

-- Update authenticate_learner function to use proper password hashing
CREATE OR REPLACE FUNCTION public.authenticate_learner(email_input text, password_input text DEFAULT NULL::text)
RETURNS TABLE(id integer, email text, name text, status text, requires_password_change boolean, password_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    learner_record RECORD;
BEGIN
    -- Get learner data
    SELECT l.id, l.email, l.name, l.status, l.requires_password_change, l.password
    INTO learner_record
    FROM public.learners l
    WHERE l.email = email_input 
      AND l.status IN ('active', 'pending')
    LIMIT 1;
    
    -- If no learner found, return empty result
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- For first-time login (requires_password_change = true), don't check password
    IF learner_record.requires_password_change THEN
        RETURN QUERY SELECT 
            learner_record.id, 
            learner_record.email, 
            learner_record.name, 
            learner_record.status, 
            learner_record.requires_password_change,
            true as password_valid;
        RETURN;
    END IF;
    
    -- For returning users, verify password using proper hashing
    IF password_input IS NULL OR NOT verify_password(password_input, learner_record.password) THEN
        RETURN QUERY SELECT 
            learner_record.id, 
            learner_record.email, 
            learner_record.name, 
            learner_record.status, 
            learner_record.requires_password_change,
            false as password_valid;
        RETURN;
    END IF;
    
    -- Password is correct
    RETURN QUERY SELECT 
        learner_record.id, 
        learner_record.email, 
        learner_record.name, 
        learner_record.status, 
        learner_record.requires_password_change,
        true as password_valid;
END;
$$;

-- Update update_learner_password function to use password hashing
CREATE OR REPLACE FUNCTION public.update_learner_password(learner_id_input integer, new_password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Update learner password with proper hashing and clear password change requirement
    UPDATE public.learners 
    SET password = hash_password(new_password_input),
        requires_password_change = false,
        updated_at = now()
    WHERE id = learner_id_input;
    
    -- Return true if a row was updated
    RETURN FOUND;
END;
$$;

-- Fix existing database functions to have proper search_path
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

-- Enable RLS on survey_submissions table
ALTER TABLE public.survey_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for survey_submissions
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

-- Hash existing plain-text passwords (only if they exist and are not already hashed)
DO $$
DECLARE
    learner_record RECORD;
BEGIN
    -- Only update passwords that appear to be plain text (not already hashed with bcrypt)
    FOR learner_record IN 
        SELECT id, password 
        FROM public.learners 
        WHERE password IS NOT NULL 
          AND password != ''
          AND NOT password LIKE '$2%'  -- bcrypt hashes start with $2
    LOOP
        UPDATE public.learners 
        SET password = hash_password(learner_record.password)
        WHERE id = learner_record.id;
    END LOOP;
END $$;