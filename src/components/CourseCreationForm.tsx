
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModuleForm } from './ModuleForm';
import { CourseBasicForm } from './course-creation/CourseBasicForm';
import { ModulesListCard } from './course-creation/ModulesListCard';
import { CourseFormActions } from './course-creation/CourseFormActions';

interface Module {
  id: string;
  title: string;
  type: 'survey' | 'video' | 'document' | 'interactive';
  duration: string;
  description: string;
  content?: {
    files?: File[];
    videoUrl?: string;
    documentUrl?: string;
  };
}

interface CourseCreationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (courseData: any) => void;
}

export const CourseCreationForm = ({ open, onOpenChange, onSave }: CourseCreationFormProps) => {
  const [courseName, setCourseName] = useState('');
  const [courseOverview, setCourseOverview] = useState('');
  const [duration, setDuration] = useState('4 weeks');
  const [maxLearners, setMaxLearners] = useState(17);
  const [enrolledLearners, setEnrolledLearners] = useState(0);
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Leadership Sentiment, Adaptive and Agile Self-Assessment',
      type: 'survey',
      duration: '45 min',
      description: 'Comprehensive leadership self-assessment covering sentiment, purpose, and agility'
    }
  ]);
  
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const handleAddModule = () => {
    setEditingModule(null);
    setShowModuleForm(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setShowModuleForm(true);
  };

  const handleSaveModule = (moduleData: Omit<Module, 'id'>) => {
    if (editingModule) {
      // Update existing module
      setModules(prev => prev.map(m => 
        m.id === editingModule.id 
          ? { ...moduleData, id: editingModule.id }
          : m
      ));
    } else {
      // Add new module
      const newModule: Module = {
        ...moduleData,
        id: Date.now().toString()
      };
      setModules(prev => [...prev, newModule]);
    }
    setShowModuleForm(false);
    setEditingModule(null);
  };

  const handleDeleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
  };

  const handleSaveCourse = () => {
    const courseData = {
      id: Date.now(),
      title: courseName,
      description: courseOverview,
      modules: modules.length,
      maxEnrollment: maxLearners,
      enrolledUsers: enrolledLearners,
      completionRate: 0,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      estimatedDuration: duration,
      moduleList: modules.map((module, index) => ({
        id: module.id,
        title: module.title,
        type: module.type,
        duration: module.duration,
        status: 'active',
        description: module.description,
        content: module.content
      }))
    };

    onSave(courseData);
    onOpenChange(false);
    
    // Reset form
    setCourseName('');
    setCourseOverview('');
    setModules([{
      id: '1',
      title: 'Leadership Sentiment, Adaptive and Agile Self-Assessment',
      type: 'survey',
      duration: '45 min',
      description: 'Comprehensive leadership self-assessment covering sentiment, purpose, and agility'
    }]);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <CourseBasicForm
              courseName={courseName}
              setCourseName={setCourseName}
              courseOverview={courseOverview}
              setCourseOverview={setCourseOverview}
              duration={duration}
              setDuration={setDuration}
              maxLearners={maxLearners}
              setMaxLearners={setMaxLearners}
              enrolledLearners={enrolledLearners}
              setEnrolledLearners={setEnrolledLearners}
            />

            <ModulesListCard
              modules={modules}
              onAddModule={handleAddModule}
              onEditModule={handleEditModule}
              onDeleteModule={handleDeleteModule}
            />

            <CourseFormActions
              onCancel={() => onOpenChange(false)}
              onSave={handleSaveCourse}
              isValid={!!courseName.trim()}
            />
          </div>
        </DialogContent>
      </Dialog>

      <ModuleForm
        open={showModuleForm}
        onOpenChange={setShowModuleForm}
        module={editingModule}
        onSave={handleSaveModule}
      />
    </>
  );
};
