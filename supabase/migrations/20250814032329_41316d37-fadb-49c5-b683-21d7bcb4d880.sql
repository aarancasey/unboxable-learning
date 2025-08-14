-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow anonymous read for authentication" ON public.learners;
DROP POLICY IF EXISTS "Allow authenticated manage learners" ON public.learners;

-- Create a secure function for learner authentication
CREATE OR REPLACE FUNCTION public.authenticate_learner(email_input text, password_input text DEFAULT NULL)
RETURNS TABLE(
  id integer,
  email text,
  name text,
  status text,
  requires_password_change boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return learner data for authentication purposes only
  RETURN QUERY
  SELECT l.id, l.email, l.name, l.status, l.requires_password_change
  FROM learners l
  WHERE l.email = email_input 
    AND l.status IN ('active', 'pending')
  LIMIT 1;
END;
$$;

-- Create restrictive RLS policies
CREATE POLICY "Portal users can manage all learners" 
ON public.learners 
FOR ALL 
TO authenticated
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

-- Allow learners to view their own data when authenticated
CREATE POLICY "Learners can view own data" 
ON public.learners 
FOR SELECT 
TO authenticated
USING (email = get_current_user_email());