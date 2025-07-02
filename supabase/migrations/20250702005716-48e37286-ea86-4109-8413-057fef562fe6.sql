-- Enable pg_cron extension for scheduling email campaigns
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to run the email automation function every hour
SELECT cron.schedule(
  'course-email-automation',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://dntowvxkzsvqsykoranf.supabase.co/functions/v1/course-email-automation',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudG93dnhrenN2cXN5a29yYW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NDMzMzgsImV4cCI6MjA1OTExOTMzOH0.wTdX-y87ALurbbKSc3wgVEd_GEBlv5lN7QCtsTnuSSY"}'::jsonb,
        body:='{"action": "send_scheduled_emails"}'::jsonb
    ) as request_id;
  $$
);