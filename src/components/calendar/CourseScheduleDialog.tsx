import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface CourseScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSchedule: (courseData: any) => void;
}

export const CourseScheduleDialog = ({ open, onClose, selectedDate, onSchedule }: CourseScheduleDialogProps) => {
  const [courseName, setCourseName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [maxEnrollment, setMaxEnrollment] = useState('');
  const [instructor, setInstructor] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Available courses from localStorage
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  useEffect(() => {
    // Load available courses from localStorage
    const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    console.log('Loading courses for calendar:', savedCourses);
    setAvailableCourses(savedCourses.filter((course: any) => course.status === 'active'));
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !courseName || !time || !duration || !maxEnrollment) {
      return;
    }

    onSchedule({
      courseId: courseId || courseName,
      courseName,
      date: selectedDate,
      time,
      duration,
      maxEnrollment: parseInt(maxEnrollment),
      enrolledCount: 0,
      instructor,
      location,
      description
    });

    // Reset form
    setCourseName('');
    setCourseId('');
    setTime('');
    setDuration('');
    setMaxEnrollment('');
    setInstructor('');
    setLocation('');
    setDescription('');
  };

  const handleCourseSelect = (courseId: string) => {
    const course = availableCourses.find(c => c.id.toString() === courseId);
    if (course) {
      setCourseId(courseId);
      setCourseName(course.title);
      setMaxEnrollment(course.maxEnrollment.toString());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Schedule Course
            {selectedDate && (
              <span className="text-sm font-normal text-gray-600 block">
                for {format(selectedDate, 'MMMM d, yyyy')}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                <SelectItem value="custom">Custom Course</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="time">Start Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 2 hours"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maxEnrollment">Max Enrollment</Label>
            <Input
              id="maxEnrollment"
              type="number"
              value={maxEnrollment}
              onChange={(e) => setMaxEnrollment(e.target.value)}
              placeholder="Maximum number of learners"
              required
            />
          </div>

          <div>
            <Label htmlFor="instructor">Instructor (Optional)</Label>
            <Input
              id="instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="Instructor name"
            />
          </div>

          <div>
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room or online link"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details about the course session"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Schedule Course
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
