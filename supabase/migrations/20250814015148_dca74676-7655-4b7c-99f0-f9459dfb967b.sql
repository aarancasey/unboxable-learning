-- Fix remaining function security warnings by setting proper search paths

CREATE OR REPLACE FUNCTION public.has_cms_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'content_manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_learner_owner(learner_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = learner_email
  );
$$;

CREATE OR REPLACE FUNCTION public.get_learner_for_auth(email_input text)
RETURNS TABLE(id integer, email text, status text, name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT l.id, l.email, l.status, l.name
  FROM learners l
  WHERE l.email = email_input 
  AND l.status IN ('active', 'pending')
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.create_content_version(_page_slug text, _content jsonb, _change_summary text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _version_number INTEGER;
  _version_id UUID;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO _version_number
  FROM public.content_versions
  WHERE page_slug = _page_slug;
  
  -- Mark all previous versions as not current
  UPDATE public.content_versions
  SET is_current = FALSE
  WHERE page_slug = _page_slug;
  
  -- Create new version
  INSERT INTO public.content_versions (
    page_slug,
    content,
    version_number,
    created_by,
    change_summary,
    is_current
  ) VALUES (
    _page_slug,
    _content,
    _version_number,
    auth.uid(),
    _change_summary,
    TRUE
  ) RETURNING id INTO _version_id;
  
  -- Keep only last 10 versions
  DELETE FROM public.content_versions
  WHERE page_slug = _page_slug
    AND version_number <= _version_number - 10;
  
  RETURN _version_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_admin_users()
RETURNS TABLE(user_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*) FROM auth.users;
$$;