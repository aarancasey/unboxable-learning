-- Fix Function Search Path Security Issues
-- Update all existing functions to have secure search_path

-- Fix authenticate_learner function
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

-- Fix authenticate_admin function
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
    FROM public.admin_credentials
    WHERE email = email_input;
    
    -- Return true if password matches, false otherwise
    RETURN (stored_password IS NOT NULL AND stored_password = password_input);
END;
$function$;

-- Fix activate_learner function
CREATE OR REPLACE FUNCTION public.activate_learner(learner_id_input integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER 
 SET search_path TO 'public'
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
$function$;

-- Fix update_learner_password function
CREATE OR REPLACE FUNCTION public.update_learner_password(learner_id_input integer, new_password_input text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER 
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Update learner password and clear password change requirement
    UPDATE public.learners 
    SET password = new_password_input,
        requires_password_change = false,
        updated_at = now()
    WHERE id = learner_id_input;
    
    -- Return true if a row was updated
    RETURN FOUND;
END;
$function$;

-- Fix get_learner_for_auth function
CREATE OR REPLACE FUNCTION public.get_learner_for_auth(email_input text)
 RETURNS TABLE(id integer, email text, status text, name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT l.id, l.email, l.status, l.name
  FROM public.learners l
  WHERE l.email = email_input 
  AND l.status IN ('active', 'pending')
  LIMIT 1;
$function$;

-- Fix get_current_user_email function
CREATE OR REPLACE FUNCTION public.get_current_user_email()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT email FROM auth.users WHERE id = auth.uid();
$function$;

-- Fix check_admin_users function  
CREATE OR REPLACE FUNCTION public.check_admin_users()
 RETURNS TABLE(user_count bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT COUNT(*) FROM auth.users;
$function$;

-- Fix create_content_version function
CREATE OR REPLACE FUNCTION public.create_content_version(_page_slug text, _content jsonb, _change_summary text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _version_number INTEGER;
  _version_id UUID;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO _version_number
  FROM public.content_versions
  WHERE page_slug = _page_slug;
  
  -- Mark all previous versions as not current
  UPDATE public.content_versions
  SET is_current = FALSE
  WHERE page_slug = _page_slug;
  
  -- Create new version
  INSERT INTO public.content_versions (
    page_slug,
    content,
    version_number,
    created_by,
    change_summary,
    is_current
  ) VALUES (
    _page_slug,
    _content,
    _version_number,
    auth.uid(),
    _change_summary,
    TRUE
  ) RETURNING id INTO _version_id;
  
  -- Keep only last 10 versions
  DELETE FROM public.content_versions
  WHERE page_slug = _page_slug
    AND version_number <= _version_number - 10;
  
  RETURN _version_id;
END;
$function$;