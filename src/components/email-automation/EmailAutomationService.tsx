import { supabase } from '@/integrations/supabase/client';

export interface CourseTimelineEvent {
  id: string;
  course_schedule_id: string;
  event_type: string;
  event_date: string;
  event_time: string;
  email_template_id?: string;
  target_recipients: string[];
  event_data: any;
  status: string;
}

export interface EmailCampaign {
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

export class EmailAutomationService {
  static async createEmailCampaign(campaignData: {
    courseScheduleId: string;
    campaignType: string;
    recipientEmails: string[];
    scheduledDate: string;
    scheduledTime: string;
    emailSubject: string;
    emailContent: string;
  }): Promise<EmailCampaign[]> {
    const { data, error } = await supabase.functions.invoke('course-email-automation', {
      body: {
        action: 'create_email_campaign',
        ...campaignData
      }
    });

    if (error) throw error;
    return data.data;
  }

  static async sendImmediateEmail(campaignId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('course-email-automation', {
      body: {
        action: 'send_immediate_email',
        campaignId
      }
    });

    if (error) throw error;
    return data;
  }

  static async processScheduledEmails(): Promise<void> {
    const { data, error } = await supabase.functions.invoke('course-email-automation', {
      body: {
        action: 'send_scheduled_emails'
      }
    });

    if (error) throw error;
    return data;
  }

  static async getTimelineEvents(courseScheduleId: string): Promise<CourseTimelineEvent[]> {
    const { data, error } = await supabase
      .from('course_timeline_events')  
      .select('*')
      .eq('course_schedule_id', courseScheduleId)
      .order('event_date', { ascending: true });

    if (error) throw error;
    
    return (data || []).map(event => ({
      ...event,
      target_recipients: Array.isArray(event.target_recipients) 
        ? event.target_recipients.map(r => typeof r === 'string' ? r : String(r))
        : [],
      event_data: event.event_data || {}
    }));
  }

  static async getEmailCampaigns(courseScheduleId: string): Promise<EmailCampaign[]> {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('course_schedule_id', courseScheduleId)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    return (data || []).map(campaign => ({
      ...campaign,
      // Ensure all fields are properly typed
      scheduled_date: campaign.scheduled_date,
      scheduled_time: campaign.scheduled_time
    }));
  }

  static generateEmailContent(template: string, variables: Record<string, any>): string {
    let content = template;
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, value?.toString() || '');
    });
    
    // Handle conditional sections
    content = content.replace(/\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/gs, (match, condition, conditionalContent) => {
      return variables[condition] ? conditionalContent : '';
    });
    
    return content;
  }

  static async getLearnerEmails(courseScheduleId: string): Promise<string[]> {
    // Get enrolled learners for the course
    const { data: courseData, error: courseError } = await supabase
      .from('course_schedules')
      .select('*')
      .eq('id', courseScheduleId)
      .single();

    if (courseError) throw courseError;

    // For now, return all active learners
    // In a real system, you'd have a course enrollment table
    const { data: learners, error: learnersError } = await supabase
      .from('learners')
      .select('email')
      .eq('status', 'active');

    if (learnersError) throw learnersError;
    
    return learners?.map(l => l.email) || [];
  }
}