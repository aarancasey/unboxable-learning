-- Fix the learner invitation template type and make it default
UPDATE email_templates 
SET template_type = 'learner_invitation', is_default = true
WHERE id = '627f60f4-5d8d-434a-a5ab-1fe72000e7a3';