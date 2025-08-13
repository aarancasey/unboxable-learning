-- Drop the overly permissive policy that allows all authenticated users to manage email campaigns
DROP POLICY "Authenticated users can manage email campaigns" ON public.email_campaigns;

-- Create restrictive RLS policies for email_campaigns table

-- Only portal users (admin, content_manager, facilitator) can manage email campaigns
CREATE POLICY "Portal users can manage email campaigns" 
ON public.email_campaigns 
FOR ALL 
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));