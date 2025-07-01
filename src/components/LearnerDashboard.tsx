
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
  const [currentLearnier, setCurrentLearner] = useState(learnerData);

  useEffect(() => {
    // Check if learner needs to change password on first login
    if (learnerData && learnerData.requiresPasswordChange) {
      setShowPasswordModal(true);
    }
  }, [learnerData]);

  // Default empty data structure if no learner data provided
  const defaultLearnerData = {
    name: "Demo Learner",
    progress: 0,
    completedModules: 0,
    totalModules: 4,
    nextSurvey: "Customer Service Assessment",
    modules: []
  };

  const displayData = currentLearnier || defaultLearnerData;

  const handlePasswordChanged = (newPassword: string) => {
    if (currentLearnier) {
      // Update learner data
      const updatedLearner = {
        ...currentLearnier,
        password: newPassword,
        requiresPasswordChange: false
      };
      
      // Update in localStorage
      const storedLearners = localStorage.getItem('learners');
      const learners = storedLearners ? JSON.parse(storedLearners) : [];
      const updatedLearners = learners.map((l: any) => 
        l.id === currentLearnier.id ? updatedLearner : l
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
          // Handle survey submission
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
          totalModules={displayData.totalModules}
          nextSurvey={displayData.nextSurvey}
          onStartSurvey={() => setActiveView('survey')}
        />

        <ModulesSection
          modules={displayData.modules}
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
