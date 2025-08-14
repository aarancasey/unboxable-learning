-- Fix remaining trigger functions that need search_path

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Fix update_blog_posts_updated_at function
CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.last_edited_at = now();
  NEW.edited_by = auth.uid();
  RETURN NEW;
END;
$function$;

-- Fix update_course_schedules_updated_at function
CREATE OR REPLACE FUNCTION public.update_course_schedules_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Function logic here
    RETURN NEW;
END;
$function$;

-- Fix generate_course_timeline_events function
CREATE OR REPLACE FUNCTION public.generate_course_timeline_events()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix update_course_timeline_events function
CREATE OR REPLACE FUNCTION public.update_course_timeline_events()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Delete existing timeline events for the course
    DELETE FROM course_timeline_events WHERE course_schedule_id = NEW.id;
    
    -- Regenerate timeline events
    PERFORM generate_course_timeline_events();
    
    RETURN NEW;
END;
$function$;