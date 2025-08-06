-- Update the HTML template with the custom LEADForward content and proper formatting
UPDATE email_templates 
SET html_template = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
    <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e3a8a; margin: 0; font-size: 28px;">LEADForward Leadership Programme</h1>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">Kia ora {{learner_name}},</p>
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          As part of the upcoming LEADForward Leadership Programme, we invite you to complete a self-assessment to help you reflect on your current leadership mindset, sense of purpose, and agility.
        </p>
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          This assessment is designed to give insight into how you lead today - how you''re feeling, what drives you, and how you respond in differing situations. There are no right or wrong answers. It''s a chance to pause, reflect, and establish a clear starting point for your leadership development.
        </p>
      </div>

      <div style="background-color: #eff6ff; border: 1px solid #93c5fd; border-radius: 6px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">📋 Assessment Details</h3>
        <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Duration: Approximately 20-25 minutes</li>
          <li style="margin-bottom: 8px;">Complete in a quiet space for best results</li>
          <li style="margin-bottom: 8px;">All responses are confidential</li>
          <li style="margin-bottom: 8px;">Used to prepare your personalized leadership summary</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="{{portal_url}}" style="background-color: #1e40af; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
          🎯 Access Learning Portal
        </a>
      </div>

      <div style="background-color: #f9fafb; border-radius: 6px; padding: 15px; margin: 25px 0;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          Your responses will be treated confidentially and used to prepare a personalised leadership summary. This will support your coaching and learning throughout the programme.
        </p>
      </div>

      <div style="margin: 20px 0;">
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          If you have any questions, feel free to reach out.
        </p>
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Ngā mihi,<br>
          <strong>Fiona Hewitt</strong><br>
          Facilitator & Coach<br>
          <a href="mailto:fiona@unboxable.co.nz" style="color: #1e40af;">fiona@unboxable.co.nz</a>
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
  </div>'
WHERE template_type = 'learner_invitation' AND is_default = true;