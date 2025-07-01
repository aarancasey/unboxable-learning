
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ModuleContentFieldsProps {
  type: 'survey' | 'video' | 'document' | 'interactive';
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  documentUrl: string;
  setDocumentUrl: (url: string) => void;
}

export const ModuleContentFields = ({
  type,
  videoUrl,
  setVideoUrl,
  documentUrl,
  setDocumentUrl,
}: ModuleContentFieldsProps) => {
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
