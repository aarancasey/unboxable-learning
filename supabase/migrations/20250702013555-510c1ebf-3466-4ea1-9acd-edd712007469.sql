-- Re-enable RLS and create a more permissive policy for demo purposes
ALTER TABLE public.course_schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can manage course schedules" ON public.course_schedules;

-- Create new policy that allows all operations for demo
CREATE POLICY "Allow all operations for demo" 
ON public.course_schedules 
FOR ALL 
USING (true) 
WITH CHECK (true);