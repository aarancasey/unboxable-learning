-- Fix critical security vulnerability in assessment_rubrics table
-- Remove public access to proprietary business methodology and intellectual property

-- Drop the dangerous public read policy
DROP POLICY IF EXISTS "Public can view assessment rubrics" ON public.assessment_rubrics;

-- Create secure policy that only allows authenticated users to view rubrics
CREATE POLICY "Authenticated users can view assessment rubrics" 
ON public.assessment_rubrics 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add additional security: only allow portal users to manage sensitive rubric data
CREATE POLICY "Portal users can manage sensitive rubrics" 
ON public.assessment_rubrics 
FOR ALL
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

-- Drop the existing authenticated user policies to replace with more granular ones
DROP POLICY IF EXISTS "Authenticated users can delete assessment rubrics" ON public.assessment_rubrics;
DROP POLICY IF EXISTS "Authenticated users can insert assessment rubrics" ON public.assessment_rubrics; 
DROP POLICY IF EXISTS "Authenticated users can update assessment rubrics" ON public.assessment_rubrics;

-- Create more secure policies that differentiate between viewing and managing
-- Authenticated users can view (for assessments) but only portal users can modify
CREATE POLICY "Authenticated users can view rubrics for assessments" 
ON public.assessment_rubrics 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only portal users (admins, facilitators, content managers) can modify rubrics
CREATE POLICY "Portal users can insert rubrics" 
ON public.assessment_rubrics 
FOR INSERT 
WITH CHECK (has_portal_access(auth.uid()));

CREATE POLICY "Portal users can update rubrics" 
ON public.assessment_rubrics 
FOR UPDATE 
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

CREATE POLICY "Portal users can delete rubrics" 
ON public.assessment_rubrics 
FOR DELETE 
USING (has_portal_access(auth.uid()));

-- Add security documentation
COMMENT ON POLICY "Authenticated users can view rubrics for assessments" ON public.assessment_rubrics IS 
'SECURITY: Protects proprietary business methodology - only authenticated users can view assessment rubrics';

COMMENT ON POLICY "Portal users can insert rubrics" ON public.assessment_rubrics IS 
'SECURITY: Only authorized portal users can create new assessment rubrics containing business IP';

COMMENT ON POLICY "Portal users can update rubrics" ON public.assessment_rubrics IS 
'SECURITY: Only authorized portal users can modify assessment rubrics to protect business methodology';

COMMENT ON POLICY "Portal users can delete rubrics" ON public.assessment_rubrics IS 
'SECURITY: Only authorized portal users can delete assessment rubrics';

-- Revoke any broad permissions that might exist
REVOKE ALL ON public.assessment_rubrics FROM anon;
REVOKE ALL ON public.assessment_rubrics FROM public;

-- Add table comment for security awareness
COMMENT ON TABLE public.assessment_rubrics IS 
'CONTAINS PROPRIETARY BUSINESS INTELLIGENCE: Assessment criteria, scoring methodologies, and evaluation frameworks. Access restricted to authenticated users only to protect intellectual property.';