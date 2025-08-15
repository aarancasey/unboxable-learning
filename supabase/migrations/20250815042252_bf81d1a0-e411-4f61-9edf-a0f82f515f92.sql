-- Fix the learners table to ensure new learners require password change by default
-- and update existing learners without passwords to require password change

-- First, update the default value for new learners
ALTER TABLE learners ALTER COLUMN requires_password_change SET DEFAULT true;

-- Update existing learners who don't have passwords to require password change
UPDATE learners 
SET requires_password_change = true, 
    updated_at = now()
WHERE password IS NULL 
   OR (password IS NOT NULL AND requires_password_change = false AND status = 'pending');

-- Ensure all active learners in cohort A who should need password reset are properly set
UPDATE learners 
SET requires_password_change = true,
    updated_at = now()
WHERE cohort = 'A' 
  AND status IN ('pending', 'active')
  AND (password IS NULL OR password = '' OR email IN ('azcreative@gmail.com'));