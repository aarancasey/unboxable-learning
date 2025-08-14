-- Grant portal access to the current user
-- First, get the current user ID and grant admin role
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT 
  '600f6e7c-af24-49ab-974a-a7a72c5e9d28'::uuid,
  'admin'::app_role,
  '600f6e7c-af24-49ab-974a-a7a72c5e9d28'::uuid
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '600f6e7c-af24-49ab-974a-a7a72c5e9d28'::uuid 
  AND role = 'admin'::app_role
);