
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, isAfter, parseISO } from 'date-fns';
import { dateHelpers } from '@/lib/dateUtils';

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
  const [scheduledModules, setScheduledModules] = useState<any[]>([]);

  useEffect(() => {
    loadModuleSchedules();
  }, []);

  const loadModuleSchedules = async () => {
    try {
      const { data: moduleSchedules, error } = await supabase
        .from('module_schedules')
        .select(`
          *,
          course_schedules (course_name, start_date, status)
        `)
        .order('unlock_date', { ascending: true });

      if (error) throw error;
      setScheduledModules(moduleSchedules || []);
    } catch (error) {
      console.error('Error loading module schedules:', error);
    }
  };

  const isModuleUnlocked = (module: Module) => {
    // Check if module is unlocked in scheduled courses
    const scheduledModule = scheduledModules.find(sm => sm.module_id === module.id);
    if (scheduledModule) {
      const now = new Date();
      const unlockDateTime = new Date(`${scheduledModule.unlock_date}T${scheduledModule.unlock_time}`);
      return isAfter(now, unlockDateTime) || scheduledModule.is_unlocked;
    }
    
    // Fallback to existing unlock logic
    return module.unlocked;
  };

  const getModuleUnlockDate = (module: Module) => {
    const scheduledModule = scheduledModules.find(sm => sm.module_id === module.id);
    if (scheduledModule) {
      return format(parseISO(scheduledModule.unlock_date), 'd MMM yyyy');
    }
    return module.unlockDate || 'Complete previous modules to unlock';
  };

  const getStatusIcon = (status: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return <Clock className="h-5 w-5 text-gray-400" />;
    }
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <PlayCircle className="h-5 w-5 text-unboxable-orange" />;
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
    const isUnlocked = isModuleUnlocked(module);
    console.log('Module clicked:', module.title, 'unlocked:', isUnlocked);
    if (isUnlocked) {
      onModuleClick(module);
    } else {
      console.log('Module is locked, click ignored');
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {modules.map((module) => {
              const isUnlocked = isModuleUnlocked(module);
              const unlockDate = getModuleUnlockDate(module);
              
              return (
                <Card
                  key={module.id}
                  className={`transition-all duration-300 ${
                    isUnlocked 
                      ? 'cursor-pointer hover:shadow-lg hover:border-unboxable-navy/30 hover:scale-105' 
                      : 'opacity-50 cursor-not-allowed bg-gray-50'
                  }`}
                  onClick={() => handleModuleClick(module)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`${!isUnlocked ? 'text-gray-400' : ''}`}>
                        {getStatusIcon(isUnlocked ? module.status : 'locked', isUnlocked)}
                      </div>
                      {getStatusBadge(module.status, isUnlocked)}
                    </div>
                    
                    <h3 className={`font-medium mb-2 ${
                      isUnlocked ? 'text-unboxable-navy' : 'text-gray-400'
                    }`}>
                      {module.title}
                    </h3>
                    
                    <div className={`flex items-center justify-between text-sm ${
                      isUnlocked ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      <span>{module.duration}</span>
                      <span className="capitalize">{module.type}</span>
                    </div>
                    
                    {!isUnlocked && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center text-xs text-yellow-700">
                          <Calendar className="h-3 w-3 mr-1" />
                          Unlocks: {unlockDate}
                        </div>
                      </div>
                    )}
                    
                    {isUnlocked && module.type === 'survey' && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center text-xs text-blue-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Required to unlock other modules
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModulesSection;
