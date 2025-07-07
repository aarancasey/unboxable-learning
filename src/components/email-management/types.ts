export interface EmailTemplate {
  id: string;
  template_name: string;
  template_type: string;
  subject_template: string;
  content_template: string;
  html_template: string;
  variables: string[];
  is_default: boolean;
}

export interface EmailTemplateManagerProps {
  onTemplateSelect?: (template: EmailTemplate) => void;
}

export interface EmailTemplateFormProps {
  editingTemplate: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export interface EmailTemplateCardProps {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
  onPreview: (template: EmailTemplate) => void;
  onSelect?: (template: EmailTemplate) => void;
}