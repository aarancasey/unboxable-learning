
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronRight, Plus, Settings, Mail } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { CourseScheduleDialog } from './CourseScheduleDialog';
import { MultiWeekCourseScheduleDialog } from './MultiWeekCourseScheduleDialog';
import { EmailReminderDialog } from './EmailReminderDialog';
import { supabase } from '@/integrations/supabase/client';

interface ScheduledCourse {
  id: string;
  courseId: string;
  courseName: string;
  date: Date;
  endDate?: Date;
  time: string;
  duration: string;
  enrolledCount: number;
  maxEnrollment: number;
  instructor?: string;
  location?: string;
  reminderSent: boolean;
  reminderDate?: Date;
  isMultiWeek?: boolean;
  moduleSchedules?: any[];
  status?: string;
}

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('month');
  const [scheduledCourses, setScheduledCourses] = useState<ScheduledCourse[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showMultiWeekDialog, setShowMultiWeekDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<ScheduledCourse | null>(null);

  // Load scheduled courses from Supabase and localStorage
  useEffect(() => {
    loadScheduledCourses();
  }, []);

  const loadScheduledCourses = async () => {
    try {
      // Load from Supabase
      const { data: courseSchedules, error } = await supabase
        .from('course_schedules')
        .select(`
          *,
          module_schedules (*)
        `);

      if (error) throw error;

      const supabaseCourses = courseSchedules.map((schedule: any) => ({
        id: schedule.id,
        courseId: schedule.course_id,
        courseName: schedule.course_name,
        date: new Date(schedule.start_date),
        endDate: new Date(schedule.end_date),
        time: '09:00',
        duration: `${schedule.duration_weeks} weeks`,
        enrolledCount: schedule.enrolled_count,
        maxEnrollment: schedule.max_enrollment,
        instructor: schedule.instructor,
        location: schedule.location,
        reminderSent: false,
        isMultiWeek: true,
        moduleSchedules: schedule.module_schedules,
        status: schedule.status
      }));

      // Also load legacy courses from localStorage
      const saved = localStorage.getItem('scheduledCourses');
      const legacyCourses = saved ? JSON.parse(saved).map((course: any) => ({
        ...course,
        date: new Date(course.date),
        reminderDate: course.reminderDate ? new Date(course.reminderDate) : undefined,
        isMultiWeek: false
      })) : [];

      setScheduledCourses([...supabaseCourses, ...legacyCourses]);
    } catch (error) {
      console.error('Error loading scheduled courses:', error);
      // Fallback to localStorage only
      const saved = localStorage.getItem('scheduledCourses');
      if (saved) {
        const parsed = JSON.parse(saved);
        setScheduledCourses(parsed.map((course: any) => ({
          ...course,
          date: new Date(course.date),
          reminderDate: course.reminderDate ? new Date(course.reminderDate) : undefined,
          isMultiWeek: false
        })));
      }
    }
  };

  // Save scheduled courses to localStorage
  const saveScheduledCourses = (courses: ScheduledCourse[]) => {
    setScheduledCourses(courses);
    localStorage.setItem('scheduledCourses', JSON.stringify(courses));
  };

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

  const getCoursesForDate = (date: Date) => {
    return scheduledCourses.filter(course => isSameDay(course.date, date));
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

  const days = getDaysToDisplay();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Calendar</h2>
          <p className="text-gray-600">Schedule courses and manage email reminders</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Tabs value={view} onValueChange={(v) => setView(v as 'week' | 'month')}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setShowScheduleDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Single Session
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setShowMultiWeekDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Multi-Week Course
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <CardTitle className="text-xl">
              {format(currentDate, view === 'week' ? 'MMM d, yyyy' : 'MMMM yyyy')}
            </CardTitle>
            
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-24 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {coursesForDay.map(course => (
                      <div
                        key={course.id}
                        className="text-xs p-1 bg-purple-100 text-purple-800 rounded cursor-pointer hover:bg-purple-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(course);
                        }}
                      >
                        <div className="font-medium truncate">{course.courseName}</div>
                        <div className="flex items-center justify-between">
                          <span>{course.time}</span>
                          {!course.reminderSent && (
                            <Mail className="h-3 w-3 text-orange-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Courses Summary */}
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
                        onClick={() => handleCourseClick(course)}
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

      {/* Dialogs */}
      <CourseScheduleDialog
        open={showScheduleDialog}
        onClose={() => {
          setShowScheduleDialog(false);
          setSelectedDate(null);
        }}
        selectedDate={selectedDate}
        onSchedule={handleScheduleCourse}
      />

      <MultiWeekCourseScheduleDialog
        open={showMultiWeekDialog}
        onClose={() => {
          setShowMultiWeekDialog(false);
          setSelectedDate(null);
        }}
        selectedDate={selectedDate}
        onSchedule={handleScheduleMultiWeekCourse}
      />

      <EmailReminderDialog
        open={showReminderDialog}
        onClose={() => {
          setShowReminderDialog(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
        onUpdate={handleUpdateReminder}
      />
    </div>
  );
};
