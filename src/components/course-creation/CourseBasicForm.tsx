
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CourseBasicFormProps {
  courseName: string;
  setCourseName: (value: string) => void;
  courseOverview: string;
  setCourseOverview: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  maxLearners: number;
  setMaxLearners: (value: number) => void;
  enrolledLearners: number;
  setEnrolledLearners: (value: number) => void;
}

export const CourseBasicForm = ({
  courseName,
  setCourseName,
  courseOverview,
  setCourseOverview,
  duration,
  setDuration,
  maxLearners,
  setMaxLearners,
  enrolledLearners,
  setEnrolledLearners
}: CourseBasicFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="courseName">Course Name</Label>
          <Input
            id="courseName"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Enter course name"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 4 weeks"
            />
          </div>
          <div>
            <Label htmlFor="maxLearners">Maximum Learners</Label>
            <Input
              id="maxLearners"
              type="number"
              value={maxLearners}
              onChange={(e) => setMaxLearners(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="enrolledLearners">Currently Enrolled</Label>
          <Input
            id="enrolledLearners"
            type="number"
            value={enrolledLearners}
            onChange={(e) => setEnrolledLearners(parseInt(e.target.value) || 0)}
          />
        </div>
        
        <div>
          <Label htmlFor="courseOverview">Course Overview</Label>
          <Textarea
            id="courseOverview"
            value={courseOverview}
            onChange={(e) => setCourseOverview(e.target.value)}
            placeholder="Describe the course content and objectives..."
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  );
};
