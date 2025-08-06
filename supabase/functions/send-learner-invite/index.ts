import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    
    const emailResult = await resend.emails.send({
      from: "Unboxable Learning <onboarding@resend.dev>", // Using default Resend domain
      to: [learnerEmail],
      subject: "🎓 Welcome to Unboxable Learning - Your Invitation Inside",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e3a8a; margin: 0; font-size: 28px;">🎓 Welcome to Unboxable Learning!</h1>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">Hi ${learnerName},</p>
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                You've been invited to join our learning platform! We're excited to have you from the <strong>${department}</strong> department as part of our learning community.
              </p>
            </div>

            <div style="background-color: #eff6ff; border: 1px solid: #93c5fd; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">🚀 What's Next?</h3>
              <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Access your personalized learning dashboard</li>
                <li style="margin-bottom: 8px;">Complete your pre-course survey</li>
                <li style="margin-bottom: 8px;">Explore available learning modules</li>
                <li style="margin-bottom: 8px;">Track your progress and achievements</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://dntowvxkzsvqsykoran.supabase.co" style="background-color: #1e40af; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
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
                This invitation was sent to ${learnerEmail}<br>
                Unboxable Learning Platform | Empowering Growth Through Learning
              </p>
            </div>
          </div>
        </div>
      `,
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
        recipient: learnerEmail
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