import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Rubric {
  id: string;
  name: string;
  criteria: any;
  scoring_scale: any;
  created_at: string;
  content_categories: {
    name: string;
    framework_section: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  framework_section: string;
}

export const AssessmentRubricsManager: React.FC = () => {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
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
      const [rubricsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('assessment_rubrics')
          .select(`
            *,
            content_categories (
              name,
              framework_section
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('content_categories')
          .select('*')
          .order('name')
      ]);

      if (rubricsResponse.error) throw rubricsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setRubrics(rubricsResponse.data || []);
      setCategories(categoriesResponse.data || []);
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
        criteria: [{ name: '', description: '', weight: 1 }],
        scoring_scale: { min: 1, max: 6, descriptions: {} }
      });
      setIsEditing(null);
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
      criteria: rubric.criteria || [{ name: '', description: '', weight: 1 }],
      scoring_scale: rubric.scoring_scale || { min: 1, max: 6, descriptions: {} }
    });
    setIsEditing(rubric.id);
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
      criteria: [{ name: '', description: '', weight: 1 }],
      scoring_scale: { min: 1, max: 6, descriptions: {} }
    });
    setIsEditing(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading rubrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Form */}
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
              {isEditing && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Rubrics List */}
      <div className="grid gap-6 md:grid-cols-2">
        {rubrics.map((rubric) => (
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

      {rubrics.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No assessment rubrics created yet
          </p>
        </div>
      )}
    </div>
  );
};