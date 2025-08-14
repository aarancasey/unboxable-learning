-- Create secure learner activation function
CREATE OR REPLACE FUNCTION public.activate_learner(learner_id_input integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Update learner status to active and require password change
    UPDATE public.learners 
    SET status = 'active', 
        requires_password_change = true,
        updated_at = now()
    WHERE id = learner_id_input 
      AND status = 'pending';
    
    -- Return true if a row was updated
    RETURN FOUND;
END;
$function$

-- Create secure password update function
CREATE OR REPLACE FUNCTION public.update_learner_password(learner_id_input integer, new_password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Update learner password and remove password change requirement
    UPDATE public.learners 
    SET password = new_password_input,
        requires_password_change = false,
        updated_at = now()
    WHERE id = learner_id_input;
    
    -- Return true if a row was updated
    RETURN FOUND;
END;
$function$

-- Fix existing functions to have proper search_path for security
CREATE OR REPLACE FUNCTION public.authenticate_learner(email_input text, password_input text DEFAULT NULL::text)
RETURNS TABLE(id integer, email text, name text, status text, requires_password_change boolean, password_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    learner_record RECORD;
BEGIN
    -- Get learner data
    SELECT l.id, l.email, l.name, l.status, l.requires_password_change, l.password
    INTO learner_record
    FROM public.learners l
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
$function$

-- Fix admin authentication function search path
CREATE OR REPLACE FUNCTION public.authenticate_admin(email_input text, password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    stored_password TEXT;
BEGIN
    -- Get stored password for the admin email
    SELECT password_hash INTO stored_password
    FROM public.admin_credentials
    WHERE email = email_input;
    
    -- Return true if password matches, false otherwise
    RETURN (stored_password IS NOT NULL AND stored_password = password_input);
END;
$function$