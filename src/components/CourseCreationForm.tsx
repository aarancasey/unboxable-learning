
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Upload, FileText, Video, Settings, Trash2 } from 'lucide-react';
import { ModuleForm } from './ModuleForm';

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

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-blue-600" />;
      case 'interactive':
        return <Settings className="h-4 w-4 text-green-600" />;
      case 'document':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'survey':
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Course Information */}
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
                      onChange={(e) => setMaxLearners(parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="enrolledLearners">Currently Enrolled</Label>
                  <Input
                    id="enrolledLearners"
                    type="number"
                    value={enrolledLearners}
                    onChange={(e) => setEnrolledLearners(parseInt(e.target.value))}
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

            {/* Modules Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Modules ({modules.length})</CardTitle>
                  <Button onClick={handleAddModule} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {modules.map((module, index) => (
                    <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        {getModuleIcon(module.type)}
                        <div>
                          <h4 className="font-medium">{module.title}</h4>
                          <p className="text-sm text-gray-500">{module.duration} • {module.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditModule(module)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                        {modules.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteModule(module.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Modules are sequential. The survey must be completed before learners can access other materials.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCourse} disabled={!courseName.trim()}>
                Create Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Module Form Dialog */}
      <ModuleForm
        open={showModuleForm}
        onOpenChange={setShowModuleForm}
        module={editingModule}
        onSave={handleSaveModule}
      />
    </>
  );
};
