
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';

interface EmptyCoursesStateProps {
  onCreateCourse: () => void;
}

export const EmptyCoursesState = ({ onCreateCourse }: EmptyCoursesStateProps) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
        <p className="text-gray-600 mb-6">Create your first course to get started with the learning management system.</p>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={onCreateCourse}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Course
        </Button>
      </CardContent>
    </Card>
  );
};
