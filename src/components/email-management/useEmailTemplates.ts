import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EmailTemplate } from './types';

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const { toast } = useToast();

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

  useEffect(() => {
    loadTemplates();
  }, []);

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      variables.add(match[1].trim());
    }
    
    return Array.from(variables);
  };

  const saveTemplate = async (
    templateName: string,
    templateType: string,
    subjectTemplate: string,
    contentTemplate: string,
    htmlTemplate: string,
    editingTemplate: EmailTemplate | null
  ) => {
    const templateData = {
      template_name: templateName,
      template_type: templateType,
      subject_template: subjectTemplate,
      content_template: contentTemplate,
      html_template: htmlTemplate,
      variables: extractVariables(subjectTemplate + ' ' + contentTemplate + ' ' + htmlTemplate),
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
        return false;
      } else {
        toast({
          title: "Template updated",
          description: "Email template has been updated successfully.",
        });
        loadTemplates();
        return true;
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
        return false;
      } else {
        toast({
          title: "Template created",
          description: "New email template has been created successfully.",
        });
        loadTemplates();
        return true;
      }
    }
  };

  return {
    templates,
    loadTemplates,
    saveTemplate,
    extractVariables
  };
};