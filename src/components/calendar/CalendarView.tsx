
import { useState } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarGrid } from './components/CalendarGrid';
import { UpcomingCourses } from './components/UpcomingCourses';
import { CalendarDialogs } from './components/CalendarDialogs';
import { useCalendarData } from './hooks/useCalendarData';
import { ScheduledCourse } from './types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('month');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showMultiWeekDialog, setShowMultiWeekDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<ScheduledCourse | null>(null);

  const {
    scheduledCourses,
    setScheduledCourses,
    loadScheduledCourses,
    saveScheduledCourses,
    clearAllCourses
  } = useCalendarData();

  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'week') {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const getDaysToDisplay = () => {
    if (view === 'week') {
      return eachDayOfInterval({
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate)
      });
    } else {
      return eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      });
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowScheduleDialog(true);
  };

  const handleCourseClick = (course: ScheduledCourse) => {
    setSelectedCourse(course);
    setShowReminderDialog(true);
  };

  const handleScheduleCourse = (courseData: any) => {
    const newCourse: ScheduledCourse = {
      id: Date.now().toString(),
      ...courseData,
      reminderSent: false,
      isMultiWeek: false
    };
    const updatedCourses = [...scheduledCourses, newCourse];
    setScheduledCourses(updatedCourses);
    localStorage.setItem('scheduledCourses', JSON.stringify(updatedCourses.filter(c => !c.isMultiWeek)));
    setShowScheduleDialog(false);
    setSelectedDate(null);
  };

  const handleScheduleMultiWeekCourse = (courseData: any) => {
    const newCourse: ScheduledCourse = {
      ...courseData,
      isMultiWeek: true
    };
    setScheduledCourses([...scheduledCourses, newCourse]);
    setShowMultiWeekDialog(false);
    setSelectedDate(null);
    // Refresh data from Supabase
    loadScheduledCourses();
  };

  const handleUpdateReminder = (courseId: string, reminderData: any) => {
    const updatedCourses = scheduledCourses.map(course =>
      course.id === courseId ? { ...course, ...reminderData } : course
    );
    saveScheduledCourses(updatedCourses);
    setShowReminderDialog(false);
    setSelectedCourse(null);
  };

  const handleClearCalendar = async () => {
    await clearAllCourses();
    setShowClearDialog(false);
  };

  const days = getDaysToDisplay();

  return (
    <div className="space-y-6">
      <CalendarHeader
        view={view}
        onViewChange={setView}
        onScheduleDialog={() => setShowScheduleDialog(true)}
        onMultiWeekDialog={() => setShowMultiWeekDialog(true)}
        onClearCalendar={() => setShowClearDialog(true)}
      />

      <CalendarGrid
        currentDate={currentDate}
        view={view}
        days={days}
        scheduledCourses={scheduledCourses}
        onNavigate={navigateDate}
        onDateClick={handleDateClick}
        onCourseClick={handleCourseClick}
      />

      <UpcomingCourses
        scheduledCourses={scheduledCourses}
        onCourseClick={handleCourseClick}
      />

      <CalendarDialogs
        showScheduleDialog={showScheduleDialog}
        showMultiWeekDialog={showMultiWeekDialog}
        showReminderDialog={showReminderDialog}
        selectedDate={selectedDate}
        selectedCourse={selectedCourse}
        onCloseScheduleDialog={() => {
          setShowScheduleDialog(false);
          setSelectedDate(null);
        }}
        onCloseMultiWeekDialog={() => {
          setShowMultiWeekDialog(false);
          setSelectedDate(null);
        }}
        onCloseReminderDialog={() => {
          setShowReminderDialog(false);
          setSelectedCourse(null);
        }}
        onScheduleCourse={handleScheduleCourse}
        onScheduleMultiWeekCourse={handleScheduleMultiWeekCourse}
        onUpdateReminder={handleUpdateReminder}
      />

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Calendar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all scheduled courses? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCalendar}>
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
