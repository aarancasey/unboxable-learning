-- Drop the existing restrictive policies
DROP POLICY "Allow authenticated users to read settings" ON public.settings;
DROP POLICY "Allow authenticated users to write settings" ON public.settings;

-- Create new policies that allow public read access and admin write access
-- For public read access (anyone can read global settings)
CREATE POLICY "Allow public read access to settings"
ON public.settings
FOR SELECT
USING (true);

-- For admin write access (authenticated users can modify settings)
CREATE POLICY "Allow authenticated users to modify settings"
ON public.settings
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);