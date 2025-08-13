-- Create RLS policies for tables that have RLS enabled but no policies

-- Media table policies
CREATE POLICY "Authenticated users can view media" 
ON public."Media" 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload media" 
ON public."Media" 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Posts table policies  
CREATE POLICY "Authenticated users can view posts" 
ON public."Posts" 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create posts" 
ON public."Posts" 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own posts" 
ON public."Posts" 
FOR UPDATE 
USING (auth.uid() = "Author_id");

-- Settings table policies
CREATE POLICY "Authenticated users can view settings" 
ON public."Settings" 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage settings" 
ON public."Settings" 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Comments table policies
CREATE POLICY "Public can view comments" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Insights content table policies
CREATE POLICY "Public can view insights content" 
ON public.insights_content 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage insights content" 
ON public.insights_content 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Post categories table policies
CREATE POLICY "Public can view post categories" 
ON public.post_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage post categories" 
ON public.post_categories 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Post tags table policies
CREATE POLICY "Public can view post tags" 
ON public.post_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage post tags" 
ON public.post_tags 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);