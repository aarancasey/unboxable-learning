-- Fix critical security issue: Implement proper RLS policies for learners table
-- Drop the overly permissive existing policy
DROP POLICY IF EXISTS "Portal users can manage learners" ON public.learners;

-- Create restrictive policies for learners table
-- Only portal users (admin, content_manager, facilitator) can view learners
CREATE POLICY "Portal users can view learners" 
ON public.learners 
FOR SELECT 
USING (has_portal_access(auth.uid()));

-- Only portal users can insert new learners
CREATE POLICY "Portal users can create learners" 
ON public.learners 
FOR INSERT 
WITH CHECK (has_portal_access(auth.uid()));

-- Only portal users can update learners
CREATE POLICY "Portal users can update learners" 
ON public.learners 
FOR UPDATE 
USING (has_portal_access(auth.uid()));

-- Only portal users can delete learners
CREATE POLICY "Portal users can delete learners" 
ON public.learners 
FOR DELETE 
USING (has_portal_access(auth.uid()));

-- Ensure learners can only access their own data if needed for self-service features
CREATE POLICY "Learners can view own data" 
ON public.learners 
FOR SELECT 
USING (has_learner_access(auth.uid()) AND auth.uid()::text = id::text);