
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CourseHeaderProps {
  onCreateCourse: () => void;
}

export const CourseHeader = ({ onCreateCourse }: CourseHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
        <p className="text-gray-600">Create and manage learning courses and modules</p>
      </div>
      
      <Button 
        className="bg-purple-600 hover:bg-purple-700"
        onClick={onCreateCourse}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Course
      </Button>
    </div>
  );
};
