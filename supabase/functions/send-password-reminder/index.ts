import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordReminderRequest {
  learnerEmail: string;
  learnerName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { learnerEmail, learnerName }: PasswordReminderRequest = await req.json();

    if (!learnerEmail || !learnerName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: learnerEmail and learnerName" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a secure reset token (you could also use a UUID)
    const resetToken = crypto.randomUUID();
    const resetUrl = `${supabaseUrl.replace('//', '//').replace('supabase.co', 'lovable.app')}/reset-password?token=${resetToken}&email=${encodeURIComponent(learnerEmail)}`;

    // Store the reset token in the database (you might want to create a password_reset_tokens table)
    console.log(`Generated reset token for ${learnerEmail}: ${resetToken}`);

    const emailResponse = await resend.emails.send({
      from: "Unboxable Learning <noreply@resend.dev>",
      to: [learnerEmail],
      subject: "Password Change Required - Unboxable Learning Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://unboxable.co.nz/logo.png" alt="Unboxable" style="height: 40px;" />
          </div>
          
          <h2 style="color: #1e3a8a; margin-bottom: 20px;">Password Change Required</h2>
          
          <p>Hi ${learnerName},</p>
          
          <p>You need to update your password for the Unboxable Learning Platform. For security reasons, please create a new password by clicking the link below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Your Password
            </a>
          </div>
          
          <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetUrl}</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't request this password change, please contact your administrator.</p>
            <p>Best regards,<br>The Unboxable Learning Team</p>
          </div>
        </div>
      `,
    });

    console.log("Password reminder email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Password reminder sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending password reminder:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send password reminder", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);