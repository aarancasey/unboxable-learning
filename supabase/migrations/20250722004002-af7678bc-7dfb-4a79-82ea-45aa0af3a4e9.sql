-- Reactivate all content library items that were accidentally deactivated
UPDATE content_library 
SET is_active = true 
WHERE is_active = false;