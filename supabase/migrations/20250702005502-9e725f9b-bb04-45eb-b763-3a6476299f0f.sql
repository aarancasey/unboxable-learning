-- Create tables for multi-week course scheduling system

-- Course schedules table for multi-week courses
CREATE TABLE public.course_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id TEXT NOT NULL,
  course_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  max_enrollment INTEGER NOT NULL,
  enrolled_count INTEGER NOT NULL DEFAULT 0,
  instructor TEXT,
  location TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  pre_course_survey_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Module schedules table for individual module unlock timing
CREATE TABLE public.module_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_schedule_id UUID NOT NULL REFERENCES public.course_schedules(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  module_title TEXT NOT NULL,
  module_type TEXT NOT NULL,
  unlock_date DATE NOT NULL,
  unlock_time TIME NOT NULL,
  week_number INTEGER NOT NULL,
  email_notification_date DATE NOT NULL,
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email campaigns table for automated email sequences
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_schedule_id UUID NOT NULL REFERENCES public.course_schedules(id) ON DELETE CASCADE,
  campaign_type TEXT NOT NULL, -- 'pre_course_survey', 'module_unlock', 'reminder'
  recipient_email TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  email_subject TEXT NOT NULL,
  email_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'sent', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Participant progress tracking
CREATE TABLE public.participant_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_schedule_id UUID NOT NULL REFERENCES public.course_schedules(id) ON DELETE CASCADE,
  participant_email TEXT NOT NULL,
  participant_name TEXT,
  survey_completed BOOLEAN NOT NULL DEFAULT false,
  survey_completed_at TIMESTAMP WITH TIME ZONE,
  modules_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.course_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admins/instructors)
CREATE POLICY "Authenticated users can manage course schedules" 
ON public.course_schedules 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage module schedules" 
ON public.module_schedules 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage email campaigns" 
ON public.email_campaigns 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage participant progress" 
ON public.participant_progress 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_course_schedules_start_date ON public.course_schedules(start_date);
CREATE INDEX idx_module_schedules_unlock_date ON public.module_schedules(unlock_date);
CREATE INDEX idx_email_campaigns_scheduled_date ON public.email_campaigns(scheduled_date, status);
CREATE INDEX idx_participant_progress_course_id ON public.participant_progress(course_schedule_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_course_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_course_schedules_updated_at
BEFORE UPDATE ON public.course_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_course_schedules_updated_at();