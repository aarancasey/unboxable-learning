
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarIcon, Mail, Clock } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ScheduledCourse {
  id: string;
  courseId: string;
  courseName: string;
  date: Date;
  time: string;
  duration: string;
  enrolledCount: number;
  maxEnrollment: number;
  instructor?: string;
  location?: string;
  reminderSent: boolean;
  reminderDate?: Date;
}

interface EmailReminderDialogProps {
  open: boolean;
  onClose: () => void;
  course: ScheduledCourse | null;
  onUpdate: (courseId: string, data: any) => void;
}

export const EmailReminderDialog = ({ open, onClose, course, onUpdate }: EmailReminderDialogProps) => {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [reminderTime, setReminderTime] = useState('09:00');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [reminderType, setReminderType] = useState<'days' | 'date'>('days');
  const [daysBefore, setDaysBefore] = useState('1');

  useEffect(() => {
    if (course) {
      setReminderEnabled(!!course.reminderDate);
      setReminderDate(course.reminderDate);
      setEmailSubject(`Reminder: ${course.courseName} Tomorrow`);
      setEmailTemplate(`Hi there,

This is a friendly reminder that you're enrolled in "${course.courseName}" scheduled for ${format(course.date, 'MMMM d, yyyy')} at ${course.time}.

Course Details:
- Duration: ${course.duration}
${course.instructor ? `- Instructor: ${course.instructor}` : ''}
${course.location ? `- Location: ${course.location}` : ''}

Please make sure to arrive on time and bring any required materials.

If you have any questions, please don't hesitate to contact us.

Best regards,
The Learning Team`);
    }
  }, [course]);

  const handleSave = () => {
    if (!course) return;

    let finalReminderDate: Date | undefined;
    
    if (reminderEnabled) {
      if (reminderType === 'days') {
        finalReminderDate = subDays(course.date, parseInt(daysBefore));
      } else {
        finalReminderDate = reminderDate;
      }
    }

    onUpdate(course.id, {
      reminderDate: finalReminderDate,
      reminderSent: false,
      emailSubject,
      emailTemplate,
      reminderTime
    });
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-purple-600" />
            <span>Email Reminder Settings</span>
          </DialogTitle>
          <div className="text-sm text-gray-600">
            {course.courseName} - {format(course.date, 'MMMM d, yyyy')} at {course.time}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Course Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Enrolled:</span>
                <span className="ml-2 font-medium">{course.enrolledCount}/{course.maxEnrollment}</span>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <span className="ml-2 font-medium">{course.duration}</span>
              </div>
              {course.instructor && (
                <div>
                  <span className="text-gray-600">Instructor:</span>
                  <span className="ml-2 font-medium">{course.instructor}</span>
                </div>
              )}
              {course.location && (
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 font-medium">{course.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reminder Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium">Email Reminder</div>
                <div className="text-sm text-gray-600">
                  Send pre-course reminder to enrolled learners
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {course.reminderSent && (
                <Badge variant="default">Sent</Badge>
              )}
              <Switch
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>
          </div>

          {reminderEnabled && (
            <>
              {/* Reminder Timing */}
              <div className="space-y-4">
                <Label>When to Send Reminder</Label>
                <Select value={reminderType} onValueChange={(value) => setReminderType(value as 'days' | 'date')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days before course</SelectItem>
                    <SelectItem value="date">Specific date</SelectItem>
                  </SelectContent>
                </Select>

                {reminderType === 'days' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="daysBefore">Days Before</Label>
                      <Select value={daysBefore} onValueChange={setDaysBefore}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day before</SelectItem>
                          <SelectItem value="2">2 days before</SelectItem>
                          <SelectItem value="3">3 days before</SelectItem>
                          <SelectItem value="7">1 week before</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reminderTime">Time</Label>
                      <Input
                        id="reminderTime"
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Reminder Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !reminderDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {reminderDate ? format(reminderDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={reminderDate}
                            onSelect={setReminderDate}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="reminderTime">Time</Label>
                      <Input
                        id="reminderTime"
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Email Content */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="emailSubject">Email Subject</Label>
                  <Input
                    id="emailSubject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Reminder email subject"
                  />
                </div>

                <div>
                  <Label htmlFor="emailTemplate">Email Template</Label>
                  <Textarea
                    id="emailTemplate"
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    placeholder="Email content template"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
