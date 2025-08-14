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