export interface ScheduledCourse {
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
  color?: string;
}

export interface EmailEvent {
  type: 'email';
  title: string;
  courseName: string;
  color: string;
}