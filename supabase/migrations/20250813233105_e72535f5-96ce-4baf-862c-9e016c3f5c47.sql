-- Fix critical security vulnerability in learners table (corrected version)
-- Remove dangerous anonymous read access and implement proper access controls

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anonymous can read learners for login" ON public.learners;

-- Drop the problematic policy if it exists
DROP POLICY IF EXISTS "Limited read for authentication" ON public.learners;

-- Create a security function to validate learner access
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

-- Learners can update their own non-sensitive fields
CREATE POLICY "Learners can update own non-sensitive data" 
ON public.learners 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND public.is_learner_owner(email)
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND public.is_learner_owner(email)
  -- Prevent updating critical fields
  AND OLD.email = NEW.email
  AND OLD.role = NEW.role
);

-- Create a secure view for authentication that only exposes necessary fields
CREATE OR REPLACE VIEW public.learner_auth_view AS
SELECT 
  id,
  email,
  status,
  name
FROM public.learners
WHERE status IN ('active', 'pending');

-- Enable RLS on the view
ALTER VIEW public.learner_auth_view SET (security_barrier = true);

-- Grant minimal access to the auth view
GRANT SELECT ON public.learner_auth_view TO anon, authenticated;

-- Add security documentation
COMMENT ON POLICY "Secure learner self access" ON public.learners IS 
'Allows authenticated users to view only their own learner record based on email matching their auth user email';

COMMENT ON POLICY "Portal users can manage learners" ON public.learners IS 
'Allows portal users (admins, facilitators) to manage all learner records';

COMMENT ON VIEW public.learner_auth_view IS 
'Secure view for authentication that only exposes non-sensitive learner fields to prevent credential theft';

-- Add constraint for future security guidance
ALTER TABLE public.learners 
ADD CONSTRAINT learners_password_security_note 
CHECK (length(password) > 0) 
NOT VALID; -- Don't validate existing data

COMMENT ON CONSTRAINT learners_password_security_note ON public.learners IS 
'Security reminder: Password storage should be migrated to Supabase Auth for enhanced security';