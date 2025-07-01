
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  LogOut, 
  PlayCircle, 
  FileText,
  Award,
  Calendar
} from 'lucide-react';
import ModuleViewer from './ModuleViewer';
import SurveyForm from './SurveyForm';

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
    if (module.unlocked) {
      setSelectedModule(module);
      setActiveView('module');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <PlayCircle className="h-5 w-5 text-unboxable-orange" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-orange-100 text-unboxable-orange hover:bg-orange-100">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Locked</Badge>;
    }
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/d0544c04-760a-4cf9-824c-612e5ef4aeaa.png" 
                alt="Unboxable" 
                className="h-8"
              />
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-unboxable-navy">Learning Portal</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {learnerData.name || 'Learner'}</span>
              <Button variant="ghost" size="sm" onClick={onLogout} className="hover:bg-slate-100 text-unboxable-navy hover:text-unboxable-navy">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-unboxable-navy">{learnerData.progress}%</span>
                <Award className="h-6 w-6 text-unboxable-orange" />
              </div>
              <Progress value={learnerData.progress} className="mb-2" />
              <p className="text-sm text-gray-600">
                {learnerData.completedModules} of {learnerData.totalModules} modules completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Next Survey Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-6 w-6 text-unboxable-orange" />
              </div>
              <p className="text-sm font-medium text-unboxable-navy mb-1">{learnerData.nextSurvey || 'No surveys available'}</p>
              <Button 
                size="sm" 
                className="w-full bg-unboxable-orange hover:bg-unboxable-orange/90 text-white"
                onClick={() => setActiveView('survey')}
                disabled={!learnerData.nextSurvey}
              >
                Start Survey
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">{learnerData.completedModules}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium text-unboxable-orange">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Upcoming</span>
                  <span className="font-medium text-gray-600">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-unboxable-navy" />
              <span className="text-unboxable-navy">Learning Modules</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {learnerData.modules.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-unboxable-navy mb-2">No Modules Available</h3>
                <p className="text-gray-600">Check back later for new learning content.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learnerData.modules.map((module) => (
                  <Card
                    key={module.id}
                    className={`transition-all hover:shadow-md ${
                      module.unlocked ? 'cursor-pointer hover:border-unboxable-navy/30' : 'opacity-60'
                    }`}
                    onClick={() => handleModuleClick(module)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        {getStatusIcon(module.status)}
                        {getStatusBadge(module.status)}
                      </div>
                      
                      <h3 className="font-medium text-unboxable-navy mb-2">{module.title}</h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{module.duration}</span>
                        <span className="capitalize">{module.type}</span>
                      </div>
                      
                      {!module.unlocked && module.unlockDate && (
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Unlocks {module.unlockDate}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearnerDashboard;
