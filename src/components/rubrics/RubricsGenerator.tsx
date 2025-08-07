
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RubricTemplateSelector } from './RubricTemplateSelector';
import { RubricEditor } from './RubricEditor';
import { RubricPreview } from './RubricPreview';
import { useRubrics } from '@/hooks/useRubrics';
import { AssessmentRubric, RubricTemplate, RubricGenerationMode } from '@/types/rubrics';
import { ArrowLeft, FileText, Edit, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RubricsGeneratorProps {
  onBack?: () => void;
  initialRubric?: Partial<AssessmentRubric>;
  onRubricCreated?: (rubric: AssessmentRubric) => void;
  suggestedCategory?: string;
}

export const RubricsGenerator = ({ 
  onBack, 
  initialRubric,
  onRubricCreated,
  suggestedCategory
}: RubricsGeneratorProps) => {
  const [mode, setMode] = useState<RubricGenerationMode | null>(null);
  const [currentRubric, setCurrentRubric] = useState<Partial<AssessmentRubric> | null>(initialRubric || null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  
  const { createRubric, updateRubric } = useRubrics();
  const { toast } = useToast();

  const handleTemplateSelect = (template: RubricTemplate) => {
    // Convert template to rubric format
    const rubric: Partial<AssessmentRubric> = {
      name: initialRubric?.name || template.name,
      description: template.description,
      criteria: template.criteria.map(criterion => ({
        id: crypto.randomUUID(),
        ...criterion
      })),
      scoring_scale: {
        id: crypto.randomUUID(),
        ...template.scoring_scale
      },
      content_library_id: initialRubric?.content_library_id,
      category_id: initialRubric?.category_id
    };
    
    setCurrentRubric(rubric);
    setMode('template');
    setActiveTab('edit');
  };

  const handleCreateFromScratch = () => {
    setCurrentRubric(initialRubric || {});
    setMode('manual');
    setActiveTab('edit');
  };

  const handleSaveRubric = async (rubricData: Omit<AssessmentRubric, 'id'>) => {
    try {
      let savedRubric: AssessmentRubric;
      
      if (currentRubric?.id) {
        savedRubric = await updateRubric(currentRubric.id, rubricData);
        toast({
          title: "Success",
          description: "Rubric updated successfully"
        });
      } else {
        savedRubric = await createRubric(rubricData);
        toast({
          title: "Success", 
          description: "Rubric created successfully"
        });
      }
      
      if (onRubricCreated) {
        onRubricCreated(savedRubric);
      }
      
      // Reset to initial state
      setMode(null);
      setCurrentRubric(null);
      if (onBack) onBack();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCancel = () => {
    setMode(null);
    setCurrentRubric(null);
  };

  const isRubricComplete = (rubric: Partial<AssessmentRubric>): rubric is AssessmentRubric => {
    return !!(
      rubric.name &&
      rubric.criteria &&
      rubric.criteria.length > 0 &&
      rubric.scoring_scale &&
      rubric.scoring_scale.levels &&
      rubric.scoring_scale.levels.length > 0
    );
  };

  // Initial template/mode selection
  if (!mode || !currentRubric) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">Create Assessment Rubric</h1>
            <p className="text-gray-600">
              {initialRubric?.name 
                ? `Creating rubric for "${initialRubric.name}"`
                : "Choose a template to get started quickly or build a custom rubric from scratch"
              }
            </p>
          </div>
        </div>

        <RubricTemplateSelector
          onTemplateSelect={handleTemplateSelect}
          onCreateFromScratch={handleCreateFromScratch}
          suggestedCategory={suggestedCategory}
        />
      </div>
    );
  }

  // Rubric editor/preview interface
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'template' ? 'Customise Template' : 'Create Custom Rubric'}
            </h1>
            <p className="text-gray-600">
              {currentRubric.name || 'New Assessment Rubric'}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
        <TabsList>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className="flex items-center gap-2"
            disabled={!isRubricComplete(currentRubric)}
          >
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <RubricEditor
            initialRubric={currentRubric}
            onSave={handleSaveRubric}
            onCancel={handleCancel}
          />
        </TabsContent>

        <TabsContent value="preview">
          {isRubricComplete(currentRubric) ? (
            <RubricPreview rubric={currentRubric} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Complete the rubric to see preview
                </h3>
                <p className="text-gray-600">
                  Add at least one criterion and scoring scale to preview your rubric
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
