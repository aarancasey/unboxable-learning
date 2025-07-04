-- Update RLS policy for module_schedules to allow demo operations
DROP POLICY IF EXISTS "Authenticated users can manage module schedules" ON public.module_schedules;

CREATE POLICY "Allow all operations for demo" 
ON public.module_schedules 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);