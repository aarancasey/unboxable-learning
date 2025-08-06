import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye } from 'lucide-react';
import { EmailTemplateCardProps } from './types';

const getTemplateTypeLabel = (type: string) => {
  switch (type) {
    case 'pre_survey': return 'Pre-Survey';
    case 'module_unlock': return 'Module Unlock';
    case 'course_reminder': return 'Course Reminder';
    case 'survey_completion': return 'Survey Completion';
    default: return type;
  }
};

const getTemplateTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'pre_survey': return 'bg-blue-100 text-blue-800';
    case 'module_unlock': return 'bg-green-100 text-green-800';
    case 'course_reminder': return 'bg-orange-100 text-orange-800';
    case 'survey_completion': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const EmailTemplateCard = ({ template, onEdit, onPreview, onSelect }: EmailTemplateCardProps) => {
  return (
    <Card className="relative">
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
              {variable}
            </Badge>
          ))}
          {template.variables.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.variables.length - 3} more variables
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(template)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(template)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          {onSelect && (
            <Button
              size="sm"
              onClick={() => onSelect(template)}
            >
              Select
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};