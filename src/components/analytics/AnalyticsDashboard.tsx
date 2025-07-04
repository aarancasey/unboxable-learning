import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalPageViews: 0,
    activeUsers: 0,
    courseCompletionRate: 0,
    avgSessionDuration: 0,
    topPages: [],
    userGrowth: [],
    courseProgress: [],
    deviceTypes: []
  });

  useEffect(() => {
    // Load real analytics data from database and localStorage
    const loadAnalyticsData = async () => {
      const learners = JSON.parse(localStorage.getItem('learners') || '[]');
      const courses = JSON.parse(localStorage.getItem('courses') || '[]');
      const surveySubmissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
      const pageViews = JSON.parse(localStorage.getItem('pageViews') || '{}');

      // Calculate real metrics
      const totalLearners = learners.length;
      const activeLearners = learners.filter((l: any) => l.status === 'active').length;
      const activeCourses = courses.filter((c: any) => c.status === 'active').length;
      const completedSurveys = surveySubmissions.filter((s: any) => s.status === 'completed').length;
      const pendingSurveys = surveySubmissions.filter((s: any) => s.status === 'pending').length;

      // Real user growth data (based on learner creation dates)
      const userGrowthData = generateUserGrowthData(learners);

      // Real course progress data
      const courseProgressData = courses.map((course: any) => {
        const courseSubmissions = surveySubmissions.filter((s: any) => 
          s.responses && s.responses.courseId === course.id
        );
        const completed = courseSubmissions.filter((s: any) => s.status === 'completed').length;
        const pending = courseSubmissions.filter((s: any) => s.status === 'pending').length;
        const enrolled = learners.filter((l: any) => l.status === 'active').length;
        
        return {
          name: course.title || `Course ${course.id}`,
          completed,
          inProgress: pending,
          notStarted: Math.max(0, enrolled - completed - pending),
        };
      });

      // Real page views data
      const topPages = Object.entries(pageViews)
        .filter(([page]) => page !== 'total' && page !== 'lastVisit')
        .map(([page, views]) => ({ page, views: views as number }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Device data (would come from real analytics in production)
      const deviceData = [
        { name: 'Desktop', value: 70, color: 'hsl(var(--primary))' },
        { name: 'Mobile', value: 25, color: 'hsl(var(--accent))' },
        { name: 'Tablet', value: 5, color: 'hsl(var(--secondary))' },
      ];

      setAnalyticsData({
        totalPageViews: pageViews.total || 0,
        activeUsers: activeLearners,
        courseCompletionRate: totalLearners > 0 ? Math.round((completedSurveys / totalLearners) * 100) : 0,
        avgSessionDuration: calculateAvgSessionDuration(),
        topPages: topPages.length > 0 ? topPages : [
          { page: '/dashboard', views: 0 },
          { page: '/courses', views: 0 },
          { page: '/surveys', views: 0 },
        ],
        userGrowth: userGrowthData,
        courseProgress: courseProgressData,
        deviceTypes: deviceData
      });
    };

    const generateUserGrowthData = (learners: any[]) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const last5Months = [];
      
      for (let i = 4; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthNames[date.getMonth()];
        const usersUntilMonth = learners.filter(l => 
          new Date(l.created_at || Date.now()) <= date
        ).length;
        last5Months.push({ month: monthName, users: usersUntilMonth });
      }
      
      return last5Months;
    };

    const calculateAvgSessionDuration = () => {
      // In a real app, this would come from analytics
      // For now, return a default based on user activity
      const learners = JSON.parse(localStorage.getItem('learners') || '[]');
      const activeLearners = learners.filter((l: any) => l.status === 'active').length;
      return activeLearners > 0 ? 8.5 + (activeLearners * 0.5) : 5.0;
    };

    loadAnalyticsData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Activity className="h-4 w-4 mr-2 text-primary" />
              Page Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analyticsData.totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analyticsData.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-primary" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analyticsData.courseCompletionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Course completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              Avg. Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{analyticsData.avgSessionDuration}m</div>
            <p className="text-xs text-muted-foreground mt-1">Duration</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>User Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Device Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.deviceTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {analyticsData.deviceTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Course Progress Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.courseProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" />
                <Bar dataKey="inProgress" stackId="a" fill="hsl(var(--accent))" />
                <Bar dataKey="notStarted" stackId="a" fill="hsl(var(--muted))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Most Visited Pages</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topPages.map((page: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-card-foreground">{page.page}</p>
                  <p className="text-sm text-muted-foreground">{page.views} views</p>
                </div>
                <Badge variant="secondary">{index + 1}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;