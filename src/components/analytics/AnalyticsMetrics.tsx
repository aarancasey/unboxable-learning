import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, CheckCircle, Clock } from 'lucide-react';

interface AnalyticsMetricsProps {
  totalPageViews: number;
  activeUsers: number;
  courseCompletionRate: number;
  avgSessionDuration: number;
}

export const AnalyticsMetrics = ({ 
  totalPageViews, 
  activeUsers, 
  courseCompletionRate, 
  avgSessionDuration 
}: AnalyticsMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Activity className="h-4 w-4 mr-2 text-primary" />
            Page Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{totalPageViews.toLocaleString()}</div>
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
          <div className="text-2xl font-bold text-primary">{activeUsers}</div>
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
          <div className="text-2xl font-bold text-primary">{courseCompletionRate}%</div>
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
          <div className="text-2xl font-bold text-primary">{avgSessionDuration}m</div>
          <p className="text-xs text-muted-foreground mt-1">Duration</p>
        </CardContent>
      </Card>
    </div>
  );
};