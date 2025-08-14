-- Re-enable RLS and create a simple, working policy
ALTER TABLE learners ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Learners can view and update own profile" ON learners;
DROP POLICY IF EXISTS "Authenticated users can manage learners" ON learners;

-- Create one simple policy that works
CREATE POLICY "Allow all authenticated users full access to learners" ON learners
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);