import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Bold, 
  Italic, 
  List, 
  Plus, 
  Trash2,
  RotateCcw,
  AlignLeft,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentEditorProps {
  content: {
    currentLeadershipStyle?: string;
    confidenceRating?: string;
    strongestArea?: string;
    focusArea?: string;
    leadershipAspirations?: string[];
    topStrengths?: string[];
    developmentAreas?: string[];
    overallAssessment?: string;
  };
  onChange: (content: any) => void;
}

export const ContentEditor = ({ content, onChange }: ContentEditorProps) => {
  const { toast } = useToast();
  const [localContent, setLocalContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState('leadership');

  useEffect(() => {
    setLocalContent(content);
    setHasChanges(false);
  }, [content]);

  const handleInputChange = (field: string, value: string | string[]) => {
    const updatedContent = { ...localContent, [field]: value };
    setLocalContent(updatedContent);
    setHasChanges(true);
    onChange(updatedContent);
  };

  const handleArrayAdd = (field: string) => {
    const currentArray = localContent[field as keyof typeof localContent] as string[] || [];
    const updatedArray = [...currentArray, ''];
    handleInputChange(field, updatedArray);
  };

  const handleArrayUpdate = (field: string, index: number, value: string) => {
    const currentArray = localContent[field as keyof typeof localContent] as string[] || [];
    const updatedArray = [...currentArray];
    updatedArray[index] = value;
    handleInputChange(field, updatedArray);
  };

  const handleArrayRemove = (field: string, index: number) => {
    const currentArray = localContent[field as keyof typeof localContent] as string[] || [];
    const updatedArray = currentArray.filter((_, i) => i !== index);
    handleInputChange(field, updatedArray);
  };

  const handleReset = () => {
    setLocalContent(content);
    setHasChanges(false);
    onChange(content);
    toast({
      title: "Changes Reset",
      description: "Content has been reset to original values.",
    });
  };

  const contentSections = [
    {
      id: 'leadership',
      title: 'Leadership Profile',
      description: 'Core leadership characteristics and current state'
    },
    {
      id: 'strengths',
      title: 'Strengths & Development',
      description: 'Key strengths and areas for development'
    },
    {
      id: 'assessment',
      title: 'Overall Assessment',
      description: 'Summary analysis and recommendations'
    }
  ];

  const renderArrayEditor = (
    title: string, 
    field: string, 
    placeholder: string, 
    description?: string
  ) => {
    const items = localContent[field as keyof typeof localContent] as string[] || [];
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={item}
                onChange={(e) => handleArrayUpdate(field, index, e.target.value)}
                placeholder={placeholder}
                className="flex-1 min-h-[40px] resize-none"
                rows={1}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleArrayRemove(field, index)}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={() => handleArrayAdd(field)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {title.toLowerCase().includes('strength') ? 'Strength' : 
                 title.toLowerCase().includes('development') ? 'Development Area' : 'Item'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Content Editor</h3>
        <p className="text-sm text-muted-foreground">
          Edit the text content and descriptions that appear in the AI assessment summary.
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 border-b">
        {contentSections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "ghost"}
            onClick={() => setActiveSection(section.id)}
            className="rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            {section.title}
          </Button>
        ))}
      </div>

      {/* Content Sections */}
      {activeSection === 'leadership' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Leadership Style</CardTitle>
              <p className="text-sm text-muted-foreground">
                Describes the learner's current leadership approach and state
              </p>
            </CardHeader>
            <CardContent>
              <Input
                value={localContent.currentLeadershipStyle || ''}
                onChange={(e) => handleInputChange('currentLeadershipStyle', e.target.value)}
                placeholder="e.g., Managing, but close to overload"
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Confidence Rating</CardTitle>
              <p className="text-sm text-muted-foreground">
                Assessment of the learner's confidence level
              </p>
            </CardHeader>
            <CardContent>
              <Input
                value={localContent.confidenceRating || ''}
                onChange={(e) => handleInputChange('confidenceRating', e.target.value)}
                placeholder="e.g., Developing Confidence (2.5–3.4)"
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Strongest Area</CardTitle>
              <p className="text-sm text-muted-foreground">
                The learner's primary strength or capability
              </p>
            </CardHeader>
            <CardContent>
              <Input
                value={localContent.strongestArea || ''}
                onChange={(e) => handleInputChange('strongestArea', e.target.value)}
                placeholder="e.g., Motivate and align your team"
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Primary Focus Area</CardTitle>
              <p className="text-sm text-muted-foreground">
                The main area that needs development attention
              </p>
            </CardHeader>
            <CardContent>
              <Input
                value={localContent.focusArea || ''}
                onChange={(e) => handleInputChange('focusArea', e.target.value)}
                placeholder="e.g., Lead through complexity and ambiguity"
                className="w-full"
              />
            </CardContent>
          </Card>

          {renderArrayEditor(
            'Leadership Aspirations',
            'leadershipAspirations',
            'Enter a leadership aspiration...',
            'What the learner aspires to become as a leader'
          )}
        </div>
      )}

      {activeSection === 'strengths' && (
        <div className="space-y-6">
          {renderArrayEditor(
            'Top Strengths',
            'topStrengths',
            'Enter a key strength...',
            'The learner\'s primary strengths and capabilities'
          )}

          {renderArrayEditor(
            'Development Areas',
            'developmentAreas',
            'Enter a development area...',
            'Areas where the learner can improve and grow'
          )}
        </div>
      )}

      {activeSection === 'assessment' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Overall Assessment
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Comprehensive analysis and recommendations for the learner
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={localContent.overallAssessment || ''}
                onChange={(e) => handleInputChange('overallAssessment', e.target.value)}
                placeholder="Write the overall assessment summary and recommendations..."
                className="w-full min-h-[120px] resize-none"
                rows={6}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  This will appear as the main assessment conclusion
                </p>
                <Badge variant="outline" className="text-xs">
                  {(localContent.overallAssessment || '').length} characters
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!hasChanges}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Changes
        </Button>
        
        {hasChanges && (
          <Badge variant="default" className="px-3 py-1">
            Unsaved changes
          </Badge>
        )}
      </div>

      {/* Content Guidelines */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-amber-900">
                Content Guidelines
              </h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Keep descriptions concise and professional</li>
                <li>• Focus on actionable insights and recommendations</li>
                <li>• Use positive, constructive language for development areas</li>
                <li>• Ensure consistency with the rubric scores and ratings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};