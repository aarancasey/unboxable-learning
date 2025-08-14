-- Add unique constraint to prevent duplicate survey submissions
ALTER TABLE public.survey_submissions 
ADD CONSTRAINT unique_learner_submission 
UNIQUE (learner_name, learner_id);

-- Create index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_survey_submissions_learner_lookup 
ON public.survey_submissions (learner_name, learner_id, submitted_at);