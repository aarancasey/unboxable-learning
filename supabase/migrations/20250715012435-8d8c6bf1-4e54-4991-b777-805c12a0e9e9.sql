-- Create content library system tables

-- Content categories for organizing library content
CREATE TABLE public.content_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  framework_section TEXT, -- sentiment, purpose, agility, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Main content library table
CREATE TABLE public.content_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'framework', 'rubric', 'guide', 'assessment'
  original_filename TEXT,
  file_url TEXT, -- URL to original PDF/Word file in storage
  extracted_content TEXT NOT NULL, -- Processed text content
  category_id UUID REFERENCES public.content_categories(id),
  metadata JSONB DEFAULT '{}', -- Additional structured data
  tags TEXT[], -- Array of tags for matching
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Assessment rubrics table
CREATE TABLE public.assessment_rubrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.content_categories(id),
  criteria JSONB NOT NULL, -- Structured rubric criteria
  scoring_scale JSONB NOT NULL, -- Scoring methodology
  content_library_id UUID REFERENCES public.content_library(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Content tags for flexible organization
CREATE TABLE public.content_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8B5CF6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Authenticated users can manage content categories" 
ON public.content_categories 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage content library" 
ON public.content_library 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage assessment rubrics" 
ON public.assessment_rubrics 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage content tags" 
ON public.content_tags 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_content_categories_updated_at
BEFORE UPDATE ON public.content_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_library_updated_at
BEFORE UPDATE ON public.content_library
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assessment_rubrics_updated_at
BEFORE UPDATE ON public.assessment_rubrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content categories
INSERT INTO public.content_categories (name, description, framework_section) VALUES
('Leadership Sentiment', 'Content related to leadership mindset and emotional connection', 'sentiment'),
('Leadership Intent & Purpose', 'Content about values, aspirations, and purpose-driven leadership', 'purpose'),
('Adaptive & Agile Leadership', 'Content covering the six dimensions of leadership agility', 'agility'),
('Development Recommendations', 'Content for personalized development suggestions', 'development'),
('Assessment Frameworks', 'Structured assessment methodologies and rubrics', 'assessment');

-- Create storage bucket for content library documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-library', 'content-library', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for content library
CREATE POLICY "Authenticated users can upload content library files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'content-library' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view content library files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'content-library' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update content library files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'content-library' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete content library files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'content-library' AND auth.uid() IS NOT NULL);