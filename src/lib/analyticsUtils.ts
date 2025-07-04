export const generateUserGrowthData = (learners: any[]) => {
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

export const calculateAvgSessionDuration = (learners: any[]) => {
  // In a real app, this would come from analytics
  // For now, return a default based on user activity
  const activeLearners = learners.filter((l: any) => l.status === 'active').length;
  return activeLearners > 0 ? 8.5 + (activeLearners * 0.5) : 5.0;
};

export const processPageViews = (pageViews: any) => {
  const topPages = Object.entries(pageViews)
    .filter(([page]) => page !== 'total' && page !== 'lastVisit')
    .map(([page, views]) => ({ page, views: views as number }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return topPages.length > 0 ? topPages : [
    { page: '/dashboard', views: 0 },
    { page: '/courses', views: 0 },
    { page: '/surveys', views: 0 },
  ];
};