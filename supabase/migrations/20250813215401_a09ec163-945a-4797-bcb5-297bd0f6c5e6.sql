-- Enable RLS on both Users tables
ALTER TABLE public."Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Users table (capital U)
-- Only allow users to view their own data if they have matching email
CREATE POLICY "Users can view own data" 
ON public."Users" 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  "Email" = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Allow authenticated users to insert their own data
CREATE POLICY "Users can insert own data" 
ON public."Users" 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  "Email" = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" 
ON public."Users" 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  "Email" = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create RLS policies for users table (lowercase u)
-- Users can view their own profile data
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = auth_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = auth_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = auth_id);

-- Admin users can view all profiles (optional - uncomment if needed)
-- CREATE POLICY "Admins can view all users" 
-- ON public.users 
-- FOR SELECT 
-- USING (has_role(auth.uid(), 'admin'::app_role));