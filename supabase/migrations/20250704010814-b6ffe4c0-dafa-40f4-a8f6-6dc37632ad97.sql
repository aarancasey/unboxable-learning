-- Create learners table for persistent storage
CREATE TABLE public.learners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  department TEXT NOT NULL,
  mobile TEXT NOT NULL,
  password TEXT,
  requires_password_change BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learners ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for demo
CREATE POLICY "Allow all operations for demo" 
ON public.learners 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- Create courses table for persistent storage
CREATE TABLE public.courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  max_enrollment INTEGER DEFAULT 20,
  status TEXT DEFAULT 'active',
  module_list JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for demo
CREATE POLICY "Allow all operations for demo" 
ON public.courses 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- Create survey submissions table for persistent storage
CREATE TABLE public.survey_submissions (
  id SERIAL PRIMARY KEY,
  learner_id INTEGER REFERENCES public.learners(id),
  learner_name TEXT NOT NULL,
  responses JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.survey_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for demo
CREATE POLICY "Allow all operations for demo" 
ON public.survey_submissions 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);