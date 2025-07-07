import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mail, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { EmailAutomationService, CourseTimelineEvent, EmailCampaign } from '../email-automation/EmailAutomationService';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

interface CourseTimelineViewProps {
  courseScheduleId: string;
  courseName: string;
  startDate: string;
  endDate: string;
}

export const CourseTimelineView = ({ 
  courseScheduleId, 
  courseName, 
  startDate, 
  endDate 
}: CourseTimelineViewProps) => {
  const [timelineEvents, setTimelineEvents] = useState<CourseTimelineEvent[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTimelineData();
  }, [courseScheduleId]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      const [events, campaigns] = await Promise.all([
        EmailAutomationService.getTimelineEvents(courseScheduleId),
        EmailAutomationService.getEmailCampaigns(courseScheduleId)
      ]);
      
      setTimelineEvents(events);
      setEmailCampaigns(campaigns);
    } catch (error: any) {
      toast({
        title: "Error loading timeline",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendImmediateEmail = async (campaignId: string) => {
    try {
      await EmailAutomationService.sendImmediateEmail(campaignId);
      toast({
        title: "Email sent",
        description: "Email has been sent successfully.",
      });
      loadTimelineData(); // Refresh to update status
    } catch (error: any) {
      toast({
        title: "Error sending email",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'email_reminder':
      case 'course_reminder':
        return <Mail className="h-4 w-4" />;
      case 'module_unlock':
        return <Play className="h-4 w-4" />;
      case 'survey_due':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string, status: string) => {
    if (status === 'sent') return 'bg-green-100 text-green-800';
    if (status === 'failed') return 'bg-red-100 text-red-800';
    
    switch (eventType) {
      case 'email_reminder':
      case 'course_reminder':
        return 'bg-blue-100 text-blue-800';
      case 'module_unlock':
        return 'bg-green-100 text-green-800';
      case 'survey_due':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{courseName} - Course Timeline</h2>
        <p className="text-muted-foreground">
          {format(parseISO(startDate), 'MMM dd, yyyy')} - {format(parseISO(endDate), 'MMM dd, yyyy')}
        </p>
      </div>

      <div className="grid gap-4">
        {/* Timeline Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Automated Timeline Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timelineEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No timeline events found for this course.
                </p>
              ) : (
                timelineEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.event_type)}
                        <Badge className={getEventColor(event.event_type, event.status)}>
                          {event.event_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium">
                          {format(parseISO(event.event_date), 'MMM dd, yyyy')} at {event.event_time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {event.event_type === 'module_unlock' 
                            ? `Module ${event.event_data?.module_number} unlock`
                            : `Email to ${event.target_recipients?.join(', ') || 'participants'}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(event.status)}
                      <span className="text-sm text-muted-foreground capitalize">
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emailCampaigns.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No email campaigns scheduled for this course.
                </p>
              ) : (
                emailCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getEventColor(campaign.campaign_type, campaign.status)}>
                          {campaign.campaign_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {getStatusIcon(campaign.status)}
                      </div>
                      <p className="font-medium">{campaign.email_subject}</p>
                      <p className="text-sm text-muted-foreground">
                        To: {campaign.recipient_email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Scheduled: {format(parseISO(campaign.scheduled_date), 'MMM dd, yyyy')} at {campaign.scheduled_time}
                      </p>
                    </div>
                    
                    {campaign.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleSendImmediateEmail(campaign.id)}
                      >
                        Send Now
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};