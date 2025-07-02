-- Add color field to course_schedules table
ALTER TABLE public.course_schedules 
ADD COLUMN color TEXT DEFAULT '#8B5CF6';

-- Add end_date field to course_schedules if not exists (it should already exist)
-- ALTER TABLE public.course_schedules 
-- ADD COLUMN end_date DATE;

-- Update existing records to have a default color
UPDATE public.course_schedules 
SET color = '#8B5CF6' 
WHERE color IS NULL;