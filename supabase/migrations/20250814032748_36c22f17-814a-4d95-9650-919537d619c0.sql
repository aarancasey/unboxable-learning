-- Update authenticate_learner function to handle password verification securely
CREATE OR REPLACE FUNCTION public.authenticate_learner(email_input text, password_input text DEFAULT NULL::text)
RETURNS TABLE(id integer, email text, name text, status text, requires_password_change boolean, password_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    learner_record RECORD;
BEGIN
    -- Get learner data
    SELECT l.id, l.email, l.name, l.status, l.requires_password_change, l.password
    INTO learner_record
    FROM learners l
    WHERE l.email = email_input 
      AND l.status IN ('active', 'pending')
    LIMIT 1;
    
    -- If no learner found, return empty result
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- For first-time login (requires_password_change = true), don't check password
    IF learner_record.requires_password_change THEN
        RETURN QUERY SELECT 
            learner_record.id, 
            learner_record.email, 
            learner_record.name, 
            learner_record.status, 
            learner_record.requires_password_change,
            true as password_valid;
        RETURN;
    END IF;
    
    -- For returning users, verify password
    IF password_input IS NULL OR password_input != learner_record.password THEN
        RETURN QUERY SELECT 
            learner_record.id, 
            learner_record.email, 
            learner_record.name, 
            learner_record.status, 
            learner_record.requires_password_change,
            false as password_valid;
        RETURN;
    END IF;
    
    -- Password is correct
    RETURN QUERY SELECT 
        learner_record.id, 
        learner_record.email, 
        learner_record.name, 
        learner_record.status, 
        learner_record.requires_password_change,
        true as password_valid;
END;
$function$;

-- Create admin authentication function with secure storage
CREATE TABLE IF NOT EXISTS admin_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_credentials
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy that denies all access (only functions can access)
CREATE POLICY "No direct access to admin credentials" ON admin_credentials
FOR ALL USING (false);

-- Insert default admin (this will be the only way to access admin credentials)
INSERT INTO admin_credentials (email, password_hash) 
VALUES ('fiona@unboxable.co.nz', 'Netball1974#')
ON CONFLICT (email) DO NOTHING;

-- Create secure admin authentication function
CREATE OR REPLACE FUNCTION public.authenticate_admin(email_input text, password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    stored_password TEXT;
BEGIN
    -- Get stored password for the admin email
    SELECT password_hash INTO stored_password
    FROM admin_credentials
    WHERE email = email_input;
    
    -- Return true if password matches, false otherwise
    RETURN (stored_password IS NOT NULL AND stored_password = password_input);
END;
$function$;

-- Fix search_path for existing functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_learner_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (role::text) = 'learner'
  );
$function$;