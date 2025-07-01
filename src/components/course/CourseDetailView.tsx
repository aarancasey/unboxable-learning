
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { CourseStats } from './CourseStats';
import { CourseModulesList } from './CourseModulesList';

interface Course {
  id: number;
  title: string;
  description: string;
  modules: number;
  maxEnrollment: number;
  enrolledUsers: number;
  completionRate: number;
  status: string;
  createdDate: string;
  estimatedDuration: string;
  moduleList: any[];
}

interface CourseDetailViewProps {
  course: Course;
  onBack: () => void;
}

export const CourseDetailView = ({ course, onBack }: CourseDetailViewProps) => {
  const handleModuleUpdate = (moduleId: number, updatedModule: any) => {
    console.log('Module updated:', moduleId, updatedModule);
    // Here you would typically update the course data in your state management
    // For now, we'll just log it since we don't have a full update mechanism
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Courses
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
          <p className="text-gray-600">{course.description}</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Settings className="h-4 w-4 mr-2" />
            Course Settings
          </Button>
        </div>
      </div>

      {/* Course Stats */}
      <CourseStats
        modules={course.modules}
        enrolledUsers={course.enrolledUsers}
        maxEnrollment={course.maxEnrollment}
        completionRate={course.completionRate}
        estimatedDuration={course.estimatedDuration}
      />

      {/* Modules List */}
      <CourseModulesList 
        modules={course.moduleList} 
        onModuleUpdate={handleModuleUpdate}
      />
    </div>
  );
};
