
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';

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

  useEffect(() => {
    if (module) {
      setTitle(module.title);
      setType(module.type);
      setDuration(module.duration);
      setDescription(module.description);
      setVideoUrl(module.content?.videoUrl || '');
      setDocumentUrl(module.content?.documentUrl || '');
      setUploadedFiles(module.content?.files || []);
    } else {
      // Reset form for new module
      setTitle('');
      setType('document');
      setDuration('');
      setDescription('');
      setVideoUrl('');
      setDocumentUrl('');
      setUploadedFiles([]);
    }
  }, [module, open]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

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
      }
    };

    onSave(moduleData);
  };

  const renderContentFields = () => {
    switch (type) {
      case 'video':
        return (
          <div>
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter video URL (YouTube, Vimeo, etc.)"
            />
          </div>
        );
      
      case 'document':
        return (
          <div>
            <Label htmlFor="documentUrl">Document URL (optional)</Label>
            <Input
              id="documentUrl"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="Enter document URL"
            />
          </div>
        );
      
      case 'survey':
        return (
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-800">
              Survey content will be managed through the survey system. This module will automatically include the Leadership Assessment survey.
            </p>
          </div>
        );
      
      case 'interactive':
        return (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              Interactive content can include quizzes, simulations, or other engaging activities. Use the file upload section to add supporting materials.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{module ? 'Edit Module' : 'Add New Module'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="moduleTitle">Module Title</Label>
            <Input
              id="moduleTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter module title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="moduleType">Module Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select module type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="survey">Survey</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="moduleDuration">Duration</Label>
              <Input
                id="moduleDuration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 30 min"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="moduleDescription">Description</Label>
            <Textarea
              id="moduleDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what learners will gain from this module..."
              className="min-h-[80px]"
            />
          </div>

          {/* Content-specific fields */}
          {renderContentFields()}

          {/* File Upload Section */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Supporting Materials</Label>
                  <div>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mov"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Uploaded files:</p>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Accepted formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, GIF, MP4, MOV
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim() || !duration.trim()}>
              {module ? 'Update Module' : 'Add Module'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
