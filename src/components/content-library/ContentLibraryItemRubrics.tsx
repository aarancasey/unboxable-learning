
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RubricsGenerator } from '../rubrics/RubricsGenerator';
import { useRubrics } from '@/hooks/useRubrics';
import { AssessmentRubric } from '@/types/rubrics';
import { FileText, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentLibraryItemRubricsProps {
  contentLibraryId: string;
  contentTitle: string;
  contentType: string;
}

export const ContentLibraryItemRubrics: React.FC<ContentLibraryItemRubricsProps> = ({
  contentLibraryId,
  contentTitle,
  contentType
}) => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingRubric, setEditingRubric] = useState<AssessmentRubric | null>(null);
  const { rubrics, loading, deleteRubric } = useRubrics();
  const { toast } = useToast();

  // Filter rubrics for this specific content item
  const itemRubrics = rubrics.filter(r => r.content_library_id === contentLibraryId);

  const handleDeleteRubric = async (id: string) => {
    try {
      await deleteRubric(id);
      toast({
        title: "Success",
        description: "Rubric deleted successfully"
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleRubricCreated = () => {
    setShowGenerator(false);
    setEditingRubric(null);
  };

  // Get suggested template category based on content type
  const getSuggestedCategory = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'leadership': 'Leadership',
      'management': 'Management',
      'communication': 'Communication',
      'teamwork': 'Teamwork',
      'pdf': 'Leadership', // Default for PDFs
      'document': 'Leadership'
    };
    return typeMap[type.toLowerCase()] || 'Leadership';
  };

  if (showGenerator) {
    return (
      <RubricsGenerator
        onBack={() => setShowGenerator(false)}
        initialRubric={editingRubric ? { 
          ...editingRubric, 
          content_library_id: contentLibraryId 
        } : { 
          content_library_id: contentLibraryId,
          name: `${contentTitle} Assessment Rubric`
        }}
        onRubricCreated={handleRubricCreated}
        suggestedCategory={getSuggestedCategory(contentType)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assessment Rubrics</h3>
          <p className="text-sm text-gray-600">
            Rubrics for "{contentTitle}"
          </p>
        </div>
        <Button onClick={() => setShowGenerator(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Rubric
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-unboxable-navy mx-auto"></div>
        </div>
      ) : itemRubrics.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="w-8 h-8 mx-auto text-gray-400 mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">
              No rubrics created yet
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Create assessment rubrics based on this content using our templates
            </p>
            <Button onClick={() => setShowGenerator(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create First Rubric
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {itemRubrics.map((rubric) => (
            <Card key={rubric.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{rubric.name}</h4>
                  {rubric.description && (
                    <p className="text-sm text-gray-600 mt-1">{rubric.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{rubric.criteria.length} criteria</span>
                    <span>{rubric.scoring_scale.levels.length} levels</span>
                    <span>Max {rubric.scoring_scale.maxPoints} points</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingRubric(rubric);
                      setShowGenerator(true);
                    }}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRubric(rubric.id!)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
