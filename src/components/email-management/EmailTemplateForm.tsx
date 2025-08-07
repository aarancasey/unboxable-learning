import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, FileText } from 'lucide-react';
import { EmailTemplate } from './types';

interface EmailTemplateFormProps {
  editingTemplate: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    templateName: string,
    templateType: string,
    subjectTemplate: string,
    contentTemplate: string,
    htmlTemplate: string
  ) => Promise<boolean>;
}

export const EmailTemplateForm = ({ editingTemplate, isOpen, onClose, onSave }: EmailTemplateFormProps) => {
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState<string>('course_reminder');
  const [subjectTemplate, setSubjectTemplate] = useState('');
  const [contentTemplate, setContentTemplate] = useState('');
  const [htmlTemplate, setHtmlTemplate] = useState('');

  useEffect(() => {
    if (editingTemplate) {
      setTemplateName(editingTemplate.template_name);
      setTemplateType(editingTemplate.template_type);
      setSubjectTemplate(editingTemplate.subject_template);
      setContentTemplate(editingTemplate.content_template);
      setHtmlTemplate(editingTemplate.html_template || '');
    } else {
      resetForm();
    }
  }, [editingTemplate, isOpen]);

  const resetForm = () => {
    setTemplateName('');
    setTemplateType('course_reminder');
    setSubjectTemplate('');
    setContentTemplate('');
    setHtmlTemplate('');
  };

  const handleSave = async () => {
    const success = await onSave(
      templateName,
      templateType,
      subjectTemplate,
      contentTemplate,
      htmlTemplate
    );
    
    if (success) {
      resetForm();
      onClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                  <SelectItem value="survey_completion">Survey Completion</SelectItem>
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
              <Label htmlFor="content">Email Content</Label>
              <Tabs defaultValue="plain" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="plain" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Plain Text
                  </TabsTrigger>
                  <TabsTrigger value="html" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    HTML
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="plain" className="mt-4">
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Plain text version - will be used as fallback for email clients that don't support HTML
                  </p>
                </TabsContent>
                <TabsContent value="html" className="mt-4">
                  <Textarea
                    value={htmlTemplate}
                    onChange={(e) => setHtmlTemplate(e.target.value)}
                    rows={10}
                    placeholder="<div style='font-family: Arial, sans-serif;'>
  <h2>Welcome to {{course_name}}!</h2>
  <p>Dear {{participant_name}},</p>
  <p>Your course starts on <strong>{{course_start_date}}</strong>.</p>
  <p>Best regards,<br/>The Learning Team</p>
</div>"
                    className="resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    HTML version - allows for rich formatting and styling
                  </p>
                </TabsContent>
              </Tabs>
              <p className="text-xs text-muted-foreground">
                Use {"{{learnerName}}"}, {"{{surveyTitle}}"}, {"{{completionDate}}"}, {"{{course_name}}"}, {"{{participant_name}}"}, {"{{course_start_date}}"} to personalise your message
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingTemplate ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};