import { format, isSameDay } from 'date-fns';
import { ScheduledCourse, EmailEvent } from '../types';
import { CourseEvent } from './CourseEvent';
import { EmailEvent as EmailEventComponent } from './EmailEvent';

interface CalendarDayProps {
  day: Date;
  courses: ScheduledCourse[];
  emailEvents: EmailEvent[];
  onDateClick: (date: Date) => void;
  onCourseClick: (course: ScheduledCourse) => void;
}

export const CalendarDay = ({
  day,
  courses,
  emailEvents,
  onDateClick,
  onCourseClick
}: CalendarDayProps) => {
  const isToday = isSameDay(day, new Date());

  return (
    <div
      className={`min-h-28 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
        isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
      }`}
      onClick={() => onDateClick(day)}
    >
      <div className={`text-sm font-medium mb-1 ${
        isToday ? 'text-blue-600' : 'text-gray-900'
      }`}>
        {format(day, 'd')}
      </div>
      
      <div className="space-y-1">
        {courses.map(course => (
          <CourseEvent
            key={`course-${course.id}`}
            course={course}
            onClick={onCourseClick}
          />
        ))}
        
        {emailEvents.map((emailEvent, index) => (
          <EmailEventComponent
            key={`email-${index}`}
            emailEvent={emailEvent}
          />
        ))}
      </div>
    </div>
  );
};