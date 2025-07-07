-- Enhanced Course Management Schema for Flexible Duration & Email Automation

-- Update course_schedules table to support flexible durations
ALTER TABLE course_schedules 
ADD COLUMN IF NOT EXISTS duration_type text DEFAULT 'weeks',
ADD COLUMN IF NOT EXISTS duration_value integer DEFAULT 4,
ADD COLUMN IF NOT EXISTS module_unlock_schedule jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS email_schedule_config jsonb DEFAULT '{}'::jsonb;

-- Create email templates table for customizable content
CREATE TABLE IF NOT EXISTS email_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name text NOT NULL,
    template_type text NOT NULL, -- 'pre_survey', 'module_unlock', 'course_reminder'
    subject_template text NOT NULL,
    content_template text NOT NULL,
    variables jsonb DEFAULT '[]'::jsonb, -- Available template variables
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create course timeline events for automated scheduling
CREATE TABLE IF NOT EXISTS course_timeline_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_schedule_id uuid REFERENCES course_schedules(id) ON DELETE CASCADE,
    event_type text NOT NULL, -- 'email_reminder', 'module_unlock', 'survey_due'
    event_date date NOT NULL,
    event_time time DEFAULT '09:00:00',
    email_template_id uuid REFERENCES email_templates(id),
    target_recipients jsonb DEFAULT '[]'::jsonb,
    event_data jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'scheduled', -- 'scheduled', 'sent', 'failed'
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_timeline_events ENABLE ROW LEVEL SECURITY;

-- Create policies for email templates
CREATE POLICY "Allow all operations for demo" ON email_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for demo" ON course_timeline_events FOR ALL USING (true) WITH CHECK (true);

-- Insert default email templates
INSERT INTO email_templates (template_name, template_type, subject_template, content_template, variables, is_default) VALUES
('Default Pre-Survey Email', 'pre_survey', 'Complete Your Pre-Course Survey - {{course_name}}', 
'<h2>Welcome to {{course_name}}!</h2>
<p>Hi {{participant_name}},</p>
<p>Your course <strong>{{course_name}}</strong> begins on {{course_start_date}}. Before we start, please complete the pre-course survey to help us understand your learning needs.</p>
<p><a href="{{survey_link}}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Survey</a></p>
<p>The survey takes approximately {{survey_duration}} to complete.</p>
<p>If you have any questions, please don''t hesitate to reach out.</p>
<p>Best regards,<br>The Learning Team</p>', 
'["course_name", "participant_name", "course_start_date", "survey_link", "survey_duration"]'::jsonb, true),

('Default Module Unlock Email', 'module_unlock', 'New Module Available - {{module_name}}', 
'<h2>{{module_name}} is Now Available!</h2>
<p>Hi {{participant_name}},</p>
<p>Great news! Your next module <strong>{{module_name}}</strong> in the course <strong>{{course_name}}</strong> is now available.</p>
<p><strong>Module Details:</strong></p>
<ul>
<li>Duration: {{module_duration}}</li>
<li>Type: {{module_type}}</li>
</ul>
<p><a href="{{module_link}}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Access Module</a></p>
<p>Complete this module at your own pace. The next module will unlock {{next_unlock_date}}.</p>
<p>Happy learning!</p>', 
'["module_name", "participant_name", "course_name", "module_duration", "module_type", "module_link", "next_unlock_date"]'::jsonb, true),

('Default Course Reminder', 'course_reminder', 'Reminder: {{course_name}} starts {{time_until_start}}', 
'<h2>Your Course Starts Soon!</h2>
<p>Hi {{participant_name}},</p>
<p>This is a friendly reminder that your course <strong>{{course_name}}</strong> starts {{time_until_start}}.</p>
<p><strong>Course Details:</strong></p>
<ul>
<li>Start Date: {{course_start_date}}</li>
<li>Duration: {{course_duration}}</li>
<li>Location: {{course_location}}</li>
</ul>
<p>{{#survey_incomplete}}<strong>Action Required:</strong> Please complete your pre-course survey before the course begins.<br>
<a href="{{survey_link}}" style="background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Survey</a>{{/survey_incomplete}}</p>
<p>We''re excited to have you join us!</p>', 
'["course_name", "participant_name", "time_until_start", "course_start_date", "course_duration", "course_location", "survey_incomplete", "survey_link"]'::jsonb, true);

-- Create function to automatically generate timeline events when course is created
CREATE OR REPLACE FUNCTION generate_course_timeline_events()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timeline generation
DROP TRIGGER IF EXISTS generate_timeline_on_course_create ON course_schedules;
CREATE TRIGGER generate_timeline_on_course_create
    AFTER INSERT ON course_schedules
    FOR EACH ROW
    EXECUTE FUNCTION generate_course_timeline_events();

-- Create function to update timeline when course is modified
CREATE OR REPLACE FUNCTION update_course_timeline_events()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete existing timeline events for the course
    DELETE FROM course_timeline_events WHERE course_schedule_id = NEW.id;
    
    -- Regenerate timeline events
    PERFORM generate_course_timeline_events();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger for email_templates
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();