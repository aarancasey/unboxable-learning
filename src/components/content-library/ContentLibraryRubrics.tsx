
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RubricsGenerator } from '../rubrics/RubricsGenerator';
import { useRubrics } from '@/hooks/useRubrics';
import { AssessmentRubric } from '@/types/rubrics';
import { FileText, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentLibraryRubricsProps {
  contentLibraryId?: string;
  onRubricGenerated?: (rubric: AssessmentRubric) => void;
  showAllRubrics?: boolean; // New prop to show all rubrics, not just content-linked ones
}

export const ContentLibraryRubrics: React.FC<ContentLibraryRubricsProps> = ({
  contentLibraryId,
  onRubricGenerated,
  showAllRubrics = false
}) => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingRubric, setEditingRubric] = useState<AssessmentRubric | null>(null);
  const { rubrics, loading, deleteRubric } = useRubrics();
  const { toast } = useToast();

  // Filter rubrics based on props
  const filteredRubrics = showAllRubrics 
    ? rubrics // Show all rubrics when consolidating legacy system
    : contentLibraryId 
      ? rubrics.filter(r => r.content_library_id === contentLibraryId)
      : rubrics;

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

  const handleRubricCreated = (rubric: AssessmentRubric) => {
    setShowGenerator(false);
    setEditingRubric(null);
    if (onRubricGenerated) {
      onRubricGenerated(rubric);
    }
  };

  if (showGenerator) {
    return (
      <RubricsGenerator
        onBack={() => setShowGenerator(false)}
        initialRubric={editingRubric ? { 
          ...editingRubric, 
          content_library_id: contentLibraryId 
        } : { content_library_id: contentLibraryId }}
        onRubricCreated={handleRubricCreated}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Assessment Rubrics</h2>
          <p className="text-sm text-gray-600">
            {showAllRubrics
              ? "Manage all assessment rubrics including legacy rubrics and content-linked ones"
              : contentLibraryId 
                ? "Generate and manage rubrics for this content"
                : "Create assessment rubrics from templates or build custom ones"
            }
          </p>
          {showAllRubrics && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Consolidated View:</strong> This interface now manages all rubrics in one place. 
                Legacy rubrics are marked with a special indicator.
              </p>
            </div>
          )}
        </div>
        <Button onClick={() => setShowGenerator(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Rubric
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-unboxable-navy mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading rubrics...</p>
        </div>
      ) : filteredRubrics.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No rubrics found
            </h3>
            <p className="text-gray-600 mb-4">
              {contentLibraryId 
                ? "Create your first rubric for this content using our templates"
                : "Get started by creating your first assessment rubric"
              }
            </p>
            <Button onClick={() => setShowGenerator(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Rubric
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRubrics.map((rubric) => {
            const isLegacyRubric = !rubric.content_library_id;
            return (
              <Card key={rubric.id} className={`hover:shadow-lg transition-shadow ${isLegacyRubric ? 'border-l-4 border-l-amber-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{rubric.name}</CardTitle>
                        {isLegacyRubric && (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                            Legacy
                          </Badge>
                        )}
                      </div>
                      {rubric.description && (
                        <p className="text-sm text-gray-600 mt-1">{rubric.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      Criteria ({rubric.criteria.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {rubric.criteria.slice(0, 3).map((criterion, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {criterion.name}
                        </Badge>
                      ))}
                      {rubric.criteria.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{rubric.criteria.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Scoring Scale</h4>
                    <p className="text-xs text-gray-500">
                      {rubric.scoring_scale?.levels?.length || 0} levels • Max {rubric.scoring_scale?.maxPoints || 0} points
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingRubric(rubric);
                      setShowGenerator(true);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRubric(rubric.id!)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      )}
    </div>
  );
};
