
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
import UserManagement from './UserManagement';
import CourseManagement from './CourseManagement';
import SurveyReviewer from './SurveyReviewer';
import { CalendarView } from './calendar/CalendarView';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';
import EmailTestModal from './EmailTestModal';
import { EmailTemplateManager } from './email-management/EmailTemplateManager';
import { ContentLibraryManager } from './content-library/ContentLibraryManager';
import { DataService } from '@/services/dataService';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminData, setAdminData] = useState({
    totalLearners: 0,
    activeCourses: 0,
    pendingSurveys: 0,
    completionRate: 0,
    recentActivity: [],
    upcomingTasks: []
  });

  // Update admin data based on survey submissions and learners
  useEffect(() => {
    const loadAdminData = async () => {
      const savedSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
      const learners = await DataService.getLearners();
      
      // Calculate completion rate based on active learners
      const activeLearners = learners.filter(learner => learner.status === 'active').length;
      const completionRate = learners.length > 0 ? Math.round((activeLearners / learners.length) * 100) : 0;
      
      setAdminData(prev => ({
        ...prev,
        totalLearners: learners.length,
        activeCourses: savedSurveys.length > 0 ? 1 : 0,
        pendingSurveys: savedSurveys.filter(survey => survey.status === 'pending').length,
        completionRate
      }));
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
              <div className="hidden sm:block">
                <EmailTestModal />
              </div>
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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-2">Learners</TabsTrigger>
            <TabsTrigger value="courses" className="text-xs sm:text-sm px-2 py-2">Courses</TabsTrigger>
            <TabsTrigger value="surveys" className="text-xs sm:text-sm px-2 py-2">Surveys</TabsTrigger>
            <TabsTrigger value="content-library" className="text-xs sm:text-sm px-2 py-2">Content Library</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs sm:text-sm px-2 py-2">Calendar</TabsTrigger>
            <TabsTrigger value="emails" className="text-xs sm:text-sm px-2 py-2">Email Templates</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-2">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                    <BookOpen className="h-4 w-4 mr-2 text-unboxable-navy" />
                    Active Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-unboxable-navy">{adminData.activeCourses}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    {adminData.activeCourses === 0 ? 'Complete surveys to unlock courses' : 'Module 2 available'}
                  </p>
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
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No recent activity</p>
                    <p className="text-sm text-gray-500">Activity will appear here once learners start engaging with content</p>
                  </div>
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
                    <div className="space-y-4">
                      {adminData.upcomingTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-unboxable-navy">{task.task}</p>
                            <p className="text-xs text-gray-500">Due: {task.due}</p>
                          </div>
                          <Badge 
                            variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                          >
                            {task.priority}
                          </Badge>
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
            <SurveyReviewer />
          </TabsContent>

          <TabsContent value="content-library">
            <ContentLibraryManager />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="emails">
            <EmailTemplateManager />
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
