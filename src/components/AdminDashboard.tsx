
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Calendar,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Eye,
  ArrowLeft,
  Library
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import UserManagement from './UserManagement';
import CourseManagement from './CourseManagement';
import SurveyReviewer from './SurveyReviewer';
import SurveyEditor from './SurveyEditor';
import { CalendarView } from './calendar/CalendarView';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import ActivitiesView from './ActivitiesView';

import { EmailTemplateManager } from './email-management/EmailTemplateManager';
import { AssessmentRefactorTool } from './admin/AssessmentRefactorTool';
import { ContentLibraryManager } from './content-library/ContentLibraryManager';
import { SurveyEmailSettings } from './admin/SurveyEmailSettings';
import { DataService } from '@/services/dataService';
import { dateHelpers } from '@/lib/dateUtils';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminData, setAdminData] = useState({
    totalLearners: 0,
    pendingSurveys: 0,
    completionRate: 0,
    recentActivity: [],
    upcomingTasks: []
  });

  // Navigation helper function
  const navigateToTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Action handlers for activities
  const handleActivityAction = (activity: any) => {
    switch (activity.type) {
      case 'learner_registration':
        navigateToTab('users');
        break;
      case 'survey_submission':
        navigateToTab('surveys');
        break;
      case 'course_enrollment':
      case 'course_schedule':
        navigateToTab('courses');
        break;
      default:
        break;
    }
  };

  // Action handlers for tasks
  const handleTaskAction = async (task: any) => {
    switch (task.type) {
      case 'pending_survey':
        navigateToTab('surveys');
        break;
      case 'upcoming_course':
        navigateToTab('calendar');
        break;
      case 'password_change':
        await handleSendPasswordReminder(task);
        break;
      default:
        break;
    }
  };

  // Send password reminder function
  const handleSendPasswordReminder = async (task: any) => {
    try {
      // Extract learner info from task (you might need to adjust this based on your task structure)
      const learnerEmail = task.learnerEmail || task.email;
      const learnerName = task.learnerName || task.name;
      
      if (!learnerEmail || !learnerName) {
        toast.error("Missing learner information for password reminder");
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-password-reminder', {
        body: {
          learnerEmail,
          learnerName
        }
      });

      if (error) {
        console.error('Error sending password reminder:', error);
        toast.error("Failed to send password reminder");
        return;
      }

      toast.success(`Password reminder sent to ${learnerName}`);
    } catch (error) {
      console.error('Error sending password reminder:', error);
      toast.error("Failed to send password reminder");
    }
  };

  // Get action button text
  const getActionButtonText = (activity: any) => {
    switch (activity.type) {
      case 'learner_registration':
        return 'View Learner';
      case 'survey_submission':
        return 'View Survey';
      case 'course_enrollment':
      case 'course_schedule':
        return 'View Course';
      default:
        return 'View';
    }
  };

  // Get task action button text
  const getTaskActionText = (task: any) => {
    switch (task.type) {
      case 'pending_survey':
        return 'Review Now';
      case 'upcoming_course':
        return 'View Course';
      case 'password_change':
        return 'Send Reminder';
      default:
        return 'View Details';
    }
  };

  // Get priority styling
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  // Update admin data based on survey submissions and learners
  useEffect(() => {
    const loadAdminData = async () => {
      const [learners, surveys, recentActivity, upcomingTasks] = await Promise.all([
        DataService.getLearners(),
        DataService.getSurveySubmissions(),
        DataService.getRecentActivities(),
        DataService.getUpcomingTasks()
      ]);
      
      // Calculate completion rate based on active learners
      const activeLearners = learners.filter(learner => learner.status === 'active').length;
      const completionRate = learners.length > 0 ? Math.round((activeLearners / learners.length) * 100) : 0;
      
      setAdminData({
        totalLearners: learners.length,
        pendingSurveys: surveys.filter(survey => survey.status === 'pending').length,
        completionRate,
        recentActivity,
        upcomingTasks
      });
    };
    
    loadAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = 'https://unboxable.co.nz'}
                className="hover:bg-slate-100 text-unboxable-navy hover:text-unboxable-navy mr-2"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Back to Unboxable</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <img 
                src="/lovable-uploads/c8eb7e6b-35a2-4f41-a9d7-c1dd08c9b30b.png" 
                alt="Unboxable" 
                className="h-4 sm:h-6"
              />
              <div className="h-6 sm:h-8 w-px bg-gray-300 hidden sm:block"></div>
              <h1 className="text-lg sm:text-xl font-semibold text-unboxable-navy">Admin Portal</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden md:block">Administrator</span>
              <Button variant="ghost" size="sm" onClick={onLogout} className="hover:bg-slate-100">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-11 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-2">Learners</TabsTrigger>
            <TabsTrigger value="courses" className="text-xs sm:text-sm px-2 py-2">Courses</TabsTrigger>
            <TabsTrigger value="surveys" className="text-xs sm:text-sm px-2 py-2">Surveys</TabsTrigger>
            <TabsTrigger value="content-library" className="text-xs sm:text-sm px-2 py-2">Content Library</TabsTrigger>
            <TabsTrigger value="refactor" className="text-xs sm:text-sm px-2 py-2">Refactor</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs sm:text-sm px-2 py-2">Calendar</TabsTrigger>
            <TabsTrigger value="emails" className="text-xs sm:text-sm px-2 py-2">Email Templates</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 py-2">Settings</TabsTrigger>
            <TabsTrigger value="activities" className="text-xs sm:text-sm px-2 py-2">Activities</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-2">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-unboxable-navy" />
                    Total Learners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-unboxable-navy">{adminData.totalLearners}</div>
                  <p className="text-xs text-gray-600 mt-1">Start by adding learners</p>
                </CardContent>
              </Card>


              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-unboxable-orange" />
                    Pending Surveys
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-unboxable-orange">{adminData.pendingSurveys}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    {adminData.pendingSurveys === 0 ? 'No surveys pending' : 'Awaiting review'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{adminData.completionRate}%</div>
                  <p className="text-xs text-gray-600 mt-1">Add learners to track progress</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-unboxable-orange" />
                    <span className="text-unboxable-navy">Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {adminData.recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No recent activity</p>
                      <p className="text-sm text-gray-500">Activity will appear here once learners start engaging with content</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {adminData.recentActivity.slice(0, 4).map((activity) => (
                          <div key={activity.id} className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="flex-shrink-0 mt-1">
                                {activity.icon === 'user-plus' && <Users className="h-4 w-4 text-unboxable-navy" />}
                                {activity.icon === 'file-text' && <FileText className="h-4 w-4 text-unboxable-orange" />}
                                {activity.icon === 'calendar' && <Calendar className="h-4 w-4 text-green-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{activity.message}</p>
                                <p className="text-xs text-muted-foreground">
                                  {dateHelpers.dateTime(activity.timestamp)}
                                </p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleActivityAction(activity)}
                              className="ml-2 shrink-0"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {getActionButtonText(activity)}
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Activity Counter and View All Button */}
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Showing 4 of {adminData.recentActivity.length} activities
                        </span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => navigateToTab('activities')}
                          className="text-xs"
                        >
                          View All Activities
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-unboxable-orange" />
                    <span className="text-unboxable-navy">Upcoming Tasks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {adminData.upcomingTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No upcoming tasks</p>
                      <p className="text-sm text-gray-500">Tasks will appear here as they are scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adminData.upcomingTasks.map((task) => (
                        <div key={task.id} className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-medium text-foreground">{task.task}</p>
                              <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Due: {task.due}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleTaskAction(task)}
                            className="ml-2 shrink-0"
                          >
                            {getTaskActionText(task)}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="surveys">
            <Tabs defaultValue="review" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="review">Review Submissions</TabsTrigger>
                <TabsTrigger value="edit">Edit Survey</TabsTrigger>
              </TabsList>
              <TabsContent value="review" className="mt-6">
                <SurveyReviewer />
              </TabsContent>
              <TabsContent value="edit" className="mt-6">
                <SurveyEditor />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="content-library">
            <ContentLibraryManager />
          </TabsContent>

          <TabsContent value="refactor">
            <AssessmentRefactorTool />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="emails">
            <EmailTemplateManager />
          </TabsContent>

          <TabsContent value="settings">
            <SurveyEmailSettings />
          </TabsContent>

          <TabsContent value="activities">
            <ActivitiesView />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
