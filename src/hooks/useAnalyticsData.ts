import { useState, useEffect } from 'react';
import { generateUserGrowthData, calculateAvgSessionDuration, processPageViews } from '@/lib/analyticsUtils';

interface AnalyticsData {
  totalPageViews: number;
  activeUsers: number;
  courseCompletionRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  courseProgress: Array<{ name: string; completed: number; inProgress: number; notStarted: number }>;
  deviceTypes: Array<{ name: string; value: number; color: string }>;
}

export const useAnalyticsData = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPageViews: 0,
    activeUsers: 0,
    courseCompletionRate: 0,
    avgSessionDuration: 0,
    topPages: [],
    userGrowth: [],
    courseProgress: [],
    deviceTypes: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      
      try {
        const learners = JSON.parse(localStorage.getItem('learners') || '[]');
        const courses = JSON.parse(localStorage.getItem('courses') || '[]');
        const surveySubmissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
        const pageViews = JSON.parse(localStorage.getItem('pageViews') || '{}');

        // Calculate real metrics
        const totalLearners = learners.length;
        const activeLearners = learners.filter((l: any) => l.status === 'active').length;
        const completedSurveys = surveySubmissions.filter((s: any) => s.status === 'completed').length;

        // Process course progress data
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
          avgSessionDuration: calculateAvgSessionDuration(learners),
          topPages: processPageViews(pageViews),
          userGrowth: generateUserGrowthData(learners),
          courseProgress: courseProgressData,
          deviceTypes: deviceData
        });
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  return { analyticsData, loading, refetch: () => setLoading(true) };
};