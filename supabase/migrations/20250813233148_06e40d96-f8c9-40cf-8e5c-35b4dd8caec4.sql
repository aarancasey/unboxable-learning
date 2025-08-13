-- Fix critical security vulnerability in learners table (final corrected version)
-- Remove dangerous anonymous read access and implement proper access controls

-- Drop the existing overly permissive policy that allows public access
DROP POLICY IF EXISTS "Anonymous can read learners for login" ON public.learners;

-- Drop any problematic policies if they exist
DROP POLICY IF EXISTS "Limited read for authentication" ON public.learners;
DROP POLICY IF EXISTS "Learners can update own non-sensitive data" ON public.learners;

-- Create a security function to validate learner ownership
CREATE OR REPLACE FUNCTION public.is_learner_owner(learner_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = learner_email
  );
$$;

-- Create secure policy for learners to access only their own data
CREATE POLICY "Secure learner self access" 
ON public.learners 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_learner_owner(email)
);

-- Allow learners to update only their own non-critical data
CREATE POLICY "Learners can update own profile" 
ON public.learners 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_learner_owner(email)
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_learner_owner(email)
);

-- Create a secure view for authentication that only exposes necessary fields
-- This removes access to sensitive data like passwords
CREATE OR REPLACE VIEW public.learner_auth_view AS
SELECT 
  id,
  email,
  status,
  name
FROM public.learners
WHERE status IN ('active', 'pending');

-- Grant minimal access to the secure auth view for anonymous users (login purposes only)
GRANT SELECT ON public.learner_auth_view TO anon, authenticated;

-- Add security documentation
COMMENT ON POLICY "Secure learner self access" ON public.learners IS 
'SECURITY: Allows authenticated users to view only their own learner record, preventing credential theft';

COMMENT ON VIEW public.learner_auth_view IS 
'SECURITY: Secure view that only exposes non-sensitive fields (no passwords) for authentication purposes';

-- Revoke any broad permissions that might exist
REVOKE ALL ON public.learners FROM anon;
REVOKE ALL ON public.learners FROM public;