
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Settings, Calendar } from 'lucide-react';
import { CourseStats } from './CourseStats';
import { CourseModulesList } from './CourseModulesList';
import { ModuleForm } from '../ModuleForm';
import { CourseTimelineView } from '../course-timeline/CourseTimelineView';

interface Course {
  id: number;
  title: string;
  description: string;
  modules?: number;
  maxEnrollment?: number;
  max_enrollment?: number;
  enrolledUsers?: number;
  enrolled_count?: number;
  completionRate?: number;
  status: string;
  createdDate?: string;
  created_at?: string;
  estimatedDuration?: string;
  duration?: string;
  moduleList?: any[];
  module_list?: any[];
}

interface CourseDetailViewProps {
  course: Course;
  onBack: () => void;
  onCourseUpdate?: (updatedCourse: Course) => void;
}

export const CourseDetailView = ({ course, onBack, onCourseUpdate }: CourseDetailViewProps) => {
  const [showAddModuleForm, setShowAddModuleForm] = useState(false);
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(course);

  const handleModuleUpdate = async (moduleId: number, updatedModule: any) => {
    console.log('Module updated:', moduleId, updatedModule);
    
    // Use the correct module list property (module_list from DB or moduleList for legacy)
     const moduleList = (currentCourse as any).module_list || currentCourse.moduleList || [];
    
    // Update the module in the course
    const updatedModules = moduleList.map((module: any) => 
      module.id === moduleId ? { ...module, ...updatedModule } : module
    );
    
    const updatedCourse = {
      ...currentCourse,
      module_list: updatedModules,
      moduleList: updatedModules // Keep both for compatibility
    };
    
    setCurrentCourse(updatedCourse);
    
    try {
      // Update the course in Supabase with new module list
      const { DataService } = await import('@/services/dataService');
      await DataService.updateCourse(course.id, { module_list: updatedModules });
      
      console.log('Course updated successfully in database');
    } catch (error) {
      console.error('Failed to update course in database:', error);
    }
    
    // Notify parent component if callback provided
    if (onCourseUpdate) {
      onCourseUpdate(updatedCourse);
    }
  };

  const handleModuleDelete = (moduleId: number) => {
    console.log('Module deleted:', moduleId);
    
    // Use the correct module list property
     const moduleList = (currentCourse as any).module_list || currentCourse.moduleList || [];
    
    // Remove the module from the course
    const updatedModules = moduleList.filter((module: any) => module.id !== moduleId);
    
    const updatedCourse = {
      ...currentCourse,
      module_list: updatedModules,
      moduleList: updatedModules, // Keep both for compatibility
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
  };

  const handleAddModule = (newModuleData: any) => {
    const newModule = {
      id: Date.now().toString(),
      ...newModuleData,
      status: 'active'
    };

    // Use the correct module list property
    const moduleList = (currentCourse as any).module_list || currentCourse.moduleList || [];
    
    const updatedModules = [...moduleList, newModule];
    const updatedCourse = {
      ...currentCourse,
      module_list: updatedModules,
      moduleList: updatedModules, // Keep both for compatibility
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
          <Button variant="outline" onClick={() => setShowTimelineDialog(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            View Timeline
          </Button>
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
         modules={currentCourse.modules || ((currentCourse as any).module_list || currentCourse.moduleList || []).length}
         enrolledUsers={currentCourse.enrolledUsers || (currentCourse as any).enrolled_count || 0}
         maxEnrollment={currentCourse.maxEnrollment || (currentCourse as any).max_enrollment || 20}
         completionRate={currentCourse.completionRate || 0}
         estimatedDuration={currentCourse.estimatedDuration || (currentCourse as any).duration || 'N/A'}
       />

       {/* Modules List */}
       <CourseModulesList 
         modules={((currentCourse as any).module_list || currentCourse.moduleList || []).filter((module: any) => module.type !== 'survey')}
        onModuleUpdate={handleModuleUpdate}
        onModuleDelete={handleModuleDelete}
      />

      {/* Add Module Modal */}
      <ModuleForm
        open={showAddModuleForm}
        onOpenChange={setShowAddModuleForm}
        module={null}
        onSave={handleAddModule}
      />

      {/* Timeline Dialog */}
      <Dialog open={showTimelineDialog} onOpenChange={setShowTimelineDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Timeline & Email Automation</DialogTitle>
          </DialogHeader>
          <CourseTimelineView
            courseScheduleId={currentCourse.id.toString()}
            courseName={currentCourse.title}
            startDate={new Date().toISOString().split('T')[0]}
            endDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
