-- Give the current user admin access to resolve the permission issues
-- Get the current user ID and assign admin role
INSERT INTO user_roles (user_id, role, assigned_by)
SELECT 
  auth.uid(),
  'admin'::app_role,
  auth.uid()
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;