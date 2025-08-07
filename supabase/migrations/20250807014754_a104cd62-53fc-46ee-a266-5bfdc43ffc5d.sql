-- Rename mobile column to role and department column to team in learners table
ALTER TABLE public.learners 
RENAME COLUMN mobile TO role;

ALTER TABLE public.learners 
RENAME COLUMN department TO team;