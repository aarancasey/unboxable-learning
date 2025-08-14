import { useState, useEffect } from 'react';
import ModuleViewer from './ModuleViewer';
import SurveyForm from './SurveyForm';
import LearnerHeader from './LearnerHeader';
import LearnerWelcomeSection from './LearnerWelcomeSection';
import ModulesSection from './ModulesSection';
import PasswordChangeModal from './PasswordChangeModal';
import { useAnalytics } from '@/hooks/useAnalytics';
import { FloatingChatBot } from './ai/FloatingChatBot';
import { AssessmentCard } from './AssessmentCard';


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

    // Check survey status from database
    const checkSurveyStatus = async () => {
      try {
        const { DataService } = await import('@/services/dataService');
        const surveySubmissions = await DataService.getSurveySubmissions();
        
        // Find surveys for this learner by name and email
        const learnerSurveys = surveySubmissions.filter((submission: any) => 
          submission.learner_name === learnerData?.name || 
          submission.learner_name?.toLowerCase() === learnerData?.name?.toLowerCase() ||
          (learnerData?.email && submission.responses?.participantInfo?.email === learnerData.email) ||
          (learnerData?.email && submission.responses?.email === learnerData.email)
        );
        
        let currentSurveyStatus: 'not_started' | 'completed' | 'approved' = 'not_started';
        
        if (learnerSurveys.length > 0) {
          const latestSurvey = learnerSurveys[0]; // Assuming most recent
          if (latestSurvey.status === 'approved') {
            currentSurveyStatus = 'approved';
          } else if (['pending', 'completed', 'reviewed', 'needs_revision'].includes(latestSurvey.status)) {
            currentSurveyStatus = 'completed';
          }
        }
        
        setSurveyStatus(currentSurveyStatus);
      } catch (error) {
        console.error('Failed to check survey status:', error);
        setSurveyStatus('not_started');
      }
    };

    checkSurveyStatus();

    // Load available courses from DataService (Supabase)
    const loadCoursesFromDatabase = async () => {
      try {
        const { DataService } = await import('@/services/dataService');
        const coursesData = await DataService.getCourses();
        console.log('Loading courses for learner from database:', coursesData);
        
        if (coursesData.length > 0) {
          const activeCourse = coursesData.find((course: any) => course.status === 'active');
          setCurrentCourse(activeCourse);
          
          const allModules: any[] = [];
          const allSurveys: any[] = [];
          
          coursesData.forEach((course: any) => {
            if (course.status === 'active' && course.module_list) {
              course.module_list.forEach((module: any) => {
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
                  const shouldUnlock = surveyStatus === 'approved';
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
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    };

    loadCoursesFromDatabase();
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
        learnerData={currentLearner || learnerData}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Assessment Card - Takes 1/3 of the space */}
          <div className="lg:col-span-1">
            <AssessmentCard
              surveyStatus={surveyStatus}
              onStartSurvey={() => setActiveView('survey')}
              onStartPostSurvey={() => setActiveView('survey')}
              hasCompletedModules={displayData.completedModules > 0}
              courseName={currentCourse?.title}
            />
          </div>

          {/* Learning Modules - Hidden for learners for now */}
          {false && (
            <div className="lg:col-span-2">
              <ModulesSection
                modules={modules}
                onModuleClick={handleModuleClick}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Chat Bot */}
      <FloatingChatBot />

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
