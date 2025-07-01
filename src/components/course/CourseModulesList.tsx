
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlayCircle, Settings, FileText, Eye } from 'lucide-react';
import { ModulePreviewModal } from './ModulePreviewModal';
import { ModuleSettingsModal } from './ModuleSettingsModal';

interface Module {
  id: number;
  title: string;
  type: string;
  duration: string;
  status: string;
}

interface CourseModulesListProps {
  modules: Module[];
  onModuleUpdate?: (moduleId: number, updatedModule: Partial<Module>) => void;
}

const getModuleIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <PlayCircle className="h-4 w-4 text-blue-600" />;
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

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    case 'draft':
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
    case 'completed':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
    case 'scheduled':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Scheduled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export const CourseModulesList = ({ modules, onModuleUpdate }: CourseModulesListProps) => {
  const [previewModule, setPreviewModule] = useState<Module | null>(null);
  const [settingsModule, setSettingsModule] = useState<Module | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleViewModule = (module: Module) => {
    setPreviewModule(module);
    setShowPreview(true);
  };

  const handleSettingsModule = (module: Module) => {
    setSettingsModule(module);
    setShowSettings(true);
  };

  const handleModuleSave = (updatedModule: Partial<Module>) => {
    if (settingsModule && onModuleUpdate) {
      onModuleUpdate(settingsModule.id, updatedModule);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Course Modules</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {modules.map((module, index) => (
              <div key={module.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getModuleIcon(module.type)}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{module.title}</h4>
                        <p className="text-sm text-gray-500">{module.duration} • {module.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(module.status)}
                    <Button variant="ghost" size="sm" onClick={() => handleViewModule(module)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleSettingsModule(module)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <ModulePreviewModal
        module={previewModule}
        open={showPreview}
        onOpenChange={setShowPreview}
      />

      {/* Settings Modal */}
      <ModuleSettingsModal
        module={settingsModule}
        open={showSettings}
        onOpenChange={setShowSettings}
        onSave={handleModuleSave}
      />
    </>
  );
};
