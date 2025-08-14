-- Fix foreign key constraint to allow learner deletion
-- First, drop the existing foreign key constraint
ALTER TABLE survey_submissions DROP CONSTRAINT IF EXISTS survey_submissions_learner_id_fkey;

-- Add the foreign key constraint back with CASCADE delete behavior
ALTER TABLE survey_submissions 
ADD CONSTRAINT survey_submissions_learner_id_fkey 
FOREIGN KEY (learner_id) 
REFERENCES learners(id) 
ON DELETE CASCADE;