
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModuleForm } from './ModuleForm';
import { CourseBasicForm } from './course-creation/CourseBasicForm';
import { ModulesListCard } from './course-creation/ModulesListCard';
import { CourseFormActions } from './course-creation/CourseFormActions';
import { FlexibleDurationForm } from './course-creation/FlexibleDurationForm';
import { EmailTemplateManager } from './email-management/EmailTemplateManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  
  // Enhanced flexible duration fields
  const [durationType, setDurationType] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [durationValue, setDurationValue] = useState(4);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(7);
  const [courseLocation, setCourseLocation] = useState('');
  const [courseInstructor, setCourseInstructor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [clientLogo, setClientLogo] = useState<File | null>(null);
  
  const { toast } = useToast();
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

  const handleSaveCourse = async () => {
    if (!startDate) {
      toast({
        title: "Missing Information",
        description: "Please select a start date for the course.",
        variant: "destructive",
      });
      return;
    }

    try {
      let logoUrl = null;

      // Upload logo if provided
      if (clientLogo) {
        const logoFileName = `${Date.now()}-${clientLogo.name}`;
        const { data: logoData, error: logoError } = await supabase.storage
          .from('course-logos')
          .upload(logoFileName, clientLogo);

        if (logoError) throw logoError;

        const { data: { publicUrl } } = supabase.storage
          .from('course-logos')
          .getPublicUrl(logoFileName);

        logoUrl = publicUrl;
      }
      // Calculate end date based on duration
      const start = new Date(startDate);
      let endDate = new Date(start);
      
      if (durationType === 'days') {
        endDate.setDate(start.getDate() + durationValue - 1);
      } else if (durationType === 'weeks') {
        endDate.setDate(start.getDate() + (durationValue * 7) - 1);
      } else if (durationType === 'months') {
        endDate.setMonth(start.getMonth() + durationValue);
        endDate.setDate(endDate.getDate() - 1);
      }

      // Create course in Supabase
      const courseScheduleData = {
        course_id: Date.now().toString(),
        course_name: courseName,
        description: courseOverview,
        start_date: startDate,
        end_date: endDate.toISOString().split('T')[0],
        max_enrollment: maxLearners,
        enrolled_count: enrolledLearners,
        duration_type: durationType,
        duration_value: durationValue,
        location: courseLocation,
        instructor: courseInstructor,
        logo_url: logoUrl,
        email_schedule_config: {
          reminder_days_before: reminderDaysBefore
        }
      };

      const { data: scheduleData, error: scheduleError } = await supabase
        .from('course_schedules')
        .insert([courseScheduleData])
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Create modules schedule
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        let moduleUnlockDate = new Date(start);
        
        if (durationType === 'days') {
          moduleUnlockDate.setDate(start.getDate() + i);
        } else if (durationType === 'weeks') {
          moduleUnlockDate.setDate(start.getDate() + (i * 7));
        } else if (durationType === 'months') {
          moduleUnlockDate.setMonth(start.getMonth() + i);
        }

        await supabase.from('module_schedules').insert([{
          course_schedule_id: scheduleData.id,
          module_id: module.id,
          module_title: module.title,
          module_type: module.type,
          week_number: i + 1,
          unlock_date: moduleUnlockDate.toISOString().split('T')[0],
          unlock_time: '09:00:00',
          email_notification_date: new Date(moduleUnlockDate.getTime() - (reminderDaysBefore * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        }]);
      }

      // Legacy course data for existing components
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
        estimatedDuration: `${durationValue} ${durationType}`,
        logoUrl: logoUrl,
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
      
      toast({
        title: "Course Created Successfully",
        description: `${courseName} has been created with automated email scheduling.`,
      });
      
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error Creating Course",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setCourseName('');
    setCourseOverview('');
    setDurationType('weeks');
    setDurationValue(4);
    setReminderDaysBefore(7);
    setCourseLocation('');
    setCourseInstructor('');
    setStartDate('');
    setClientLogo(null);
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course with Automated Scheduling</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Course Details</TabsTrigger>
              <TabsTrigger value="schedule">Duration & Schedule</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="emails">Email Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <CourseBasicForm
                courseName={courseName}
                setCourseName={setCourseName}
                courseOverview={courseOverview}
                setCourseOverview={setCourseOverview}
                duration={`${durationValue} ${durationType}`}
                setDuration={() => {}} // Controlled by flexible form
                maxLearners={maxLearners}
                setMaxLearners={setMaxLearners}
                enrolledLearners={enrolledLearners}
                setEnrolledLearners={setEnrolledLearners}
                clientLogo={clientLogo}
                setClientLogo={setClientLogo}
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Course Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="space-y-4">
              <FlexibleDurationForm
                durationType={durationType}
                setDurationType={setDurationType}
                durationValue={durationValue}
                setDurationValue={setDurationValue}
                reminderDaysBefore={reminderDaysBefore}
                setReminderDaysBefore={setReminderDaysBefore}
                courseLocation={courseLocation}
                setCourseLocation={setCourseLocation}
                courseInstructor={courseInstructor}
                setCourseInstructor={setCourseInstructor}
              />
            </TabsContent>
            
            <TabsContent value="modules" className="space-y-4">
              <ModulesListCard
                modules={modules}
                onAddModule={handleAddModule}
                onEditModule={handleEditModule}
                onDeleteModule={handleDeleteModule}
              />
            </TabsContent>
            
            <TabsContent value="emails" className="space-y-4">
              <EmailTemplateManager />
            </TabsContent>
            
            <div className="pt-4 border-t">
              <CourseFormActions
                onCancel={() => onOpenChange(false)}
                onSave={handleSaveCourse}
                isValid={!!courseName.trim() && !!startDate}
              />
            </div>
          </Tabs>
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
