-- Create secure password update function
CREATE OR REPLACE FUNCTION public.update_learner_password(learner_id_input integer, new_password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
$function$