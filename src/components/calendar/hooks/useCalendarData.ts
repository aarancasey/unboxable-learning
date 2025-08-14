import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScheduledCourse } from '../types';

export const useCalendarData = () => {
  const [scheduledCourses, setScheduledCourses] = useState<ScheduledCourse[]>([]);

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
        status: schedule.status,
        color: schedule.color || '#8B5CF6'
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

  const saveScheduledCourses = (courses: ScheduledCourse[]) => {
    setScheduledCourses(courses);
    localStorage.setItem('scheduledCourses', JSON.stringify(courses));
  };

  useEffect(() => {
    loadScheduledCourses();
  }, []);

  const clearAllCourses = async () => {
    try {
      // Clear Supabase course schedules
      await supabase.from('course_schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Clear Supabase module schedules  
      await supabase.from('module_schedules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Clear localStorage
      localStorage.removeItem('scheduledCourses');
      
      // Clear local state
      setScheduledCourses([]);
      
      
    } catch (error) {
      console.error('Error clearing scheduled courses:', error);
      // Fallback: at least clear localStorage and state
      localStorage.removeItem('scheduledCourses');
      setScheduledCourses([]);
    }
  };

  return {
    scheduledCourses,
    setScheduledCourses,
    loadScheduledCourses,
    saveScheduledCourses,
    clearAllCourses
  };
};