-- Add HTML template field to email_templates table
ALTER TABLE public.email_templates
ADD COLUMN html_template text;

-- Update existing templates to have HTML version
UPDATE public.email_templates
SET html_template = content_template
WHERE html_template IS NULL;