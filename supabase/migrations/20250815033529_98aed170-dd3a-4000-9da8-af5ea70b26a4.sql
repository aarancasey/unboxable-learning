-- Create table for storing survey configurations
CREATE TABLE public.survey_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_type TEXT NOT NULL DEFAULT 'leadership_assessment',
  configuration JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.survey_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Portal users can manage survey configurations" 
ON public.survey_configurations 
FOR ALL 
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

CREATE POLICY "Authenticated users can view active survey configurations" 
ON public.survey_configurations 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_survey_configurations_updated_at
BEFORE UPDATE ON public.survey_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default survey configuration
INSERT INTO public.survey_configurations (survey_type, configuration, created_by, is_active)
SELECT 
  'leadership_assessment',
  '{"title": "Leadership Sentiment, Adaptive and Agile Self-Assessment", "description": "This self-assessment is designed to help you explore your current leadership sentiment and intent, adaptability and agility.", "sections": []}',
  auth.uid(),
  true
WHERE auth.uid() IS NOT NULL;