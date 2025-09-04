-- Fix the counter for the most recent external survey upload
UPDATE external_survey_uploads 
SET successful_records = 22, failed_records = 0 
WHERE id = '3dc7d620-04ab-4ed7-bed2-3cae6f3d75a0';