import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Mail } from 'lucide-react';

interface FlexibleDurationFormProps {
  durationType: 'days' | 'weeks' | 'months';
  setDurationType: (type: 'days' | 'weeks' | 'months') => void;
  durationValue: number;
  setDurationValue: (value: number) => void;
  reminderDaysBefore: number;
  setReminderDaysBefore: (days: number) => void;
  courseLocation: string;
  setCourseLocation: (location: string) => void;
  courseInstructor: string;
  setCourseInstructor: (instructor: string) => void;
}

export const FlexibleDurationForm = ({
  durationType,
  setDurationType,
  durationValue,
  setDurationValue,
  reminderDaysBefore,
  setReminderDaysBefore,
  courseLocation,
  setCourseLocation,
  courseInstructor,
  setCourseInstructor
}: FlexibleDurationFormProps) => {
  return (
    <div className="space-y-6">
      {/* Course Duration Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Course Duration & Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration-type">Duration Type</Label>
              <Select value={durationType} onValueChange={(value: 'days' | 'weeks' | 'months') => setDurationType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days (Intensive)</SelectItem>
                  <SelectItem value="weeks">Weeks (Standard)</SelectItem>
                  <SelectItem value="months">Months (Extended)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration-value">Duration</Label>
              <Input
                type="number"
                min="1"
                max={durationType === 'days' ? 30 : durationType === 'weeks' ? 52 : 12}
                value={durationValue}
                onChange={(e) => setDurationValue(parseInt(e.target.value) || 1)}
                placeholder={`Number of ${durationType}`}
              />
            </div>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Course Structure:</strong> This {durationValue} {durationType} course will automatically unlock 
              {durationType === 'days' ? ' one module per day' : 
               durationType === 'weeks' ? ' one module per week' : 
               ' modules based on monthly schedule'}. 
              Email reminders will be sent automatically to participants.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Timing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-days">Send reminder emails</Label>
            <Select 
              value={reminderDaysBefore.toString()} 
              onValueChange={(value) => setReminderDaysBefore(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day before course starts</SelectItem>
                <SelectItem value="3">3 days before course starts</SelectItem>
                <SelectItem value="7">1 week before course starts</SelectItem>
                <SelectItem value="14">2 weeks before course starts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" />
              Participants will receive course reminders {reminderDaysBefore} day{reminderDaysBefore !== 1 ? 's' : ''} 
              before the course starts, and module unlock notifications throughout the course.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Course Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              value={courseLocation}
              onChange={(e) => setCourseLocation(e.target.value)}
              placeholder="e.g., Online, Conference Room A, Main Training Center"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Input
              value={courseInstructor}
              onChange={(e) => setCourseInstructor(e.target.value)}
              placeholder="e.g., Fiona Smith, Training Team"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};