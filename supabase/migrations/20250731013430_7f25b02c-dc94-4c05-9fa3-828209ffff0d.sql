-- Check if RLS is enabled on settings table and current policies
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'settings';

-- Check existing policies on settings table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'settings';