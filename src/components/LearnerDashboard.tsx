
import { useState } from 'react';
import ModuleViewer from './ModuleViewer';
import SurveyForm from './SurveyForm';
import LearnerHeader from './LearnerHeader';
import ProgressOverview from './ProgressOverview';
import ModulesSection from './ModulesSection';

interface LearnerDashboardProps {
  onLogout: () => void;
}

const LearnerDashboard = ({ onLogout }: LearnerDashboardProps) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'module' | 'survey'>('dashboard');
  const [selectedModule, setSelectedModule] = useState<any>(null);

  // Empty data structure - no mock data
  const learnerData = {
    name: "",
    progress: 0,
    completedModules: 0,
    totalModules: 0,
    nextSurvey: "",
    modules: []
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
        learnerName={learnerData.name}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressOverview
          progress={learnerData.progress}
          completedModules={learnerData.completedModules}
          totalModules={learnerData.totalModules}
          nextSurvey={learnerData.nextSurvey}
          onStartSurvey={() => setActiveView('survey')}
        />

        <ModulesSection
          modules={learnerData.modules}
          onModuleClick={handleModuleClick}
        />
      </div>
    </div>
  );
};

export default LearnerDashboard;
