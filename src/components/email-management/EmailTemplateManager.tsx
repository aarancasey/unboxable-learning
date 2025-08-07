import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useEmailTemplates } from './useEmailTemplates';
import { EmailTemplateCard } from './EmailTemplateCard';
import { EmailTemplateForm } from './EmailTemplateForm';
import { EmailTemplatePreview } from './EmailTemplatePreview';
import { EmailTemplate, EmailTemplateManagerProps } from './types';

export const EmailTemplateManager = ({ onTemplateSelect }: EmailTemplateManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const { templates, saveTemplate } = useEmailTemplates();

  const handleSaveTemplate = async (
    templateName: string,
    templateType: string,
    subjectTemplate: string,
    contentTemplate: string,
    htmlTemplate: string
  ) => {
    return await saveTemplate(
      templateName,
      templateType,
      subjectTemplate,
      contentTemplate,
      htmlTemplate,
      editingTemplate
    );
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setIsCreateDialogOpen(true);
  };

  const handleCloseForm = () => {
    setEditingTemplate(null);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Email Template Management</h2>
          <p className="text-muted-foreground">
            Create and customise email templates for course automation
          </p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <EmailTemplateCard
            key={template.id}
            template={template}
            onEdit={handleEditTemplate}
            onPreview={setPreviewTemplate}
            onSelect={onTemplateSelect}
          />
        ))}
      </div>

      {/* Form Dialog */}
      <EmailTemplateForm
        editingTemplate={editingTemplate}
        isOpen={isCreateDialogOpen}
        onClose={handleCloseForm}
        onSave={handleSaveTemplate}
      />

      {/* Preview Dialog */}
      <EmailTemplatePreview
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </div>
  );
};