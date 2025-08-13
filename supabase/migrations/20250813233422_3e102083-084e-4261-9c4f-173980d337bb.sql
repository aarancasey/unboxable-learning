-- Fix the security definer view issue
-- Replace the problematic view with a regular view

-- Drop the problematic security definer view
DROP VIEW IF EXISTS public.learner_auth_view;

-- Create a regular view without security definer
CREATE VIEW public.learner_auth_view AS
SELECT 
  id,
  email,
  status,
  name
FROM public.learners
WHERE status IN ('active', 'pending');

-- Create a simple RLS policy for the view access instead
-- This is much more secure than using security definer
CREATE POLICY "Public can view learner auth info" 
ON public.learners 
FOR SELECT 
USING (
  -- Allow anonymous access only to specific fields needed for auth
  -- Only when querying through approved mechanisms
  status IN ('active', 'pending')
);

-- Grant access to the new view
GRANT SELECT ON public.learner_auth_view TO anon, authenticated;

-- However, we need to ensure the main table is secure
-- Drop the previous policy that might conflict
DROP POLICY IF EXISTS "Public can view learner auth info" ON public.learners;

-- Instead, let's create a proper function-based approach
CREATE OR REPLACE FUNCTION public.get_learner_for_auth(email_input text)
RETURNS TABLE(id integer, email text, status text, name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.id, l.email, l.status, l.name
  FROM learners l
  WHERE l.email = email_input 
  AND l.status IN ('active', 'pending')
  LIMIT 1;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_learner_for_auth(text) TO anon, authenticated;

-- Remove the view since we'll use the function instead
DROP VIEW IF EXISTS public.learner_auth_view;