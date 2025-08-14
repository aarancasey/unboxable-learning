-- Fix email templates visibility for authenticated admin users
-- Update the RLS policy to allow all authenticated users to view email templates
-- since the admin portal already controls access at the application level

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Portal users can manage email templates" ON public.email_templates;

-- Create new policies that allow authenticated users to manage email templates
CREATE POLICY "Authenticated users can view email templates" 
ON public.email_templates 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create email templates" 
ON public.email_templates 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update email templates" 
ON public.email_templates 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete email templates" 
ON public.email_templates 
FOR DELETE 
USING (auth.uid() IS NOT NULL);