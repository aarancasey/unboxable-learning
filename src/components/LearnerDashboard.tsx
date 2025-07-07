import { useState, useEffect } from 'react';
import ModuleViewer from './ModuleViewer';
import SurveyForm from './SurveyForm';
import LearnerHeader from './LearnerHeader';
import LearnerWelcomeSection from './LearnerWelcomeSection';
import ProgressOverview from './ProgressOverview';
import ModulesSection from './ModulesSection';
import SurveyPrerequisiteSection from './SurveyPrerequisiteSection';
import PasswordChangeModal from './PasswordChangeModal';
import { useAnalytics } from '@/hooks/useAnalytics';


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
  const [surveyModules, setSurveyModules] = useState<any[]>([]);
  const [surveyStatus, setSurveyStatus] = useState<'not_started' | 'completed' | 'approved'>('not_started');
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const { trackModuleStart, trackSurveySubmission } = useAnalytics();

  useEffect(() => {
    // Check if learner needs to change password on first login
    if (learnerData && learnerData.requiresPasswordChange) {
      setShowPasswordModal(true);
    }

    // Check survey status
    const surveySubmissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
    const hasSurveyCompleted = surveySubmissions.length > 0;
    const adminApproval = localStorage.getItem('surveyApproved') === 'true';
    
    let currentSurveyStatus: 'not_started' | 'completed' | 'approved' = 'not_started';
    if (hasSurveyCompleted && adminApproval) {
      currentSurveyStatus = 'approved';
    } else if (hasSurveyCompleted) {
      currentSurveyStatus = 'completed';
    }
    setSurveyStatus(currentSurveyStatus);

    // Load available courses and separate surveys from learning modules
    const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    console.log('Loading courses for learner:', savedCourses);
    
    if (savedCourses.length > 0) {
      const activeCourse = savedCourses.find((course: any) => course.status === 'active');
      setCurrentCourse(activeCourse);
      
      const allModules: any[] = [];
      const allSurveys: any[] = [];
      
      savedCourses.forEach((course: any) => {
        if (course.status === 'active' && course.moduleList) {
          course.moduleList.forEach((module: any) => {
            const moduleData = {
              ...module,
              courseId: course.id,
              courseName: course.title,
            };
            
            if (module.type === 'survey') {
              // Surveys are always available as pre-requisites
              allSurveys.push({
                ...moduleData,
                unlocked: true,
                status: 'available'
              });
            } else {
              // Learning modules are locked until survey is approved by admin
              const shouldUnlock = currentSurveyStatus === 'approved';
              allModules.push({
                ...moduleData,
                unlocked: shouldUnlock,
                status: shouldUnlock ? 'available' : 'locked',
                unlockDate: !shouldUnlock ? 'Complete and get survey approved to unlock' : undefined
              });
            }
          });
        }
      });
      
      setAvailableModules(allModules);
      setSurveyModules(allSurveys);
    }
  }, [learnerData]);

  // Default empty data structure if no learner data provided
  const defaultLearnerData = {
    name: "Demo Learner",
    progress: 0,
    completedModules: 0,
    totalModules: availableModules.length,
    nextSurvey: surveyStatus === 'approved' ? "Post-Course Assessment" : "Pre-Course Assessment",
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
    // Track module start
    trackModuleStart(module.id || 'unknown', module.title || 'Unknown Module', module.courseId || 'unknown');
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
          // Track survey submission
          trackSurveySubmission('customer-service-assessment', 'pre-course');
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
        clientLogo={currentCourse?.logoUrl}
        courseName={currentCourse?.title}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <LearnerWelcomeSection 
          learnerName={displayData.name}
          surveyStatus={surveyStatus}
        />

        {/* Survey Pre-requisite Section */}
        {surveyModules.length > 0 && (
          <SurveyPrerequisiteSection
            surveys={surveyModules}
            surveyStatus={surveyStatus}
            onStartSurvey={() => setActiveView('survey')}
            onStartPostSurvey={() => setActiveView('survey')}
            hasCompletedModules={displayData.completedModules > 0}
          />
        )}

        <ProgressOverview
          progress={displayData.progress}
          completedModules={displayData.completedModules}
          totalModules={modules.length}
          nextSurvey={displayData.nextSurvey}
          onStartSurvey={() => setActiveView('survey')}
          hasModules={modules.length > 0}
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
