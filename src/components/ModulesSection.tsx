
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
  );
};

export default ModulesSection;
