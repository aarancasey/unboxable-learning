-- Insert default survey completion email template
INSERT INTO email_templates (
  template_name,
  template_type,
  subject_template,
  content_template,
  html_template,
  variables,
  is_default
) VALUES (
  'Default Survey Completion',
  'survey_completion',
  '🎓 Your {{surveyTitle}} Results Are Ready!',
  'Hi {{learnerName}},

Thank you for completing the {{surveyTitle}} on {{completionDate}}. 

Your personalized results and development recommendations are now available for review. This assessment provides valuable insights into your leadership capabilities and growth opportunities.

Key highlights from your assessment:
- Comprehensive analysis of your leadership style
- Personalized development recommendations  
- Action items for continued growth

We encourage you to review your results and discuss them with your supervisor or learning coach to maximize your development journey.

Best regards,
The Unboxable Learning Team',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2B4A7C; padding-bottom: 20px;">
      <h1 style="color: #2B4A7C; margin: 10px 0; font-size: 28px;">🎓 Survey Complete!</h1>
      <p style="color: #666; margin: 0;">Your {{surveyTitle}} results are ready</p>
    </div>
    
    <div style="margin-bottom: 25px;">
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">Hi {{learnerName}},</p>
      <p style="font-size: 16px; color: #374151; line-height: 1.6;">
        Thank you for completing the <strong>{{surveyTitle}}</strong> on {{completionDate}}. Your personalized results and development recommendations are now available.
      </p>
    </div>

    <!-- Key Benefits -->
    <div style="background-color: #E8F0FE; border: 1px solid #2B4A7C; border-radius: 6px; padding: 20px; margin: 25px 0;">
      <h3 style="color: #2B4A7C; margin-top: 0; font-size: 18px;">📊 What You''ll Find in Your Results:</h3>
      <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Comprehensive analysis of your leadership capabilities</li>
        <li style="margin-bottom: 8px;">Personalized development recommendations</li>
        <li style="margin-bottom: 8px;">Actionable insights for continued growth</li>
        <li style="margin-bottom: 8px;">Areas of strength and development opportunities</li>
      </ul>
    </div>

    <!-- Call to Action -->
    <div style="text-align: center; margin: 30px 0;">
      <p style="color: #374151; margin-bottom: 15px;">Ready to explore your results?</p>
      <a href="#" style="background-color: #2B4A7C; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
        📈 View Your Results
      </a>
    </div>

    <!-- Next Steps -->
    <div style="background-color: #f9fafb; border-radius: 6px; padding: 15px; margin: 25px 0;">
      <h4 style="color: #2B4A7C; margin-top: 0;">🚀 Recommended Next Steps:</h4>
      <ul style="color: #374151; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 6px;">Review your detailed assessment results</li>
        <li style="margin-bottom: 6px;">Discuss findings with your supervisor or coach</li>
        <li style="margin-bottom: 6px;">Identify priority development areas</li>
        <li style="margin-bottom: 6px;">Create an action plan for growth</li>
      </ul>
    </div>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
    
    <div style="text-align: center;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        This assessment completion notice was sent to {{learnerName}}<br>
        Unboxable Learning Platform | {{completionDate}}
      </p>
    </div>
  </div>
</div>',
  '["learnerName", "surveyTitle", "completionDate"]'::jsonb,
  true
) ON CONFLICT (template_type, is_default) 
DO UPDATE SET
  template_name = EXCLUDED.template_name,
  subject_template = EXCLUDED.subject_template,
  content_template = EXCLUDED.content_template,
  html_template = EXCLUDED.html_template,
  variables = EXCLUDED.variables,
  updated_at = now()
WHERE email_templates.template_type = 'survey_completion' AND email_templates.is_default = true;