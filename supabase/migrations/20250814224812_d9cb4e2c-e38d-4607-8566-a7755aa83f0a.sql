-- Add cohort management fields to learners table
ALTER TABLE public.learners 
ADD COLUMN cohort text DEFAULT 'A' CHECK (cohort IN ('A', 'B')),
ADD COLUMN survey_access_enabled boolean DEFAULT true;

-- Update existing learners to be in Cohort A with survey access
UPDATE public.learners 
SET cohort = 'A', survey_access_enabled = true 
WHERE cohort IS NULL;