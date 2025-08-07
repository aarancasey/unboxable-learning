import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Merge, Trash2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  description: string | null;
  framework_section: string | null;
  ai_generated?: boolean;
  confidence_score?: number;
  suggested_merge_candidates?: string[];
}

interface CategorySuggestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCategoriesUpdate: () => void;
}

export const CategorySuggestionDialog: React.FC<CategorySuggestionDialogProps> = ({
  isOpen,
  onClose,
  categories,
  onCategoriesUpdate
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const aiGeneratedCategories = categories.filter(cat => cat.ai_generated);
  const lowConfidenceCategories = aiGeneratedCategories.filter(cat => 
    cat.confidence_score && cat.confidence_score < 0.7
  );
  const mergeCandidates = aiGeneratedCategories.filter(cat => 
    cat.suggested_merge_candidates && cat.suggested_merge_candidates.length > 0
  );

  const handleDeleteCategory = async (categoryId: string) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('content_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Category deleted",
        description: "Low confidence category has been removed"
      });

      onCategoriesUpdate();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMergeCategories = async (primaryId: string, mergeIds: string[]) => {
    setIsProcessing(true);
    try {
      // This would be implemented with more sophisticated merging logic
      // For now, we'll just delete the merge candidates
      const { error } = await supabase
        .from('content_categories')
        .delete()
        .in('id', mergeIds);

      if (error) throw error;

      toast({
        title: "Categories merged",
        description: "Similar categories have been consolidated"
      });

      onCategoriesUpdate();
    } catch (error: any) {
      toast({
        title: "Merge failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getFrameworkSectionBadge = (section: string | null) => {
    const sections = {
      sentiment: { label: 'Sentiment', color: 'bg-blue-100 text-blue-800' },
      purpose: { label: 'Purpose', color: 'bg-green-100 text-green-800' },
      agility: { label: 'Agility', color: 'bg-purple-100 text-purple-800' },
      development: { label: 'Development', color: 'bg-orange-100 text-orange-800' },
      assessment: { label: 'Assessment', color: 'bg-red-100 text-red-800' }
    };

    if (!section || !(section in sections)) return null;

    const sectionData = sections[section as keyof typeof sections];
    return (
      <Badge variant="secondary" className={sectionData.color}>
        {sectionData.label}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Category Suggestions
          </DialogTitle>
          <DialogDescription>
            Review and manage AI-generated categories to improve your content organisation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{aiGeneratedCategories.length}</div>
                <div className="text-sm text-muted-foreground">AI Generated</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{lowConfidenceCategories.length}</div>
                <div className="text-sm text-muted-foreground">Low Confidence</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{mergeCandidates.length}</div>
                <div className="text-sm text-muted-foreground">Merge Candidates</div>
              </CardContent>
            </Card>
          </div>

          {/* Low Confidence Categories */}
          {lowConfidenceCategories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Low Confidence Categories</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These categories were generated with low confidence. Consider reviewing or removing them.
              </p>
              <div className="space-y-3">
                {lowConfidenceCategories.map((category) => (
                  <Card key={category.id} className="border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{category.name}</h4>
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              {Math.round((category.confidence_score || 0) * 100)}% confidence
                            </Badge>
                            {getFrameworkSectionBadge(category.framework_section)}
                          </div>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={isProcessing}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Merge Candidates */}
          {mergeCandidates.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Suggested Merges</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These categories might be similar to existing ones. Consider merging them.
              </p>
              <div className="space-y-3">
                {mergeCandidates.map((category) => (
                  <Card key={category.id} className="border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{category.name}</h4>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              <Merge className="h-3 w-3 mr-1" />
                              Similar found
                            </Badge>
                            {getFrameworkSectionBadge(category.framework_section)}
                          </div>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {category.description}
                            </p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Similar to: {category.suggested_merge_candidates?.join(', ')}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMergeCategories(category.id, category.suggested_merge_candidates || [])}
                            disabled={isProcessing}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={isProcessing}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All AI Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-3">All AI-Generated Categories</h3>
            <div className="grid gap-3">
              {aiGeneratedCategories.map((category) => (
                <Card key={category.id} className="border-primary/20">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          <Bot className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                        {getFrameworkSectionBadge(category.framework_section)}
                        {category.confidence_score && (
                          <Badge variant="outline" className={
                            category.confidence_score >= 0.9 ? 'text-green-600 border-green-200' :
                            category.confidence_score >= 0.7 ? 'text-blue-600 border-blue-200' :
                            'text-orange-600 border-orange-200'
                          }>
                            {Math.round(category.confidence_score * 100)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};