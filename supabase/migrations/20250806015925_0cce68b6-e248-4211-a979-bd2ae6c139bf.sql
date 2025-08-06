-- Insert default learner invitation email template
INSERT INTO email_templates (
  template_name,
  template_type,
  subject_template,
  content_template,
  html_template,
  variables,
  is_default
) VALUES (
  'Learner Invitation',
  'learner_invitation',
  '🎓 Welcome to {{platform_name}} - Your Invitation Inside',
  'Hi {{learner_name}},

You''ve been invited to join our learning platform! We''re excited to have you from the {{department}} department as part of our learning community.

What''s Next?
- Access your personalized learning dashboard
- Complete your pre-course survey
- Explore available learning modules
- Track your progress and achievements

Click here to access the learning portal: {{portal_url}}

Having trouble? Contact our support team or reply to this email for assistance.

This invitation was sent to {{learner_email}}
{{platform_name}} | Empowering Growth Through Learning',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
    <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e3a8a; margin: 0; font-size: 28px;">🎓 Welcome to {{platform_name}}!</h1>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">Hi {{learner_name}},</p>
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          You''ve been invited to join our learning platform! We''re excited to have you from the <strong>{{department}}</strong> department as part of our learning community.
        </p>
      </div>

      <div style="background-color: #eff6ff; border: 1px solid: #93c5fd; border-radius: 6px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">🚀 What''s Next?</h3>
        <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Access your personalized learning dashboard</li>
          <li style="margin-bottom: 8px;">Complete your pre-course survey</li>
          <li style="margin-bottom: 8px;">Explore available learning modules</li>
          <li style="margin-bottom: 8px;">Track your progress and achievements</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="{{portal_url}}" style="background-color: #1e40af; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
          🎯 Access Learning Portal
        </a>
      </div>

      <div style="background-color: #f9fafb; border-radius: 6px; padding: 15px; margin: 25px 0;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          <strong>Having trouble?</strong> Contact our support team or reply to this email for assistance.
        </p>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      
      <div style="text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          This invitation was sent to {{learner_email}}<br>
          {{platform_name}} | Empowering Growth Through Learning
        </p>
      </div>
    </div>
  </div>',
  ARRAY['learner_name', 'learner_email', 'department', 'platform_name', 'portal_url'],
  true
);