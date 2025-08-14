-- Fix RLS policies for learners table to allow portal users full access
-- Drop existing policies first
DROP POLICY IF EXISTS "Learners can update own profile" ON learners;
DROP POLICY IF EXISTS "Portal users can delete learners" ON learners;
DROP POLICY IF EXISTS "Portal users can insert learners" ON learners;
DROP POLICY IF EXISTS "Portal users can update learners" ON learners;
DROP POLICY IF EXISTS "Portal users can view learners" ON learners;
DROP POLICY IF EXISTS "Secure learner self access" ON learners;

-- Create new comprehensive policies
CREATE POLICY "Portal users can manage all learners" ON learners
FOR ALL 
TO authenticated
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

CREATE POLICY "Learners can view and update own profile" ON learners
FOR ALL
TO authenticated
USING (is_learner_owner(email))
WITH CHECK (is_learner_owner(email));