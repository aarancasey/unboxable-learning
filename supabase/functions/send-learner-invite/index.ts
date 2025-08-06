import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY environment variable not found");
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY not configured",
          message: "Please add your Resend API key to Supabase Edge Functions secrets"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("RESEND_API_KEY found, length:", resendApiKey.length);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const resend = new Resend(resendApiKey);
    const { learnerName, learnerEmail, department } = await req.json();

    if (!learnerEmail || !learnerName) {
      return new Response(
        JSON.stringify({ error: "learnerEmail and learnerName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending invitation to: ${learnerEmail}`);

    console.log(`Attempting to send email with API key: ${resendApiKey.substring(0, 10)}...`);
    
    // Get the learner invitation email template
    const { data: templates, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_type', 'learner_invitation')
      .eq('is_default', true)
      .limit(1);

    if (templateError) {
      console.error('Error fetching email template:', templateError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch email template",
          message: templateError.message
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!templates || templates.length === 0) {
      console.error('No learner invitation template found');
      return new Response(
        JSON.stringify({ 
          error: "Email template not found",
          message: "No learner invitation template configured"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const template = templates[0];
    
    // Replace template variables
    const variables = {
      learner_name: learnerName,
      learner_email: learnerEmail,
      department: department,
      platform_name: 'Unboxable Learning',
      portal_url: 'https://dntowvxkzsvqsykoranf.supabase.co'
    };

    let subject = template.subject_template;
    let htmlContent = template.content_template;

    // Replace variables in subject and content
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      subject = subject.replace(regex, value || '');
      htmlContent = htmlContent.replace(regex, value || '');
    });
    
    const emailResult = await resend.emails.send({
      from: "Unboxable Learning <onboarding@resend.dev>",
      to: [learnerEmail],
      subject: subject,
      html: htmlContent,
    });

    if (emailResult.error) {
      console.error("Resend API error:", emailResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Email sending failed",
          message: emailResult.error.message || "Failed to send invitation email",
          details: emailResult.error
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Invitation email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Invitation sent successfully!",
        emailId: emailResult.data?.id,
        recipient: learnerEmail,
        template_used: template.template_name
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error sending invitation:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.cause || "Unknown error occurred"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);