-- Fix remaining functions to have secure search path
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
$function$;