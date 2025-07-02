import { CourseScheduleDialog } from '../CourseScheduleDialog';
import { MultiWeekCourseScheduleDialog } from '../MultiWeekCourseScheduleDialog';
import { EmailReminderDialog } from '../EmailReminderDialog';
import { ScheduledCourse } from '../types';

interface CalendarDialogsProps {
  showScheduleDialog: boolean;
  showMultiWeekDialog: boolean;
  showReminderDialog: boolean;
  selectedDate: Date | null;
  selectedCourse: ScheduledCourse | null;
  onCloseScheduleDialog: () => void;
  onCloseMultiWeekDialog: () => void;
  onCloseReminderDialog: () => void;
  onScheduleCourse: (courseData: any) => void;
  onScheduleMultiWeekCourse: (courseData: any) => void;
  onUpdateReminder: (courseId: string, reminderData: any) => void;
}

export const CalendarDialogs = ({
  showScheduleDialog,
  showMultiWeekDialog,
  showReminderDialog,
  selectedDate,
  selectedCourse,
  onCloseScheduleDialog,
  onCloseMultiWeekDialog,
  onCloseReminderDialog,
  onScheduleCourse,
  onScheduleMultiWeekCourse,
  onUpdateReminder
}: CalendarDialogsProps) => {
  return (
    <>
      <CourseScheduleDialog
        open={showScheduleDialog}
        onClose={onCloseScheduleDialog}
        selectedDate={selectedDate}
        onSchedule={onScheduleCourse}
      />

      <MultiWeekCourseScheduleDialog
        open={showMultiWeekDialog}
        onClose={onCloseMultiWeekDialog}
        selectedDate={selectedDate}
        onSchedule={onScheduleMultiWeekCourse}
      />

      <EmailReminderDialog
        open={showReminderDialog}
        onClose={onCloseReminderDialog}
        course={selectedCourse}
        onUpdate={onUpdateReminder}
      />
    </>
  );
};