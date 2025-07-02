import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CalendarNavigation } from './CalendarNavigation';
import { CalendarDay } from './CalendarDay';
import { ScheduledCourse, EmailEvent } from '../types';
import { isSameDay } from 'date-fns';

interface CalendarGridProps {
  currentDate: Date;
  view: 'week' | 'month';
  days: Date[];
  scheduledCourses: ScheduledCourse[];
  onNavigate: (direction: 'prev' | 'next') => void;
  onDateClick: (date: Date) => void;
  onCourseClick: (course: ScheduledCourse) => void;
}

export const CalendarGrid = ({
  currentDate,
  view,
  days,
  scheduledCourses,
  onNavigate,
  onDateClick,
  onCourseClick
}: CalendarGridProps) => {
  const getCoursesForDate = (date: Date) => {
    return scheduledCourses.filter(course => {
      if (course.isMultiWeek && course.endDate) {
        // For multi-week courses, check if date is within the course duration
        return date >= course.date && date <= course.endDate;
      }
      // For single-day courses, check exact date match
      return isSameDay(course.date, date);
    });
  };

  const getEmailEventsForDate = (date: Date): EmailEvent[] => {
    const emailEvents: EmailEvent[] = [];
    
    scheduledCourses.forEach(course => {
      if (course.moduleSchedules) {
        course.moduleSchedules.forEach((module: any) => {
          const emailDate = new Date(module.email_notification_date);
          if (isSameDay(emailDate, date)) {
            emailEvents.push({
              type: 'email',
              title: `Email: ${module.module_title}`,
              courseName: course.courseName,
              color: course.color || '#8B5CF6'
            });
          }
        });
      }
    });
    
    return emailEvents;
  };

  return (
    <Card>
      <CardHeader>
        <CalendarNavigation
          currentDate={currentDate}
          view={view}
          onNavigate={onNavigate}
        />
      </CardHeader>
      
      <CardContent>
        <div className={`grid gap-2 ${view === 'week' ? 'grid-cols-7' : 'grid-cols-7'}`}>
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map(day => {
            const coursesForDay = getCoursesForDate(day);
            const emailEventsForDay = getEmailEventsForDate(day);
            
            return (
              <CalendarDay
                key={day.toISOString()}
                day={day}
                courses={coursesForDay}
                emailEvents={emailEventsForDay}
                onDateClick={onDateClick}
                onCourseClick={onCourseClick}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};