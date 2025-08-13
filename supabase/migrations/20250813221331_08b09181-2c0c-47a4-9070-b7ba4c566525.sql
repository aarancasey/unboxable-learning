-- Create more restrictive and secure policies for Users tables

-- Drop existing policies and recreate with stronger security
DROP POLICY "Users can view own data" ON public."Users";
DROP POLICY "Users can insert own data" ON public."Users"; 
DROP POLICY "Users can update own data" ON public."Users";

DROP POLICY "Users can view own profile" ON public.users;
DROP POLICY "Users can insert own profile" ON public.users;
DROP POLICY "Users can update own profile" ON public.users;

-- Create security definer function to get current user's email safely
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create stronger policies for Users table (capital U)
-- Only allow users to view their exact email record
CREATE POLICY "Users can only view their own email record" 
ON public."Users" 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  "Email" = get_current_user_email()
);

-- Only allow users to insert their own email record
CREATE POLICY "Users can only insert their own email record" 
ON public."Users" 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  "Email" = get_current_user_email()
);

-- Only allow users to update their own email record
CREATE POLICY "Users can only update their own email record" 
ON public."Users" 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  "Email" = get_current_user_email()
);

-- Create stronger policies for users table (lowercase u)
-- Only allow users to view their own profile
CREATE POLICY "Users can only view their own user profile" 
ON public.users 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = auth_id
);

-- Only allow users to insert their own profile
CREATE POLICY "Users can only insert their own user profile" 
ON public.users 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.uid() = auth_id
);

-- Only allow users to update their own profile
CREATE POLICY "Users can only update their own user profile" 
ON public.users 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = auth_id
);