import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  Users, 
  FileText, 
  Calendar,
  Search,
  Filter,
  Eye,
  Download
} from 'lucide-react';
import { DataService } from '@/services/dataService';
import { dateHelpers } from '@/lib/dateUtils';

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
  participant: string;
}

const ActivitiesView = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 20;

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, filterType]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const allActivities = await DataService.getRecentActivities(30); // Get last 30 days
      setActivities(allActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.participant.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case 'user-plus':
        return <Users className="h-4 w-4 text-primary" />;
      case 'file-text':
        return <FileText className="h-4 w-4 text-secondary" />;
      case 'calendar':
        return <Calendar className="h-4 w-4 text-accent" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'learner_registration':
        return 'Learner Registration';
      case 'survey_submission':
        return 'Survey Submission';
      case 'course_scheduled':
        return 'Course Scheduled';
      default:
        return 'Activity';
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'learner_registration':
        return 'default';
      case 'survey_submission':
        return 'secondary';
      case 'course_scheduled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const exportActivities = () => {
    const csv = [
      ['Type', 'Message', 'Participant', 'Date', 'Time'].join(','),
      ...filteredActivities.map(activity => [
        getActivityTypeLabel(activity.type),
        `"${activity.message}"`,
        activity.participant,
        dateHelpers.shortDate(activity.timestamp),
        dateHelpers.time(activity.timestamp)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
  const startIndex = (currentPage - 1) * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded-lg" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Activities</h2>
          <p className="text-muted-foreground">Comprehensive activity log and audit trail</p>
        </div>
        
        <Button onClick={exportActivities} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="learner_registration">Learner Registrations</SelectItem>
                  <SelectItem value="survey_submission">Survey Submissions</SelectItem>
                  <SelectItem value="course_scheduled">Course Schedules</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activities ({filteredActivities.length} total)</span>
            {totalPages > 1 && (
              <span className="text-sm text-muted-foreground font-normal">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No activities found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Activities will appear here as users interact with the system'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {currentActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start justify-between p-4 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-colors"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-foreground">{activity.message}</p>
                          <Badge variant={getActivityTypeColor(activity.type)} className="text-xs">
                            {getActivityTypeLabel(activity.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>
                            {dateHelpers.shortDate(activity.timestamp)} at{' '}
                            {dateHelpers.time(activity.timestamp)}
                          </span>
                          <span>•</span>
                          <span>by {activity.participant}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="ml-2 shrink-0">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredActivities.length)} of {filteredActivities.length} activities
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivitiesView;