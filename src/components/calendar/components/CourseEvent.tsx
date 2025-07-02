import { Mail } from 'lucide-react';
import { ScheduledCourse } from '../types';

interface CourseEventProps {
  course: ScheduledCourse;
  onClick: (course: ScheduledCourse) => void;
}

export const CourseEvent = ({ course, onClick }: CourseEventProps) => {
  return (
    <div
      className="text-xs p-1 rounded cursor-pointer"
      style={{
        backgroundColor: `${course.color}20`,
        borderLeft: `3px solid ${course.color}`,
        color: course.color
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(course);
      }}
    >
      <div className="font-medium truncate">{course.courseName}</div>
      <div className="flex items-center justify-between">
        <span>{course.isMultiWeek ? 'Multi-week' : course.time}</span>
        {!course.reminderSent && (
          <Mail className="h-3 w-3 text-orange-500" />
        )}
      </div>
    </div>
  );
};