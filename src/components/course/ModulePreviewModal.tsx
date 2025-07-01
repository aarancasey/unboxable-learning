
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, FileText, Settings as SettingsIcon, Clock } from 'lucide-react';

interface Module {
  id: number;
  title: string;
  type: string;
  duration: string;
  status: string;
}

interface ModulePreviewModalProps {
  module: Module | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getModuleIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <PlayCircle className="h-6 w-6 text-blue-600" />;
    case 'interactive':
      return <SettingsIcon className="h-6 w-6 text-green-600" />;
    case 'document':
      return <FileText className="h-6 w-6 text-purple-600" />;
    case 'survey':
      return <FileText className="h-6 w-6 text-orange-600" />;
    default:
      return <FileText className="h-6 w-6 text-gray-600" />;
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

export const ModulePreviewModal = ({ module, open, onOpenChange }: ModulePreviewModalProps) => {
  if (!module) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {getModuleIcon(module.type)}
            <span>{module.title}</span>
            {getStatusBadge(module.status)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Module Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{module.duration}</span>
            </div>
            <span>•</span>
            <span className="capitalize">{module.type} Module</span>
          </div>

          {/* Module Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Module Content Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {module.type === 'video' && (
                <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <PlayCircle className="h-16 w-16 mx-auto mb-2 opacity-80" />
                    <p className="text-sm opacity-80">Video Content Preview</p>
                    <p className="text-xs opacity-60">Duration: {module.duration}</p>
                  </div>
                </div>
              )}
              
              {module.type === 'document' && (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Module</h3>
                  <p className="text-gray-600">This module contains reading materials and documents for learners to study.</p>
                </div>
              )}
              
              {module.type === 'interactive' && (
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-8 text-center">
                  <SettingsIcon className="h-16 w-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Module</h3>
                  <p className="text-gray-600">This module contains interactive exercises, quizzes, and hands-on activities.</p>
                </div>
              )}
              
              {module.type === 'survey' && (
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-8 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Survey Module</h3>
                  <p className="text-gray-600">This module contains assessment surveys and feedback forms for learners to complete.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Module Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Learning Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700">
                  This module is designed to help learners understand key concepts and develop practical skills. 
                  Upon completion, learners will be able to apply the knowledge gained in real-world scenarios.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
