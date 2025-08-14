-- Fix security vulnerabilities with user data exposure

-- 1. Fix the 'Users' table - remove overly permissive policies and add proper restrictions
DROP POLICY IF EXISTS "Users can only insert their own email record" ON public."Users";
DROP POLICY IF EXISTS "Users can only update their own email record" ON public."Users";
DROP POLICY IF EXISTS "Users can only view their own email record" ON public."Users";

-- Create new secure policies for Users table
CREATE POLICY "Users can insert their own email record" 
ON public."Users" 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND "Email" = auth.email());

CREATE POLICY "Users can update their own email record" 
ON public."Users" 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL AND "Email" = auth.email())
WITH CHECK (auth.uid() IS NOT NULL AND "Email" = auth.email());

CREATE POLICY "Users can view their own email record" 
ON public."Users" 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL AND "Email" = auth.email());

-- 2. Fix learners table - ensure only portal users can see email addresses
-- Remove the overly broad "Portal users can manage learners" policy and replace with more restrictive ones
DROP POLICY IF EXISTS "Portal users can manage learners" ON public.learners;

-- Create separate, more restrictive policies for learners
CREATE POLICY "Portal users can view learners" 
ON public.learners 
FOR SELECT 
TO authenticated
USING (has_portal_access(auth.uid()));

CREATE POLICY "Portal users can insert learners" 
ON public.learners 
FOR INSERT 
TO authenticated
WITH CHECK (has_portal_access(auth.uid()));

CREATE POLICY "Portal users can update learners" 
ON public.learners 
FOR UPDATE 
TO authenticated
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

CREATE POLICY "Portal users can delete learners" 
ON public.learners 
FOR DELETE 
TO authenticated
USING (has_portal_access(auth.uid()));

-- 3. Secure the profiles table with better email protection
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate with more secure email access
CREATE POLICY "Users can view their own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- 4. Fix function security - set proper search paths for security definer functions
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

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
      AND (role::text) IN ('admin', 'content_manager', 'facilitator')
  );
$$;

CREATE OR REPLACE FUNCTION public.has_learner_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (role::text) = 'learner'
  );
$$;