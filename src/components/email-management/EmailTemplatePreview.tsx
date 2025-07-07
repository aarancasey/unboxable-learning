import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BrandedEmailPreview } from './BrandedEmailPreview';
import { EmailTemplate } from './types';

interface EmailTemplatePreviewProps {
  template: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailTemplatePreview = ({ template, isOpen, onClose }: EmailTemplatePreviewProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Email Preview: {template?.template_name}</DialogTitle>
        </DialogHeader>
        
        {template && (
          <div className="space-y-4">
            <BrandedEmailPreview 
              subject={template.subject_template}
              content={template.content_template}
            />
            
            <div className="text-xs text-gray-500 text-center">
              This is a preview with sample data. Actual emails will use real course information.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};