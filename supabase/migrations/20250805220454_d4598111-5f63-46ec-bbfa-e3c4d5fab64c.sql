-- Create survey_progress table for saving incomplete surveys
CREATE TABLE public.survey_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  participant_info JSONB,
  current_section INTEGER NOT NULL DEFAULT 0,
  current_question INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}',
  survey_type TEXT NOT NULL DEFAULT 'leadership_assessment',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, survey_type)
);

-- Enable Row Level Security
ALTER TABLE public.survey_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own survey progress" 
ON public.survey_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own survey progress" 
ON public.survey_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own survey progress" 
ON public.survey_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own survey progress" 
ON public.survey_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_survey_progress_updated_at
BEFORE UPDATE ON public.survey_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();