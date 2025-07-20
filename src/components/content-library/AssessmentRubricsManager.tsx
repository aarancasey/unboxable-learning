import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, X, ChevronDown, ChevronRight, FileText, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RubricsTestButton } from './RubricsTestButton';

interface Rubric {
  id: string;
  name: string;
  criteria: any;
  scoring_scale: any;
  created_at: string;
  content_library_id: string | null;
  content_categories: {
    name: string;
    framework_section: string;
  } | null;
  content_library: {
    title: string;
    original_filename: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  framework_section: string;
}

interface ContentLibraryItem {
  id: string;
  title: string;
  original_filename: string;
}

export const AssessmentRubricsManager: React.FC = () => {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [contentItems, setContentItems] = useState<ContentLibraryItem[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedRubrics, setExpandedRubrics] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    content_library_id: '',
    criteria: [{ name: '', description: '', weight: 1 }],
    scoring_scale: { min: 1, max: 6, descriptions: {} }
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching rubrics data...');
      const [rubricsResponse, categoriesResponse, contentResponse] = await Promise.all([
        supabase
          .from('assessment_rubrics')
          .select(`
            *,
            content_categories (
              name,
              framework_section
            ),
            content_library (
              title,
              original_filename
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('content_categories')
          .select('*')
          .order('name'),
        supabase
          .from('content_library')
          .select('id, title, original_filename')
          .order('title')
      ]);

      console.log('Rubrics response:', rubricsResponse);
      console.log('Categories response:', categoriesResponse);
      console.log('Content response:', contentResponse);

      if (rubricsResponse.error) {
        console.error('Rubrics error:', rubricsResponse.error);
        throw rubricsResponse.error;
      }
      if (categoriesResponse.error) {
        console.error('Categories error:', categoriesResponse.error);
        throw categoriesResponse.error;
      }
      if (contentResponse.error) {
        console.error('Content error:', contentResponse.error);
        throw contentResponse.error;
      }

      console.log('Setting rubrics data:', rubricsResponse.data);
      setRubrics(rubricsResponse.data || []);
      setCategories(categoriesResponse.data || []);
      setContentItems(contentResponse.data || []);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCriterion = () => {
    setFormData(prev => ({
      ...prev,
      criteria: [...prev.criteria, { name: '', description: '', weight: 1 }]
    }));
  };

  const removeCriterion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index)
    }));
  };

  const updateCriterion = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.map((criterion, i) => 
        i === index ? { ...criterion, [field]: value } : criterion
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category_id || formData.criteria.length === 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate criteria
    const invalidCriteria = formData.criteria.some(c => !c.name || !c.description);
    if (invalidCriteria) {
      toast({
        title: "Invalid criteria",
        description: "Please fill in all criterion names and descriptions",
        variant: "destructive"
      });
      return;
    }

    try {
      const rubricData = {
        name: formData.name,
        category_id: formData.category_id,
        content_library_id: formData.content_library_id || null,
        criteria: formData.criteria,
        scoring_scale: formData.scoring_scale
      };

      if (isEditing) {
        const { error } = await supabase
          .from('assessment_rubrics')
          .update(rubricData)
          .eq('id', isEditing);

        if (error) throw error;

        toast({
          title: "Rubric updated",
          description: "Assessment rubric has been updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('assessment_rubrics')
          .insert(rubricData);

        if (error) throw error;

        toast({
          title: "Rubric created",
          description: "New assessment rubric has been created successfully"
        });
      }

      setFormData({
        name: '',
        category_id: '',
        content_library_id: '',
        criteria: [{ name: '', description: '', weight: 1 }],
        scoring_scale: { min: 1, max: 6, descriptions: {} }
      });
      setIsEditing(null);
      setShowCreateForm(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (rubric: Rubric) => {
    setFormData({
      name: rubric.name,
      category_id: rubric.content_categories ? 
        categories.find(c => c.name === rubric.content_categories?.name)?.id || '' : '',
      content_library_id: rubric.content_library_id || '',
      criteria: rubric.criteria || [{ name: '', description: '', weight: 1 }],
      scoring_scale: rubric.scoring_scale || { min: 1, max: 6, descriptions: {} }
    });
    setIsEditing(rubric.id);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rubric?')) return;

    try {
      const { error } = await supabase
        .from('assessment_rubrics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Rubric deleted",
        description: "Assessment rubric has been removed"
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: '',
      category_id: '',
      content_library_id: '',
      criteria: [{ name: '', description: '', weight: 1 }],
      scoring_scale: { min: 1, max: 6, descriptions: {} }
    });
    setIsEditing(null);
    setShowCreateForm(false);
  };

  const toggleRubricExpansion = (rubricId: string) => {
    setExpandedRubrics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rubricId)) {
        newSet.delete(rubricId);
      } else {
        newSet.add(rubricId);
      }
      return newSet;
    });
  };

  const renderScoringScale = (scale: any) => {
    if (typeof scale === 'object' && scale !== null) {
      return Object.entries(scale)
        .filter(([key]) => !['min', 'max'].includes(key))
        .map(([level, description]) => (
          <div key={level} className="flex gap-2 text-sm">
            <Badge variant="outline" className="min-w-8 text-center">
              {level}
            </Badge>
            <span className="text-muted-foreground">{String(description)}</span>
          </div>
        ));
    }
    return null;
  };

  const renderCriteria = (criteria: any) => {
    if (Array.isArray(criteria)) {
      return criteria.map((criterion, index) => (
        <div key={index} className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium">{criterion.name || `Criterion ${index + 1}`}</h5>
            {criterion.weight && (
              <Badge variant="secondary" className="text-xs">
                Weight: {criterion.weight}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {criterion.description || 'No description provided'}
          </p>
          {criterion.indicators && Array.isArray(criterion.indicators) && (
            <div className="mt-2">
              <span className="text-xs font-medium">Indicators:</span>
              <ul className="text-xs text-muted-foreground mt-1 ml-4 list-disc">
                {criterion.indicators.map((indicator: string, i: number) => (
                  <li key={i}>{indicator}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ));
    }
    return <p className="text-sm text-muted-foreground">No criteria defined</p>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading rubrics...</div>;
  }

  // Separate auto-generated and manually created rubrics
  const autoGeneratedRubrics = rubrics.filter(r => r.content_library_id);
  const manualRubrics = rubrics.filter(r => !r.content_library_id);

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assessment Rubrics</h2>
          <p className="text-muted-foreground">
            Review auto-generated rubrics and manage custom assessment criteria
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Custom Rubric
        </Button>
      </div>

      {/* Test Button for Troubleshooting */}
      {autoGeneratedRubrics.length === 0 && (
        <RubricsTestButton />
      )}

      {/* Auto-Generated Rubrics Section */}
      {autoGeneratedRubrics.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Auto-Generated Rubrics</h3>
            <Badge variant="secondary">{autoGeneratedRubrics.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            These rubrics were automatically created from your uploaded documents using AI analysis.
          </p>
          
          <div className="grid gap-4">
            {autoGeneratedRubrics.map((rubric) => (
              <Card key={rubric.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{rubric.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          <Bot className="mr-1 h-3 w-3" />
                          AI Generated
                        </Badge>
                      </div>
                      <CardDescription className="space-y-1">
                        {rubric.content_categories?.name && (
                          <div className="flex items-center gap-2">
                            <span>Category:</span>
                            <Badge variant="secondary" className="text-xs">
                              {rubric.content_categories.name}
                            </Badge>
                          </div>
                        )}
                        {rubric.content_library && (
                          <div className="flex items-center gap-2 text-xs">
                            <FileText className="h-3 w-3" />
                            <span>From: {rubric.content_library.title}</span>
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRubricExpansion(rubric.id)}
                      >
                        {expandedRubrics.has(rubric.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(rubric)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rubric.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <Collapsible
                  open={expandedRubrics.has(rubric.id)}
                  onOpenChange={() => toggleRubricExpansion(rubric.id)}
                >
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Scoring Scale */}
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            Scoring Scale
                            <Badge variant="outline" className="text-xs">
                              {rubric.scoring_scale?.min || 1} - {rubric.scoring_scale?.max || 6}
                            </Badge>
                          </h4>
                          <div className="space-y-1">
                            {renderScoringScale(rubric.scoring_scale)}
                          </div>
                        </div>

                        <Separator />

                        {/* Assessment Criteria */}
                        <div>
                          <h4 className="font-medium mb-3">
                            Assessment Criteria ({Array.isArray(rubric.criteria) ? rubric.criteria.length : 0})
                          </h4>
                          <div className="space-y-3">
                            {renderCriteria(rubric.criteria)}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Created: {new Date(rubric.created_at).toLocaleDateString()} at {new Date(rubric.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Manual Rubrics Section */}
      {manualRubrics.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-secondary" />
            <h3 className="text-lg font-semibold">Custom Rubrics</h3>
            <Badge variant="secondary">{manualRubrics.length}</Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {manualRubrics.map((rubric) => (
              <Card key={rubric.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{rubric.name}</CardTitle>
                      <CardDescription>
                        {rubric.content_categories?.name}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(rubric)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rubric.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Scoring Scale</h4>
                      <Badge variant="outline">
                        {rubric.scoring_scale?.min} - {rubric.scoring_scale?.max}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Criteria ({rubric.criteria?.length || 0})</h4>
                      <div className="space-y-2">
                        {rubric.criteria?.slice(0, 3).map((criterion: any, index: number) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{criterion.name}</span>
                            <span className="text-muted-foreground ml-2">(Weight: {criterion.weight})</span>
                          </div>
                        ))}
                        {rubric.criteria?.length > 3 && (
                          <div className="text-sm text-muted-foreground">
                            +{rubric.criteria.length - 3} more criteria
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Created {new Date(rubric.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {rubrics.length === 0 && (
        <div className="text-center py-12">
          <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No Assessment Rubrics Yet</p>
          <p className="text-muted-foreground mb-4">
            Upload documents with auto-generation enabled or create custom rubrics
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Rubric
          </Button>
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Edit Assessment Rubric' : 'Create New Assessment Rubric'}
            </CardTitle>
            <CardDescription>
              Define assessment criteria and scoring methodology for survey analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Rubric Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter rubric name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category_id">Category *</Label>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="content_library_id">Associated Document (Optional)</Label>
                <Select 
                  value={formData.content_library_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, content_library_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Link to a document (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scoring Scale */}
              <div>
                <Label>Scoring Scale</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="min_score">Minimum Score</Label>
                    <Input
                      id="min_score"
                      type="number"
                      value={formData.scoring_scale.min}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        scoring_scale: { ...prev.scoring_scale, min: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_score">Maximum Score</Label>
                    <Input
                      id="max_score"
                      type="number"
                      value={formData.scoring_scale.max}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        scoring_scale: { ...prev.scoring_scale, max: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Assessment Criteria */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Assessment Criteria</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Criterion
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.criteria.map((criterion, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Criterion {index + 1}</h4>
                        {formData.criteria.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCriterion(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Name *</Label>
                          <Input
                            value={criterion.name}
                            onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                            placeholder="Criterion name"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Description *</Label>
                          <Textarea
                            value={criterion.description}
                            onChange={(e) => updateCriterion(index, 'description', e.target.value)}
                            placeholder="Criterion description"
                            rows={3}
                            required
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <Label>Weight</Label>
                        <Input
                          type="number"
                          value={criterion.weight}
                          onChange={(e) => updateCriterion(index, 'weight', parseInt(e.target.value))}
                          min="1"
                          max="10"
                          className="w-24"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {isEditing ? 'Update' : 'Create'} Rubric
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};