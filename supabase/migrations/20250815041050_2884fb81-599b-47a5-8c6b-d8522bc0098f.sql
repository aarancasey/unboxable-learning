-- Update Kenny's password and mark password change as complete
UPDATE learners 
SET password = 'Balloon88', 
    requires_password_change = false, 
    updated_at = now()
WHERE email = 'kenny.thomson@spark.co.nz';