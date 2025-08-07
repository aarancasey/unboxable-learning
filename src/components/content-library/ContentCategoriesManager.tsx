import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Bot, Star, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { dateHelpers } from '@/lib/dateUtils';
import { CategorySuggestionDialog } from './CategorySuggestionDialog';

interface Category {
  id: string;
  name: string;
  description: string | null;
  framework_section: string | null;
  created_at: string;
  ai_generated?: boolean;
  source_document_id?: string;
  confidence_score?: number;
  suggested_merge_candidates?: string[];
}

export const ContentCategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    framework_section: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading categories",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: "Name required",
        description: "Please enter a category name",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('content_categories')
          .update({
            name: formData.name,
            description: formData.description || null,
            framework_section: formData.framework_section || null
          })
          .eq('id', isEditing);

        if (error) throw error;

        toast({
          title: "Category updated",
          description: "Category has been updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('content_categories')
          .insert({
            name: formData.name,
            description: formData.description || null,
            framework_section: formData.framework_section || null
          });

        if (error) throw error;

        toast({
          title: "Category created",
          description: "New category has been created successfully"
        });
      }

      setFormData({ name: '', description: '', framework_section: '' });
      setIsEditing(null);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Operation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      framework_section: category.framework_section || ''
    });
    setIsEditing(category.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase
        .from('content_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Category deleted",
        description: "Category has been removed"
      });

      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setFormData({ name: '', description: '', framework_section: '' });
    setIsEditing(null);
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

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading categories...</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Category' : 'Create New Category'}
          </CardTitle>
          <CardDescription>
            Organize your content library with categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter category description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="framework_section">Framework Section</Label>
              <Select 
                value={formData.framework_section} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, framework_section: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select framework section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sentiment">Leadership Sentiment</SelectItem>
                  <SelectItem value="purpose">Intent & Purpose</SelectItem>
                  <SelectItem value="agility">Adaptive & Agile</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {isEditing ? 'Update' : 'Create'} Category
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

      {/* Categories List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Existing Categories</CardTitle>
              <CardDescription>
                Manage your content categories
              </CardDescription>
            </div>
            {categories.some(cat => cat.ai_generated) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuggestions(true)}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                AI Suggestions
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{category.name}</h3>
                      {category.ai_generated && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          <Bot className="h-3 w-3 mr-1" />
                          AI Generated
                        </Badge>
                      )}
                      {getFrameworkSectionBadge(category.framework_section)}
                      {category.confidence_score && category.confidence_score >= 0.9 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                          <Star className="h-3 w-3 mr-1" />
                          High Confidence
                        </Badge>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        Created {dateHelpers.shortDate(category.created_at)}
                        {category.ai_generated && category.confidence_score && (
                          <span className="ml-2">
                            • Confidence: {Math.round(category.confidence_score * 100)}%
                          </span>
                        )}
                      </p>
                      {category.suggested_merge_candidates && category.suggested_merge_candidates.length > 0 && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Merge Suggested
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No categories created yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <CategorySuggestionDialog
        isOpen={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        categories={categories}
        onCategoriesUpdate={() => {
          fetchCategories();
          setShowSuggestions(false);
        }}
      />
    </div>
  );
};