
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { CourseStats } from './CourseStats';
import { CourseModulesList } from './CourseModulesList';
import { ModuleForm } from '../ModuleForm';

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
  onCourseUpdate?: (updatedCourse: Course) => void;
}

export const CourseDetailView = ({ course, onBack, onCourseUpdate }: CourseDetailViewProps) => {
  const [showAddModuleForm, setShowAddModuleForm] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(course);

  const handleModuleUpdate = (moduleId: number, updatedModule: any) => {
    console.log('Module updated:', moduleId, updatedModule);
    // Update the module in the course
    const updatedModules = currentCourse.moduleList.map(module => 
      module.id === moduleId ? { ...module, ...updatedModule } : module
    );
    
    const updatedCourse = {
      ...currentCourse,
      moduleList: updatedModules
    };
    
    setCurrentCourse(updatedCourse);
    
    // Update in localStorage
    const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const updatedCourses = savedCourses.map((c: any) => 
      c.id === course.id ? updatedCourse : c
    );
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    
    // Notify parent component if callback provided
    if (onCourseUpdate) {
      onCourseUpdate(updatedCourse);
    }
  };

  const handleAddModule = (newModuleData: any) => {
    const newModule = {
      id: Date.now().toString(),
      ...newModuleData,
      status: 'active'
    };

    const updatedModules = [...currentCourse.moduleList, newModule];
    const updatedCourse = {
      ...currentCourse,
      moduleList: updatedModules,
      modules: updatedModules.length
    };
    
    setCurrentCourse(updatedCourse);
    
    // Update in localStorage
    const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const updatedCourses = savedCourses.map((c: any) => 
      c.id === course.id ? updatedCourse : c
    );
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    
    // Notify parent component if callback provided
    if (onCourseUpdate) {
      onCourseUpdate(updatedCourse);
    }
    
    setShowAddModuleForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Courses
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">{currentCourse.title}</h2>
          <p className="text-gray-600">{currentCourse.description}</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowAddModuleForm(true)}>
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
        modules={currentCourse.modules}
        enrolledUsers={currentCourse.enrolledUsers}
        maxEnrollment={currentCourse.maxEnrollment}
        completionRate={currentCourse.completionRate}
        estimatedDuration={currentCourse.estimatedDuration}
      />

      {/* Modules List */}
      <CourseModulesList 
        modules={currentCourse.moduleList} 
        onModuleUpdate={handleModuleUpdate}
      />

      {/* Add Module Modal */}
      <ModuleForm
        open={showAddModuleForm}
        onOpenChange={setShowAddModuleForm}
        module={null}
        onSave={handleAddModule}
      />
    </div>
  );
};
