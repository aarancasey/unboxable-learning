import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailCampaign {
  id: string;
  course_schedule_id: string;
  campaign_type: string;
  recipient_email: string;
  scheduled_date: string;
  scheduled_time: string;
  email_subject: string;
  email_content: string;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, campaignId, courseScheduleId } = await req.json();

    switch (action) {
      case "send_scheduled_emails":
        return await sendScheduledEmails();
      case "send_immediate_email":
        return await sendImmediateEmail(campaignId);
      case "create_email_campaign":
        return await createEmailCampaign(req);
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    console.error("Error in course-email-automation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
};

async function sendScheduledEmails(): Promise<Response> {
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

  // Get emails scheduled for today and current hour
  const { data: emails, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('status', 'scheduled')
    .eq('scheduled_date', today)
    .lte('scheduled_time', currentTime);

  if (error) {
    throw new Error(`Failed to fetch scheduled emails: ${error.message}`);
  }

  console.log(`Found ${emails?.length || 0} emails to send`);

  const results = [];
  for (const email of emails || []) {
    try {
      const emailResult = await resend.emails.send({
        from: "Unboxable Learning <noreply@unboxable.com>",
        to: [email.recipient_email],
        subject: email.email_subject,
        html: email.email_content,
      });

      // Update email status
      await supabase
        .from('email_campaigns')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        })
        .eq('id', email.id);

      results.push({ email: email.recipient_email, status: 'sent', id: emailResult.data?.id });
      console.log(`Email sent to ${email.recipient_email}`);
    } catch (error) {
      console.error(`Failed to send email to ${email.recipient_email}:`, error);
      
      // Update email status to failed
      await supabase
        .from('email_campaigns')
        .update({ status: 'failed' })
        .eq('id', email.id);

      results.push({ email: email.recipient_email, status: 'failed', error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ message: `Processed ${results.length} emails`, results }),
    { status: 200, headers: corsHeaders }
  );
}

async function sendImmediateEmail(campaignId: string): Promise<Response> {
  const { data: email, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (error || !email) {
    throw new Error(`Email campaign not found: ${error?.message}`);
  }

  try {
    const emailResult = await resend.emails.send({
      from: "Unboxable Learning <noreply@unboxable.com>",
      to: [email.recipient_email],
      subject: email.email_subject,
      html: email.email_content,
    });

    await supabase
      .from('email_campaigns')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString() 
      })
      .eq('id', campaignId);

    return new Response(
      JSON.stringify({ message: "Email sent successfully", emailId: emailResult.data?.id }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    await supabase
      .from('email_campaigns')
      .update({ status: 'failed' })
      .eq('id', campaignId);

    throw error;
  }
}

async function createEmailCampaign(req: Request): Promise<Response> {
  const {
    courseScheduleId,
    campaignType,
    recipientEmails,
    scheduledDate,
    scheduledTime,
    emailSubject,
    emailContent
  } = await req.json();

  const campaigns = recipientEmails.map((email: string) => ({
    course_schedule_id: courseScheduleId,
    campaign_type: campaignType,
    recipient_email: email,
    scheduled_date: scheduledDate,
    scheduled_time: scheduledTime,
    email_subject: emailSubject,
    email_content: emailContent,
    status: 'scheduled'
  }));

  const { data, error } = await supabase
    .from('email_campaigns')
    .insert(campaigns)
    .select();

  if (error) {
    throw new Error(`Failed to create email campaigns: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ message: `Created ${campaigns.length} email campaigns`, data }),
    { status: 200, headers: corsHeaders }
  );
}

serve(handler);