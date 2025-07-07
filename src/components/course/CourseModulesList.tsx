
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlayCircle, Settings, FileText, Eye, Trash2 } from 'lucide-react';
import { ModulePreviewModal } from './ModulePreviewModal';
import { ModuleForm } from '../ModuleForm';
import { useToast } from '@/hooks/use-toast';

interface Module {
  id: number;
  title: string;
  type: 'survey' | 'video' | 'document' | 'interactive';
  duration: string;
  status: string;
  description?: string;
  content?: {
    files?: File[];
    videoUrl?: string;
    documentUrl?: string;
    googleDocsLinks?: string[];
  };
}

interface CourseModulesListProps {
  modules: Module[];
  onModuleUpdate?: (moduleId: number, updatedModule: any) => void;
  onModuleDelete?: (moduleId: number) => void;
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

export const CourseModulesList = ({ modules, onModuleUpdate, onModuleDelete }: CourseModulesListProps) => {
  const [previewModule, setPreviewModule] = useState<Module | null>(null);
  const [editModule, setEditModule] = useState<Module | null>(null);
  const [deleteModule, setDeleteModule] = useState<Module | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleViewModule = (module: Module) => {
    setPreviewModule(module);
    setShowPreview(true);
  };

  const handleEditModule = (module: Module) => {
    setEditModule(module);
    setShowEdit(true);
  };

  const handleDeleteModule = (module: Module) => {
    setDeleteModule(module);
    setShowDeleteDialog(true);
  };

// Type for ModuleForm module interface
interface ModuleFormModule {
  id: string;
  title: string;
  type: 'survey' | 'video' | 'document' | 'interactive';
  duration: string;
  description: string;
  content?: {
    files?: File[];
    videoUrl?: string;
    documentUrl?: string;
    googleDocsLinks?: string[];
  };
}

  const handleModuleSave = (updatedModuleData: Omit<ModuleFormModule, 'id'>) => {
    if (editModule && onModuleUpdate) {
      // Convert the ModuleForm data to match the CourseModulesList Module type
      const updatedModule = {
        title: updatedModuleData.title,
        type: updatedModuleData.type,
        duration: updatedModuleData.duration,
        description: updatedModuleData.description || '',
        status: editModule.status, // Preserve existing status
        content: updatedModuleData.content
      };
      
      onModuleUpdate(editModule.id, updatedModule);
      toast({
        title: "Module updated",
        description: "The module has been successfully updated.",
      });
    }
  };

  const confirmDelete = () => {
    if (deleteModule && onModuleDelete) {
      onModuleDelete(deleteModule.id);
      toast({
        title: "Module deleted",
        description: "The module has been successfully deleted.",
      });
    }
    setShowDeleteDialog(false);
    setDeleteModule(null);
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
                    <Button variant="ghost" size="sm" onClick={() => handleEditModule(module)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteModule(module)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
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

      {/* Edit Modal */}
      <ModuleForm
        open={showEdit}
        onOpenChange={setShowEdit}
        module={editModule ? {
          id: editModule.id.toString(),
          title: editModule.title,
          type: editModule.type,
          duration: editModule.duration,
          description: editModule.description || '',
          content: editModule.content
        } : null}
        onSave={handleModuleSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteModule?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
