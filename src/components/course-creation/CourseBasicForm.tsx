
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, X, Image } from 'lucide-react';
import { useRef, useState } from 'react';

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
  clientLogo: File | null;
  setClientLogo: (file: File | null) => void;
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
  setEnrolledLearners,
  clientLogo,
  setClientLogo
}: CourseBasicFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setClientLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setClientLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
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

        <div>
          <Label>Client Logo</Label>
          <div className="space-y-4">
            {logoPreview ? (
              <div className="relative inline-block">
                <img
                  src={logoPreview}
                  alt="Client logo preview"
                  className="h-20 w-auto max-w-xs border border-gray-200 rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Upload your client's logo to display alongside Unboxable branding
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Logo
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500">
              Recommended: PNG or JPG format, max 2MB, square or horizontal orientation
            </p>
          </div>
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
