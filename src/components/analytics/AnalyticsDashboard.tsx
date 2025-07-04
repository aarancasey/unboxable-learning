import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { AnalyticsMetrics } from './AnalyticsMetrics';
import { UserGrowthChart } from './UserGrowthChart';
import { DeviceTypesChart } from './DeviceTypesChart';
import { CourseProgressChart } from './CourseProgressChart';
import { TopPagesCard } from './TopPagesCard';

const AnalyticsDashboard = () => {
  const { analyticsData, loading } = useAnalyticsData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <AnalyticsMetrics
        totalPageViews={analyticsData.totalPageViews}
        activeUsers={analyticsData.activeUsers}
        courseCompletionRate={analyticsData.courseCompletionRate}
        avgSessionDuration={analyticsData.avgSessionDuration}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <UserGrowthChart data={analyticsData.userGrowth} />

        {/* Device Types */}
        <DeviceTypesChart data={analyticsData.deviceTypes} />

        {/* Course Progress */}
        <CourseProgressChart data={analyticsData.courseProgress} />
      </div>

      {/* Top Pages */}
      <TopPagesCard pages={analyticsData.topPages} />
    </div>
  );
};

export default AnalyticsDashboard;