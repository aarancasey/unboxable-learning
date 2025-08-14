-- Fix admin authentication function to have secure search path
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
$function$;