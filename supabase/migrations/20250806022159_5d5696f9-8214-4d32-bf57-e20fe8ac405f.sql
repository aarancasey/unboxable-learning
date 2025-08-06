-- Set learner invitation template as default
UPDATE email_templates 
SET is_default = true
WHERE template_type = 'learner_invitation' AND id = '627f60f4-5d8d-434a-a5ab-1fe72000e7a3';