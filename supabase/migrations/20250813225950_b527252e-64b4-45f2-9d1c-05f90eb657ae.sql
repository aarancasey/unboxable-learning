-- Fix learners table RLS policies to allow proper authentication access

-- First, let's drop the current restrictive policies
DROP POLICY IF EXISTS "Learners can view own data" ON public.learners;
DROP POLICY IF EXISTS "Portal users can view learners" ON public.learners;
DROP POLICY IF EXISTS "Portal users can create learners" ON public.learners;
DROP POLICY IF EXISTS "Portal users can update learners" ON public.learners;
DROP POLICY IF EXISTS "Portal users can delete learners" ON public.learners;

-- Create new policies that allow anonymous access for login purposes
-- but maintain security for other operations

-- Allow anonymous users to read learners for login verification
CREATE POLICY "Anonymous can read learners for login" 
ON public.learners 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Allow authenticated users with portal access to manage learners
CREATE POLICY "Portal users can manage learners" 
ON public.learners 
FOR ALL 
TO authenticated
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

-- Also update the portal_url in the send-learner-invite function to use the correct domain
-- We'll need to make sure the function uses the right URL for the custom domain