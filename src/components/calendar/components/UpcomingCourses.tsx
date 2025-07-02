import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ScheduledCourse } from '../types';

interface UpcomingCoursesProps {
  scheduledCourses: ScheduledCourse[];
  onCourseClick: (course: ScheduledCourse) => void;
}

export const UpcomingCourses = ({
  scheduledCourses,
  onCourseClick
}: UpcomingCoursesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          <span>Upcoming Courses</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scheduledCourses.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No courses scheduled</p>
            <p className="text-sm text-gray-500">Click on a date to schedule a course</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledCourses
              .filter(course => course.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 5)
              .map(course => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{course.courseName}</div>
                    <div className="text-sm text-gray-600">
                      {format(course.date, 'MMM d, yyyy')} at {course.time}
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.enrolledCount}/{course.maxEnrollment} enrolled
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={course.reminderSent ? "default" : "secondary"}>
                      {course.reminderSent ? "Reminder Sent" : "Pending"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCourseClick(course)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};