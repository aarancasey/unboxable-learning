
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  Calendar
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  status: string;
  duration: string;
  type: string;
  unlocked: boolean;
  unlockDate?: string;
}

interface ModulesSectionProps {
  modules: Module[];
  onModuleClick: (module: Module) => void;
}

const ModulesSection = ({ modules, onModuleClick }: ModulesSectionProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <PlayCircle className="h-5 w-5 text-unboxable-orange" />;
      case 'locked':
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return <BookOpen className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string, unlocked: boolean) => {
    if (!unlocked) {
      return <Badge variant="secondary" className="bg-gray-200 text-gray-600">Locked</Badge>;
    }
    
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-orange-100 text-unboxable-orange hover:bg-orange-100">In Progress</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Available</Badge>;
    }
  };

  const handleModuleClick = (module: Module) => {
    if (module.unlocked) {
      onModuleClick(module);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-unboxable-navy" />
          <span className="text-unboxable-navy">Learning Modules</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {modules.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-unboxable-navy mb-2">No Modules Available</h3>
            <p className="text-gray-600">Check back later for new learning content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <Card
                key={module.id}
                className={`transition-all duration-300 ${
                  module.unlocked 
                    ? 'cursor-pointer hover:shadow-lg hover:border-unboxable-navy/30 hover:scale-105' 
                    : 'opacity-50 cursor-not-allowed bg-gray-50'
                }`}
                onClick={() => handleModuleClick(module)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${!module.unlocked ? 'text-gray-400' : ''}`}>
                      {getStatusIcon(module.unlocked ? module.status : 'locked')}
                    </div>
                    {getStatusBadge(module.status, module.unlocked)}
                  </div>
                  
                  <h3 className={`font-medium mb-2 ${
                    module.unlocked ? 'text-unboxable-navy' : 'text-gray-400'
                  }`}>
                    {module.title}
                  </h3>
                  
                  <div className={`flex items-center justify-between text-sm ${
                    module.unlocked ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    <span>{module.duration}</span>
                    <span className="capitalize">{module.type}</span>
                  </div>
                  
                  {!module.unlocked && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center text-xs text-yellow-700">
                        <Calendar className="h-3 w-3 mr-1" />
                        {module.unlockDate || 'Complete previous modules to unlock'}
                      </div>
                    </div>
                  )}
                  
                  {module.unlocked && module.type === 'survey' && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center text-xs text-blue-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Required to unlock other modules
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModulesSection;
