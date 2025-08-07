-- First, let's clean up the duplicates by keeping only the most recent submission for each learner
WITH duplicates AS (
  SELECT 
    id,
    learner_name,
    ROW_NUMBER() OVER (PARTITION BY learner_name ORDER BY submitted_at DESC) as rn
  FROM survey_submissions
  WHERE learner_name IN (
    SELECT learner_name 
    FROM survey_submissions 
    GROUP BY learner_name 
    HAVING COUNT(*) > 1
  )
)
DELETE FROM survey_submissions 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Add a unique constraint to prevent future duplicates on learner_name
-- This assumes each learner should only have one survey submission
ALTER TABLE survey_submissions 
ADD CONSTRAINT unique_learner_survey 
UNIQUE (learner_name);

-- Create an index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_survey_submissions_learner_name 
ON survey_submissions(learner_name);