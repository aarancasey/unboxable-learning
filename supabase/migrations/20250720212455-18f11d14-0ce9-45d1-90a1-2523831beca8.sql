-- Temporarily update RLS policy to allow public read access to assessment_rubrics for demo purposes
DROP POLICY IF EXISTS "Authenticated users can manage assessment rubrics" ON assessment_rubrics;

-- Create separate policies for different operations
CREATE POLICY "Public can view assessment rubrics" 
ON assessment_rubrics 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert assessment rubrics" 
ON assessment_rubrics 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update assessment rubrics" 
ON assessment_rubrics 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete assessment rubrics" 
ON assessment_rubrics 
FOR DELETE 
USING (auth.uid() IS NOT NULL);