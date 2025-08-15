-- Ensure ALL learners in cohort A require password change
-- This will prompt them to create a new password when they first login

UPDATE learners 
SET requires_password_change = true,
    updated_at = now()
WHERE cohort = 'A' 
  AND requires_password_change = false;