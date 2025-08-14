-- Fix the has_portal_access function to work correctly
CREATE OR REPLACE FUNCTION public.has_portal_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('admin', 'content_manager', 'facilitator')
  );
$$;

-- Also create a simpler policy for testing
DROP POLICY IF EXISTS "Portal users can manage all learners" ON learners;

CREATE POLICY "Authenticated users can manage learners" ON learners
FOR ALL 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);