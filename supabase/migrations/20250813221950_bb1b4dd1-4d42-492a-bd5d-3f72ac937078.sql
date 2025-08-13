-- Fix the email template issue by setting the learner invitation template as default
UPDATE email_templates 
SET is_default = true 
WHERE template_type = 'learner_invitation' 
AND template_name = 'Learner Invitation';

-- Also ensure the edge function can access templates (in case there are permission issues)
-- Check if the template query would work with current permissions