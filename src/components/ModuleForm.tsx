
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModuleBasicFields } from './module/ModuleBasicFields';
import { ModuleContentFields } from './module/ModuleContentFields';
import { ModuleFileUploadSimple } from './module/ModuleFileUploadSimple';
import { ModuleFormActions } from './module/ModuleFormActions';

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
    googleDocsLinks?: string[];
  };
}

interface ModuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Module | null;
  onSave: (moduleData: Omit<Module, 'id'>) => void;
}

export const ModuleForm = ({ open, onOpenChange, module, onSave }: ModuleFormProps) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'survey' | 'video' | 'document' | 'interactive'>('document');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [googleDocsLinks, setGoogleDocsLinks] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      if (module) {
        setTitle(module.title);
        setType(module.type);
        setDuration(module.duration);
        setDescription(module.description);
        setVideoUrl(module.content?.videoUrl || '');
        setDocumentUrl(module.content?.documentUrl || '');
        setUploadedFiles(module.content?.files || []);
        setGoogleDocsLinks(module.content?.googleDocsLinks || []);
      } else {
        // Reset form for new module
        setTitle('');
        setType('document');
        setDuration('');
        setDescription('');
        setVideoUrl('');
        setDocumentUrl('');
        setUploadedFiles([]);
        setGoogleDocsLinks([]);
      }
    }
  }, [module, open]);

  const handleSave = () => {
    const moduleData = {
      title,
      type,
      duration,
      description,
      content: {
        files: uploadedFiles,
        videoUrl: videoUrl || undefined,
        documentUrl: documentUrl || undefined,
        googleDocsLinks: googleDocsLinks.length > 0 ? googleDocsLinks : undefined,
      }
    };

    onSave(moduleData);
    onOpenChange(false);
  };

  const isValid = title.trim() && duration.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{module ? 'Edit Module' : 'Add New Module'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <ModuleBasicFields
            title={title}
            setTitle={setTitle}
            type={type}
            setType={setType}
            duration={duration}
            setDuration={setDuration}
            description={description}
            setDescription={setDescription}
          />

          <ModuleContentFields
            type={type}
            videoUrl={videoUrl}
            setVideoUrl={setVideoUrl}
            documentUrl={documentUrl}
            setDocumentUrl={setDocumentUrl}
          />

          <ModuleFileUploadSimple
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            googleDocsLinks={googleDocsLinks}
            setGoogleDocsLinks={setGoogleDocsLinks}
          />

          <ModuleFormActions
            onCancel={() => onOpenChange(false)}
            onSave={handleSave}
            isEditMode={!!module}
            isValid={!!isValid}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
