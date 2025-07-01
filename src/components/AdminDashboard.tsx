
import { useState } from 'react';
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
  Eye
} from 'lucide-react';
import UserManagement from './UserManagement';
import CourseManagement from './CourseManagement';
import SurveyReviewer from './SurveyReviewer';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const mockAdminData = {
    totalLearners: 0,
    activeCourses: 8,
    pendingSurveys: 0,
    completionRate: 0,
    recentActivity: [],
    upcomingTasks: [
      { id: 1, task: "Review Q4 Survey Responses", priority: "high", due: "Today" },
      { id: 2, task: "Update Module 4 Content", priority: "medium", due: "Tomorrow" },
      { id: 3, task: "Send Weekly Progress Report", priority: "low", due: "Friday" },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/d0544c04-760a-4cf9-824c-612e5ef4aeaa.png" 
                alt="Unboxable" 
                className="h-8"
              />
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-unboxable-navy">Admin Portal</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Administrator</span>
              <Button variant="ghost" size="sm" onClick={onLogout} className="hover:bg-slate-100">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="surveys">Surveys</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-unboxable-navy" />
                    Total Learners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-unboxable-navy">{mockAdminData.totalLearners}</div>
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
                  <div className="text-2xl font-bold text-unboxable-navy">{mockAdminData.activeCourses}</div>
                  <p className="text-xs text-gray-600 mt-1">Across 3 departments</p>
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
                  <div className="text-2xl font-bold text-unboxable-orange">{mockAdminData.pendingSurveys}</div>
                  <p className="text-xs text-gray-600 mt-1">No surveys pending</p>
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
                  <div className="text-2xl font-bold text-green-600">{mockAdminData.completionRate}%</div>
                  <p className="text-xs text-gray-600 mt-1">Add learners to track progress</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <div className="space-y-4">
                    {mockAdminData.upcomingTasks.map((task) => (
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

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h3>
                  <p className="text-gray-600">Detailed analytics and reporting features coming soon.</p>
                  <p className="text-sm text-gray-500 mt-2">This will include learner progress trends, completion rates, and performance metrics.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
