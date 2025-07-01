
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Video, Settings, Trash2 } from 'lucide-react';

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

interface ModulesListCardProps {
  modules: Module[];
  onAddModule: () => void;
  onEditModule: (module: Module) => void;
  onDeleteModule: (moduleId: string) => void;
}

export const ModulesListCard = ({
  modules,
  onAddModule,
  onEditModule,
  onDeleteModule
}: ModulesListCardProps) => {
  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-blue-600" />;
      case 'interactive':
        return <Settings className="h-4 w-4 text-green-600" />;
      case 'document':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'survey':
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <divClassName="flex items-center justify-between">
          <CardTitle>Course Modules ({modules.length})</CardTitle>
          <Button onClick={onAddModule} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {modules.map((module, index) => (
            <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                {getModuleIcon(module.type)}
                <div>
                  <h4 className="font-medium">{module.title}</h4>
                  <p className="text-sm text-gray-500">{module.duration} • {module.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onEditModule(module)}>
                  <Settings className="h-4 w-4" />
                </Button>
                {modules.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => onDeleteModule(module.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Modules are sequential. The survey must be completed before learners can access other materials.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
