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
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY not configured",
          message: "Please add your Resend API key to Supabase secrets"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const { testEmail } = await req.json();

    if (!testEmail) {
      return new Response(
        JSON.stringify({ error: "testEmail is required in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Attempting to send test email to: ${testEmail}`);

    const emailResult = await resend.emails.send({
      from: "Unboxable Learning <onboarding@resend.dev>", // Using default Resend domain for testing
      to: [testEmail],
      subject: "✅ Email Test - Unboxable Learning Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af; text-align: center;">🎉 Email Test Successful!</h1>
          <p>Congratulations! Your email system is working correctly.</p>
          <div style="background-color: #f0f9ff; border: 1px solid #0284c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">Test Details:</h3>
            <ul>
              <li><strong>Test Email:</strong> ${testEmail}</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              <li><strong>System:</strong> Unboxable Learning Platform</li>
            </ul>
          </div>
          <p style="color: #6b7280;">This email was sent automatically to test your email configuration.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Unboxable Learning Platform | Email System Test
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Test email sent successfully!",
        emailId: emailResult.data?.id,
        recipient: testEmail
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error sending test email:", error);
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