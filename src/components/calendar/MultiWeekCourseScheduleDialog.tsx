import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mail, Plus, X } from 'lucide-react';
import { format, addDays, addWeeks } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface ModuleSchedule {
  moduleId: string;
  moduleTitle: string;
  moduleType: string;
  unlockDate: Date;
  unlockTime: string;
  weekNumber: number;
  emailNotificationDate: Date;
}

interface MultiWeekCourseScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSchedule: (courseData: any) => void;
}

export const MultiWeekCourseScheduleDialog = ({ 
  open, 
  onClose, 
  selectedDate, 
  onSchedule 
}: MultiWeekCourseScheduleDialogProps) => {
  const [courseName, setCourseName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [courseColor, setCourseColor] = useState('#8B5CF6');
  const [maxEnrollment, setMaxEnrollment] = useState('');
  const [instructor, setInstructor] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [preCourseEmailDate, setPreCourseEmailDate] = useState('');
  const [participantEmails, setParticipantEmails] = useState('');
  
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [moduleSchedules, setModuleSchedules] = useState<ModuleSchedule[]>([]);

  useEffect(() => {
    if (open) {
      // Load available courses from localStorage
      const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      setAvailableCourses(savedCourses.filter((course: any) => course.status === 'active'));
      
      // Set default dates
      if (selectedDate) {
        setStartDate(format(selectedDate, 'yyyy-MM-dd'));
        const defaultEndDate = addWeeks(selectedDate, 4);
        setEndDate(format(defaultEndDate, 'yyyy-MM-dd'));
        
        const oneWeekBefore = addDays(selectedDate, -7);
        setPreCourseEmailDate(format(oneWeekBefore, 'yyyy-MM-dd'));
      }
    }
  }, [open, selectedDate]);

  const handleCourseSelect = (courseId: string) => {
    const course = availableCourses.find(c => c.id.toString() === courseId);
    if (course) {
      setCourseId(courseId);
      setCourseName(course.title);
      setMaxEnrollment(course.maxEnrollment.toString());
      
      // Generate module schedules based on course modules
      const courseStartDate = startDate ? new Date(startDate) : (selectedDate || new Date());
      const courseEndDate = endDate ? new Date(endDate) : addWeeks(courseStartDate, 4);
      
      // Ensure courseStartDate is valid before using getTime()
      if (!courseStartDate || isNaN(courseStartDate.getTime())) {
        console.error('Invalid course start date');
        return;
      }
      
      const totalWeeks = Math.ceil((courseEndDate.getTime() - courseStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      const schedules: ModuleSchedule[] = course.moduleList?.map((module: any, index: number) => {
        const weekNumber = Math.floor(index / Math.max(1, Math.floor(course.moduleList.length / totalWeeks))) + 1;
        const unlockDate = addWeeks(courseStartDate, Math.min(weekNumber - 1, totalWeeks - 1));
        const emailNotificationDate = addDays(unlockDate, -7);
        
        return {
          moduleId: module.id,
          moduleTitle: module.title,
          moduleType: module.type,
          unlockDate,
          unlockTime: '09:00',
          weekNumber,
          emailNotificationDate
        };
      }) || [];
      
      setModuleSchedules(schedules);
    }
  };

  const updateModuleSchedule = (index: number, field: keyof ModuleSchedule, value: any) => {
    const updated = [...moduleSchedules];
    updated[index] = { ...updated[index], [field]: value };
    setModuleSchedules(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !courseName || !maxEnrollment) {
      return;
    }

    try {
      const courseStartDate = new Date(startDate);
      const courseEndDate = new Date(endDate);
      const durationWeeks = Math.ceil((courseEndDate.getTime() - courseStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      // Create course schedule in Supabase
      const { data: courseSchedule, error: courseError } = await supabase
        .from('course_schedules')
        .insert({
          course_id: courseId || courseName,
          course_name: courseName,
          start_date: startDate,
          end_date: endDate,
          duration_weeks: durationWeeks,
          max_enrollment: parseInt(maxEnrollment),
          instructor,
          location,
          description,
          pre_course_survey_date: preCourseEmailDate,
          color: courseColor
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Create module schedules
      const moduleScheduleData = moduleSchedules.map(schedule => ({
        course_schedule_id: courseSchedule.id,
        module_id: schedule.moduleId,
        module_title: schedule.moduleTitle,
        module_type: schedule.moduleType,
        unlock_date: format(schedule.unlockDate, 'yyyy-MM-dd'),
        unlock_time: schedule.unlockTime,
        week_number: schedule.weekNumber,
        email_notification_date: format(schedule.emailNotificationDate, 'yyyy-MM-dd')
      }));

      const { error: moduleError } = await supabase
        .from('module_schedules')
        .insert(moduleScheduleData);

      if (moduleError) throw moduleError;

      // Create email campaigns for pre-course survey and module notifications
      const emails = participantEmails.split(',').map(email => email.trim()).filter(email => email);
      
      if (emails.length > 0) {
        // Pre-course survey email
        await supabase.functions.invoke('course-email-automation', {
          body: {
            action: 'create_email_campaign',
            courseScheduleId: courseSchedule.id,
            campaignType: 'pre_course_survey',
            recipientEmails: emails,
            scheduledDate: preCourseEmailDate,
            scheduledTime: '09:00',
            emailSubject: `${courseName} - Pre-Course Survey`,
            emailContent: generatePreCourseSurveyEmail(courseName, courseStartDate)
          }
        });

        // Module unlock notification emails
        for (const schedule of moduleSchedules) {
          await supabase.functions.invoke('course-email-automation', {
            body: {
              action: 'create_email_campaign',
              courseScheduleId: courseSchedule.id,
              campaignType: 'module_unlock',
              recipientEmails: emails,
              scheduledDate: format(schedule.emailNotificationDate, 'yyyy-MM-dd'),
              scheduledTime: '09:00',
              emailSubject: `${courseName} - Week ${schedule.weekNumber}: ${schedule.moduleTitle}`,
              emailContent: generateModuleUnlockEmail(courseName, schedule)
            }
          });
        }
      }

      // Create participant progress tracking
      if (emails.length > 0) {
        const participantData = emails.map(email => ({
          course_schedule_id: courseSchedule.id,
          participant_email: email,
          participant_name: email.split('@')[0] // Simple name extraction
        }));

        await supabase
          .from('participant_progress')
          .insert(participantData);
      }

      onSchedule({
        id: courseSchedule.id,
        courseId: courseId || courseName,
        courseName,
        startDate: courseStartDate,
        endDate: courseEndDate,
        maxEnrollment: parseInt(maxEnrollment),
        enrolledCount: emails.length,
        instructor,
        location,
        description,
        moduleSchedules,
        status: 'scheduled',
        color: courseColor
      });

      // Reset form
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating course schedule:', error);
      alert('Failed to create course schedule. Please try again.');
    }
  };

  const resetForm = () => {
    setCourseName('');
    setCourseId('');
    setStartDate('');
    setEndDate('');
    setCourseColor('#8B5CF6');
    setMaxEnrollment('');
    setInstructor('');
    setLocation('');
    setDescription('');
    setPreCourseEmailDate('');
    setParticipantEmails('');
    setModuleSchedules([]);
  };

  const generatePreCourseSurveyEmail = (courseName: string, startDate: Date) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">Welcome to ${courseName}</h2>
        <p>Your course starts on <strong>${format(startDate, 'MMMM d, yyyy')}</strong>.</p>
        <p>Before we begin, please complete this pre-course survey to help us tailor the learning experience to your needs.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="/survey" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Survey</a>
        </div>
        <p>This survey should take approximately 15 minutes to complete.</p>
        <p>Best regards,<br>The Unboxable Learning Team</p>
      </div>
    `;
  };

  const generateModuleUnlockEmail = (courseName: string, schedule: ModuleSchedule) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">${courseName} - Week ${schedule.weekNumber}</h2>
        <p>Your next module is now available!</p>
        <h3>${schedule.moduleTitle}</h3>
        <p>This ${schedule.moduleType} module unlocks on <strong>${format(schedule.unlockDate, 'MMMM d, yyyy')}</strong> at ${schedule.unlockTime}.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="/dashboard" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Module</a>
        </div>
        <p>Best regards,<br>The Unboxable Learning Team</p>
      </div>
    `;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule Multi-Week Course</span>
            {selectedDate && (
              <Badge variant="outline">
                Starting {format(selectedDate, 'MMM d, yyyy')}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="course-select">Select Course</Label>
                <Select onValueChange={handleCourseSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map(course => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="Enter course name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxEnrollment">Max Enrollment</Label>
                  <Input
                    id="maxEnrollment"
                    type="number"
                    value={maxEnrollment}
                    onChange={(e) => setMaxEnrollment(e.target.value)}
                    placeholder="Maximum participants"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="courseColor">Course Color</Label>
                  <Input
                    id="courseColor"
                    type="color"
                    value={courseColor}
                    onChange={(e) => setCourseColor(e.target.value)}
                    className="h-10 w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="Instructor name"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Room or online link"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Course description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pre-Course Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Pre-Course Setup</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="preCourseEmailDate">Pre-Course Survey Email Date</Label>
                <Input
                  id="preCourseEmailDate"
                  type="date"
                  value={preCourseEmailDate}
                  onChange={(e) => setPreCourseEmailDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="participantEmails">Participant Emails (comma-separated)</Label>
                <Textarea
                  id="participantEmails"
                  value={participantEmails}
                  onChange={(e) => setParticipantEmails(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Module Schedule */}
          {moduleSchedules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Module Schedule ({moduleSchedules.length} modules)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moduleSchedules.map((schedule, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{schedule.moduleTitle}</h4>
                        <Badge variant="outline">Week {schedule.weekNumber}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Unlock Date</Label>
                          <Input
                            type="date"
                            value={format(schedule.unlockDate, 'yyyy-MM-dd')}
                            onChange={(e) => updateModuleSchedule(index, 'unlockDate', new Date(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Unlock Time</Label>
                          <Input
                            type="time"
                            value={schedule.unlockTime}
                            onChange={(e) => updateModuleSchedule(index, 'unlockTime', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Email Notification Date</Label>
                          <Input
                            type="date"
                            value={format(schedule.emailNotificationDate, 'yyyy-MM-dd')}
                            onChange={(e) => updateModuleSchedule(index, 'emailNotificationDate', new Date(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Schedule Multi-Week Course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};