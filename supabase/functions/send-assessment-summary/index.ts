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
    const { learnerName, learnerEmail, summary, surveyTitle } = await req.json();

    if (!learnerEmail || !learnerName || !summary) {
      return new Response(
        JSON.stringify({ error: "learnerEmail, learnerName, and summary are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending assessment summary to: ${learnerEmail}`);

    const emailResult = await resend.emails.send({
      from: "Unboxable Learning <onboarding@resend.dev>",
      to: [learnerEmail],
      subject: `🎓 Your Leadership Assessment Results - ${surveyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            
            <!-- Header with Unboxable branding -->
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2B4A7C; padding-bottom: 20px;">
              <img src="https://dntowvxkzsvqsykoran.supabase.co/storage/v1/object/public/assets/unboxable-logo.png" alt="Unboxable Logo" style="height: 40px; margin-bottom: 10px;" />
              <h1 style="color: #2B4A7C; margin: 10px 0; font-size: 28px;">Your Leadership Assessment Results</h1>
              <p style="color: #666; margin: 0;">Comprehensive analysis of your leadership capabilities and development opportunities</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">Hi ${learnerName},</p>
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Thank you for completing the <strong>${surveyTitle}</strong>. We're pleased to share your personalized leadership assessment results below.
              </p>
            </div>

            <!-- Section 1: Leadership Sentiment Snapshot -->
            <div style="margin-bottom: 25px;">
              <h2 style="color: #2B4A7C; border-left: 4px solid #FF4D00; padding-left: 15px; margin-bottom: 15px;">
                1. Leadership Sentiment Snapshot
              </h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                  <h4 style="color: #2B4A7C; margin: 0 0 8px 0;">Current Leadership Style</h4>
                  <p style="margin: 0; background-color: #E8F0FE; padding: 8px; border-radius: 4px; font-size: 14px;">
                    ${summary.currentLeadershipStyle || 'Managing, but close to overload'}
                  </p>
                </div>
                <div style="padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                  <h4 style="color: #2B4A7C; margin: 0 0 8px 0;">Confidence Rating</h4>
                  <p style="margin: 0; background-color: #E8F5E8; padding: 8px; border-radius: 4px; font-size: 14px;">
                    ${summary.confidenceRating || 'Developing Confidence (2.5–3.4)'}
                  </p>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="padding: 12px; background-color: #F0F9F0; border: 1px solid #C8E6C9; border-radius: 6px;">
                  <h4 style="color: #2E7D32; margin: 0 0 8px 0;">✓ Your Strongest Area</h4>
                  <p style="margin: 0; color: #1B5E20; font-size: 14px;">
                    ${summary.strongestArea || 'Motivate and align your team'}
                  </p>
                </div>
                <div style="padding: 12px; background-color: #FFF3E0; border: 1px solid #FFCC02; border-radius: 6px;">
                  <h4 style="color: #E65100; margin: 0 0 8px 0;">→ Area to Focus On</h4>
                  <p style="margin: 0; color: #BF360C; font-size: 14px;">
                    ${summary.focusArea || 'Lead through complexity and ambiguity'}
                  </p>
                </div>
              </div>
            </div>

            <!-- Section 2: Leadership Intent & Purpose -->
            <div style="margin-bottom: 25px;">
              <h2 style="color: #2B4A7C; border-left: 4px solid #2B4A7C; padding-left: 15px; margin-bottom: 15px;">
                2. Leadership Intent & Purpose
              </h2>
              <div style="margin-bottom: 15px;">
                <h4 style="color: #2B4A7C; margin: 0 0 10px 0;">Your Leadership Aspirations</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  ${(summary.leadershipAspirations || ['Empowering and people-centred', 'Strategic and future-focused', 'Curious and adaptive']).map((aspiration: string) => 
                    `<span style="background-color: #E8F0FE; color: #2B4A7C; padding: 6px 12px; border-radius: 20px; font-size: 13px; border: 1px solid #2B4A7C;">${aspiration}</span>`
                  ).join('')}
                </div>
              </div>
              <div style="padding: 15px; background-color: #E3F2FD; border: 1px solid #90CAF9; border-radius: 6px;">
                <h4 style="color: #2B4A7C; margin: 0 0 10px 0;">Connection to Purpose Rating</h4>
                <p style="margin: 0; font-size: 16px;">
                  <span style="font-size: 24px; font-weight: bold; color: #2B4A7C;">${summary.purposeRating || '4'}</span>
                  <span style="color: #666;"> / 6 - Connected and gaining clarity</span>
                </p>
              </div>
            </div>

            <!-- Section 3: Adaptive & Agile Leadership -->
            <div style="margin-bottom: 25px;">
              <h2 style="color: #2B4A7C; border-left: 4px solid #FF4D00; padding-left: 15px; margin-bottom: 15px;">
                3. Adaptive & Agile Leadership Snapshot
              </h2>
              <div style="margin-bottom: 15px;">
                <h4 style="color: #2B4A7C; margin: 0 0 10px 0;">Your Leadership Agility Level</h4>
                <span style="background-color: #FFF3E0; color: #FF4D00; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; border: 1px solid #FF4D00;">
                  ${summary.agilityLevel || 'Achiever'}
                </span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="padding: 15px; background-color: #F0F9F0; border: 1px solid #C8E6C9; border-radius: 6px;">
                  <h4 style="color: #2E7D32; margin: 0 0 12px 0;">🌟 Your Top Strengths</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #1B5E20;">
                    ${(summary.topStrengths || ['Action Orientation & Delivery', 'Decision-Making Agility', 'Empowering Others & Collaboration']).map((strength: string) => 
                      `<li style="margin-bottom: 6px; font-size: 14px;">${strength}</li>`
                    ).join('')}
                  </ul>
                </div>
                <div style="padding: 15px; background-color: #FFF3E0; border: 1px solid #FFCC02; border-radius: 6px;">
                  <h4 style="color: #E65100; margin: 0 0 12px 0;">🎯 Development Opportunities</h4>
                  <ul style="margin: 0; padding-left: 20px; color: #BF360C;">
                    ${(summary.developmentAreas || ['Navigating Change & Uncertainty', 'Strategic Agility & Systems Thinking', 'Learning Agility & Growth Mindset']).map((area: string) => 
                      `<li style="margin-bottom: 6px; font-size: 14px;">${area}</li>`
                    ).join('')}
                  </ul>
                </div>
              </div>
            </div>

            <!-- Section 4: Overall Assessment -->
            <div style="margin-bottom: 25px;">
              <h2 style="color: #2B4A7C; border-left: 4px solid #666; padding-left: 15px; margin-bottom: 15px;">
                4. Overall Assessment Summary
              </h2>
              <div style="padding: 20px; background-color: #F5F5F5; border: 1px solid #DDD; border-radius: 6px;">
                <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6;">
                  ${summary.overallAssessment || 'This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.'}
                </p>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #E8F0FE; border: 1px solid #2B4A7C; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #2B4A7C; margin-top: 0; font-size: 18px;">🚀 What's Next?</h3>
              <ul style="color: #374151; margin: 10px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Review your personalized development recommendations</li>
                <li style="margin-bottom: 8px;">Access targeted learning modules in your portal</li>
                <li style="margin-bottom: 8px;">Schedule a follow-up discussion with your supervisor</li>
                <li style="margin-bottom: 8px;">Continue tracking your leadership growth journey</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://dntowvxkzsvqsykoran.supabase.co" style="background-color: #2B4A7C; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                🎯 Continue Your Learning Journey
              </a>
            </div>

            <div style="background-color: #f9fafb; border-radius: 6px; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                <strong>Questions about your results?</strong> Contact our learning support team or discuss with your supervisor for additional insights.
              </p>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <div style="text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This assessment was sent to ${learnerEmail}<br>
                Unboxable Learning Platform | Empowering Leadership Growth | ${new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Assessment summary email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Assessment summary sent successfully!",
        emailId: emailResult.data?.id,
        recipient: learnerEmail
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error sending assessment summary:", error);
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