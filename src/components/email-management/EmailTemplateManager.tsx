import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Edit, Plus, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  template_name: string;
  template_type: string;
  subject_template: string;
  content_template: string;
  variables: string[];
  is_default: boolean;
}

interface EmailTemplateManagerProps {
  onTemplateSelect?: (template: EmailTemplate) => void;
}

export const EmailTemplateManager = ({ onTemplateSelect }: EmailTemplateManagerProps) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const { toast } = useToast();

  // Form state
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState<string>('course_reminder');
  const [subjectTemplate, setSubjectTemplate] = useState('');
  const [contentTemplate, setContentTemplate] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('template_type', { ascending: true });

    if (error) {
      toast({
        title: "Error loading templates",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const processedTemplates = (data || []).map(template => ({
        ...template,
        variables: Array.isArray(template.variables) 
          ? template.variables.map(v => typeof v === 'string' ? v : String(v))
          : []
      }));
      setTemplates(processedTemplates);
    }
  };

  const handleSaveTemplate = async () => {
    const templateData = {
      template_name: templateName,
      template_type: templateType,
      subject_template: subjectTemplate,
      content_template: contentTemplate,
      variables: extractVariables(subjectTemplate + ' ' + contentTemplate),
      is_default: false
    };

    if (editingTemplate) {
      const { error } = await supabase
        .from('email_templates')
        .update(templateData)
        .eq('id', editingTemplate.id);

      if (error) {
        toast({
          title: "Error updating template",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Template updated",
          description: "Email template has been updated successfully.",
        });
        resetForm();
        loadTemplates();
      }
    } else {
      const { error } = await supabase
        .from('email_templates')
        .insert([templateData]);

      if (error) {
        toast({
          title: "Error creating template",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Template created",
          description: "New email template has been created successfully.",
        });
        resetForm();
        loadTemplates();
      }
    }
  };

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      variables.add(match[1].trim());
    }
    
    return Array.from(variables);
  };

  const resetForm = () => {
    setTemplateName('');
    setTemplateType('course_reminder');
    setSubjectTemplate('');
    setContentTemplate('');
    setEditingTemplate(null);
    setIsCreateDialogOpen(false);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setTemplateName(template.template_name);
    setTemplateType(template.template_type);
    setSubjectTemplate(template.subject_template);
    setContentTemplate(template.content_template);
    setEditingTemplate(template);
    setIsCreateDialogOpen(true);
  };

  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case 'pre_survey': return 'Pre-Survey';
      case 'module_unlock': return 'Module Unlock';
      case 'course_reminder': return 'Course Reminder';
      default: return type;
    }
  };

  const getTemplateTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'pre_survey': return 'bg-blue-100 text-blue-800';
      case 'module_unlock': return 'bg-green-100 text-green-800';
      case 'course_reminder': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Email Template Management</h2>
          <p className="text-muted-foreground">
            Create and customize email templates for course automation
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Email Template' : 'Create New Email Template'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Custom Course Reminder"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-type">Template Type</Label>
                  <Select value={templateType} onValueChange={setTemplateType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course_reminder">Course Reminder</SelectItem>
                      <SelectItem value="pre_survey">Pre-Survey</SelectItem>
                      <SelectItem value="module_unlock">Module Unlock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    value={subjectTemplate}
                    onChange={(e) => setSubjectTemplate(e.target.value)}
                    placeholder="Welcome to {{course_name}} - Starting {{course_start_date}}"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Email Message</Label>
                  <Textarea
                    value={contentTemplate}
                    onChange={(e) => setContentTemplate(e.target.value)}
                    rows={10}
                    placeholder="Dear {{participant_name}},

Welcome to {{course_name}}! Your course starts on {{course_start_date}}.

Best regards,
The Learning Team"
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{{course_name}}"}, {"{{participant_name}}"}, {"{{course_start_date}}"} to personalize your message
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  {editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.template_name}</CardTitle>
                  <Badge className={getTemplateTypeBadgeColor(template.template_type)}>
                    {getTemplateTypeLabel(template.template_type)}
                  </Badge>
                </div>
                {template.is_default && (
                  <Badge variant="secondary">Default</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Subject: {template.subject_template.length > 50 
                  ? template.subject_template.substring(0, 50) + '...' 
                  : template.subject_template}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {template.variables.slice(0, 3).map((variable) => (
                  <Badge key={variable} variant="outline" className="text-xs">
                    {`{{${variable}}}`}
                  </Badge>
                ))}
                {template.variables.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.variables.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTemplate(template)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {onTemplateSelect && (
                  <Button
                    size="sm"
                    onClick={() => onTemplateSelect(template)}
                  >
                    Select
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Preview: {previewTemplate?.template_name}</DialogTitle>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                {/* Email Header with Logo */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <img 
                    src="/lovable-uploads/d0544c04-760a-4cf9-824c-612e5ef4aeaa.png" 
                    alt="Unboxable" 
                    className="h-8"
                  />
                </div>
                
                {/* Email Subject */}
                <div className="px-6 py-3 bg-blue-50 border-b">
                  <div className="text-xs text-gray-600 mb-1">Subject:</div>
                  <div className="font-semibold text-gray-900">
                    {previewTemplate.subject_template
                      .replace(/\{\{course_name\}\}/g, "Leadership Development Course")
                      .replace(/\{\{participant_name\}\}/g, "John Smith")
                      .replace(/\{\{course_start_date\}\}/g, "March 15, 2024")
                      .replace(/\{\{time_until_start\}\}/g, "2 days")
                      .replace(/\{\{course_duration\}\}/g, "4 weeks")
                      .replace(/\{\{course_location\}\}/g, "Online")
                    }
                  </div>
                </div>
                
                {/* Email Content */}
                <div className="px-6 py-6">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {previewTemplate.content_template
                      .replace(/\{\{course_name\}\}/g, "Leadership Development Course")
                      .replace(/\{\{participant_name\}\}/g, "John Smith")
                      .replace(/\{\{course_start_date\}\}/g, "March 15, 2024")
                      .replace(/\{\{time_until_start\}\}/g, "2 days")
                      .replace(/\{\{course_duration\}\}/g, "4 weeks")
                      .replace(/\{\{course_location\}\}/g, "Online")
                      .replace(/\{\{survey_incomplete\}\}/g, "")
                      .replace(/\{\{survey_link\}\}/g, "https://example.com/survey")
                      // Remove HTML tags for clean preview
                      .replace(/<[^>]*>/g, '')
                      // Handle line breaks properly
                      .replace(/&lt;br&gt;/g, '\n')
                      .replace(/&lt;\/p&gt;&lt;p&gt;/g, '\n\n')
                    }
                  </div>
                  
                  {/* Survey button if template contains survey content */}
                  {previewTemplate.content_template.includes('survey') && (
                    <div className="mt-4">
                      <button className="bg-orange-500 text-white px-6 py-2 rounded font-medium">
                        Complete Survey
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Email Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t text-center">
                  <p className="text-xs text-gray-600">
                    Best regards,<br />
                    The Unboxable Learning Team
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                This is a preview with sample data. Actual emails will use real course information.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};