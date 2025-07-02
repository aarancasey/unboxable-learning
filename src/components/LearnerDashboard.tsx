import { useState, useEffect } from 'react';
import ModuleViewer from './ModuleViewer';
import SurveyForm from './SurveyForm';
import LearnerHeader from './LearnerHeader';
import ProgressOverview from './ProgressOverview';
import ModulesSection from './ModulesSection';
import PasswordChangeModal from './PasswordChangeModal';

interface LearnerDashboardProps {
  onLogout: () => void;
  learnerData?: any;
}

const LearnerDashboard = ({ onLogout, learnerData }: LearnerDashboardProps) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'module' | 'survey'>('dashboard');
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentLearner, setCurrentLearner] = useState(learnerData);
  const [availableModules, setAvailableModules] = useState<any[]>([]);

  useEffect(() => {
    // Check if learner needs to change password on first login
    if (learnerData && learnerData.requiresPasswordChange) {
      setShowPasswordModal(true);
    }

    // Check if survey has been completed
    const surveySubmissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
    const hasSurveyCompleted = surveySubmissions.length > 0;

    // Load available courses and their modules
    const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    console.log('Loading courses for learner:', savedCourses);
    
    if (savedCourses.length > 0) {
      // Combine all modules from all active courses
      const allModules = savedCourses.reduce((modules: any[], course: any) => {
        if (course.status === 'active' && course.moduleList) {
          const courseModules = course.moduleList.map((module: any, index: number) => {
            // First module (survey) is always unlocked
            // Other modules are unlocked only after survey completion
            const isFirstModule = index === 0;
            const isSurveyModule = module.type === 'survey';
            const shouldUnlock = isFirstModule || isSurveyModule || hasSurveyCompleted;
            
            return {
              ...module,
              courseId: course.id,
              courseName: course.title,
              unlocked: shouldUnlock,
              status: shouldUnlock ? (isSurveyModule && !hasSurveyCompleted ? 'available' : 'available') : 'locked',
              unlockDate: !shouldUnlock ? 'Complete survey to unlock' : undefined
            };
          });
          return [...modules, ...courseModules];
        }
        return modules;
      }, []);
      setAvailableModules(allModules);
    }
  }, [learnerData]);

  // Default empty data structure if no learner data provided
  const defaultLearnerData = {
    name: "Demo Learner",
    progress: 0,
    completedModules: 0,
    totalModules: availableModules.length,
    nextSurvey: "Customer Service Assessment",
    modules: availableModules
  };

  const displayData = currentLearner || defaultLearnerData;
  // Use the loaded modules from courses
  const modules = availableModules.length > 0 ? availableModules : displayData.modules || [];

  const handlePasswordChanged = (newPassword: string) => {
    if (currentLearner) {
      // Update learner data
      const updatedLearner = {
        ...currentLearner,
        password: newPassword,
        requiresPasswordChange: false
      };
      
      // Update in localStorage
      const storedLearners = localStorage.getItem('learners');
      const learners = storedLearners ? JSON.parse(storedLearners) : [];
      const updatedLearners = learners.map((l: any) => 
        l.id === currentLearner.id ? updatedLearner : l
      );
      localStorage.setItem('learners', JSON.stringify(updatedLearners));
      
      setCurrentLearner(updatedLearner);
    }
    setShowPasswordModal(false);
  };

  const handleModuleClick = (module: any) => {
    setSelectedModule(module);
    setActiveView('module');
  };

  if (activeView === 'module' && selectedModule) {
    return (
      <ModuleViewer 
        module={selectedModule} 
        onBack={() => setActiveView('dashboard')}
        onComplete={() => {
          setActiveView('dashboard');
          // Update module status in real app
        }}
      />
    );
  }

  if (activeView === 'survey') {
    return (
      <SurveyForm 
        onBack={() => setActiveView('dashboard')}
        onSubmit={() => {
          setActiveView('dashboard');
          // Refresh modules after survey submission to unlock them
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LearnerHeader 
        learnerName={displayData.name}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressOverview
          progress={displayData.progress}
          completedModules={displayData.completedModules}
          totalModules={modules.length}
          nextSurvey={displayData.nextSurvey}
          onStartSurvey={() => setActiveView('survey')}
        />

        <ModulesSection
          modules={modules}
          onModuleClick={handleModuleClick}
        />
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onPasswordChanged={handlePasswordChanged}
        learnerName={displayData.name}
      />
    </div>
  );
};

export default LearnerDashboard;
