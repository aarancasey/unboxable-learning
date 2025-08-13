-- Fix security vulnerability: Replace overly permissive policies with proper access controls

-- Drop dangerous "Allow all operations for demo" policies
DROP POLICY "Allow all operations for demo" ON public.course_schedules;
DROP POLICY "Allow all operations for demo" ON public.course_timeline_events; 
DROP POLICY "Allow all operations for demo" ON public.email_templates;

-- Create secure RLS policies for course_schedules table
-- Only portal users can manage course schedules
CREATE POLICY "Portal users can manage course schedules" 
ON public.course_schedules 
FOR ALL 
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

-- Allow authenticated users to view basic course information (needed for learner dashboard)
CREATE POLICY "Authenticated users can view course schedules" 
ON public.course_schedules 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create secure RLS policies for course_timeline_events table  
-- Only portal users can manage timeline events
CREATE POLICY "Portal users can manage timeline events" 
ON public.course_timeline_events 
FOR ALL 
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

-- Create secure RLS policies for email_templates table
-- Only portal users can manage email templates (highly sensitive business data)
CREATE POLICY "Portal users can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));