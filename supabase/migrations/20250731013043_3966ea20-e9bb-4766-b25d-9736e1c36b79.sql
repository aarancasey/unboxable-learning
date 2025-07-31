-- Create RLS policies for settings table
CREATE POLICY "Allow authenticated users to read settings"
ON public.settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to write settings"
ON public.settings
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);