-- Create external survey upload tracking table
CREATE TABLE public.external_survey_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text/csv',
  upload_status TEXT NOT NULL DEFAULT 'pending',
  processing_status TEXT NOT NULL DEFAULT 'queued',
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]'::jsonb,
  data_mapping JSONB DEFAULT '{}'::jsonb,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for external_survey_uploads
ALTER TABLE public.external_survey_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portal users can manage external survey uploads"
ON public.external_survey_uploads
FOR ALL
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

-- Add data_source field to survey_submissions to distinguish internal vs external
ALTER TABLE public.survey_submissions 
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'internal';

ALTER TABLE public.survey_submissions 
ADD COLUMN IF NOT EXISTS external_upload_id UUID REFERENCES public.external_survey_uploads(id);

-- Create rubric assessments table for storing AI-generated assessments
CREATE TABLE public.rubric_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_submission_id INTEGER REFERENCES public.survey_submissions(id) ON DELETE CASCADE,
  rubric_id UUID REFERENCES public.assessment_rubrics(id) ON DELETE CASCADE,
  overall_score NUMERIC(5,2) DEFAULT 0,
  max_possible_score NUMERIC(5,2) DEFAULT 0,
  percentage_score NUMERIC(5,2) DEFAULT 0,
  criterion_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  assessment_summary TEXT,
  strengths TEXT[],
  areas_for_improvement TEXT[],
  recommendations TEXT[],
  confidence_score NUMERIC(3,2) DEFAULT 0,
  processing_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for rubric_assessments
ALTER TABLE public.rubric_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portal users can manage rubric assessments"
ON public.rubric_assessments
FOR ALL
USING (has_portal_access(auth.uid()))
WITH CHECK (has_portal_access(auth.uid()));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_external_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for external_survey_uploads
CREATE TRIGGER update_external_uploads_updated_at
  BEFORE UPDATE ON public.external_survey_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_external_uploads_updated_at();

-- Create trigger for rubric_assessments
CREATE TRIGGER update_rubric_assessments_updated_at
  BEFORE UPDATE ON public.rubric_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_external_survey_uploads_status ON public.external_survey_uploads(upload_status, processing_status);
CREATE INDEX idx_external_survey_uploads_created_at ON public.external_survey_uploads(created_at DESC);
CREATE INDEX idx_survey_submissions_data_source ON public.survey_submissions(data_source);
CREATE INDEX idx_survey_submissions_external_upload_id ON public.survey_submissions(external_upload_id);
CREATE INDEX idx_rubric_assessments_survey_submission_id ON public.rubric_assessments(survey_submission_id);
CREATE INDEX idx_rubric_assessments_rubric_id ON public.rubric_assessments(rubric_id);