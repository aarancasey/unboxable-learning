-- Fix remaining function search path issues and complete security hardening

-- Update all remaining functions to have proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_content_version(_page_slug text, _content jsonb, _change_summary text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
SET search_path = 'public'
AS $$
  SELECT COUNT(*) FROM auth.users;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Assign default viewer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_external_uploads_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_edited_at = now();
  NEW.edited_by = auth.uid();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_course_schedules_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_course_timeline_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    event_date date;
    module_date date;
    module_record jsonb;
    email_config jsonb;
    reminder_days integer;
BEGIN
    -- Get email schedule configuration
    email_config := COALESCE(NEW.email_schedule_config, '{}'::jsonb);
    reminder_days := COALESCE((email_config->>'reminder_days_before')::integer, 7);
    
    -- Create pre-course survey reminder
    event_date := NEW.start_date - INTERVAL '1 day' * reminder_days;
    INSERT INTO course_timeline_events (course_schedule_id, event_type, event_date, email_template_id, target_recipients)
    SELECT NEW.id, 'course_reminder', event_date, id, '["all_participants"]'::jsonb
    FROM email_templates 
    WHERE template_type = 'course_reminder' AND is_default = true
    LIMIT 1;
    
    -- Create module unlock events based on course duration and type
    IF NEW.duration_type = 'days' THEN
        -- For day-based courses, unlock one module per day
        FOR i IN 0..(NEW.duration_value - 1) LOOP
            module_date := NEW.start_date + INTERVAL '1 day' * i;
            INSERT INTO course_timeline_events (course_schedule_id, event_type, event_date, event_data)
            VALUES (NEW.id, 'module_unlock', module_date, 
                   jsonb_build_object('module_number', i + 1, 'unlock_time', '09:00:00'));
        END LOOP;
    ELSIF NEW.duration_type = 'weeks' THEN
        -- For week-based courses, unlock one module per week
        FOR i IN 0..(NEW.duration_value - 1) LOOP
            module_date := NEW.start_date + INTERVAL '1 week' * i;
            INSERT INTO course_timeline_events (course_schedule_id, event_type, event_date, event_data)
            VALUES (NEW.id, 'module_unlock', module_date, 
                   jsonb_build_object('module_number', i + 1, 'unlock_time', '09:00:00'));
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_course_timeline_events()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Delete existing timeline events for the course
    DELETE FROM course_timeline_events WHERE course_schedule_id = NEW.id;
    
    -- Regenerate timeline events
    PERFORM generate_course_timeline_events();
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create a simple password validation function for basic security
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Basic password strength validation
    -- At least 8 characters, contains letters and numbers
    RETURN (
        LENGTH(password_text) >= 8 AND
        password_text ~ '[0-9]' AND
        password_text ~ '[A-Za-z]'
    );
END;
$$;