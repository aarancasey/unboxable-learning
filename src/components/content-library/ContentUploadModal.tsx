import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X, FileText, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { AITextProcessor } from '@/utils/AITextProcessor';

interface ContentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContentUploadModal: React.FC<ContentUploadModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content_type: '',
    category_id: '',
    extracted_content: '',
    tags: [] as string[],
  });
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoGenerateRubrics, setAutoGenerateRubrics] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  React.useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, fetching categories...');
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    // Check authentication status
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    console.log('User is authenticated:', !!user);
    
    const { data, error } = await supabase
      .from('content_categories')
      .select('*')
      .order('name');
    
    console.log('Categories response:', { data, error });
    console.log('Categories count:', data?.length || 0);
    
    if (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error loading categories",
        description: error.message,
        variant: "destructive"
      });
    } else if (data) {
      console.log('Setting categories:', data);
      setCategories(data);
    } else {
      console.log('No categories data received');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.includes('pdf') || selectedFile.type.includes('word') || selectedFile.name.endsWith('.docx')) {
        setFile(selectedFile);
        setFormData(prev => ({ ...prev, title: selectedFile.name.split('.')[0] }));
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF or Word documents only",
          variant: "destructive"
        });
      }
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(currentTag.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, currentTag.trim()]
        }));
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const analyzeDocumentContent = async (contentLibraryId?: string) => {
    if (!formData.extracted_content) {
      toast({
        title: "No content to analyze",
        description: "Please add content text before generating rubrics",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Try edge function first
      const { data, error } = await supabase.functions.invoke('analyze-document-content', {
        body: {
          extractedContent: formData.extracted_content,
          documentTitle: formData.title || 'Leadership Assessment Document',
          contentLibraryId: contentLibraryId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "AI Analysis Complete",
          description: data.message,
          duration: 5000
        });
        
        // Refresh categories list
        await fetchCategories();
        return;
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Edge function analysis failed, trying browser fallback:', error);
      
      // Fallback to browser-based analysis
      try {
        console.log('Starting browser-based AI analysis...');
        const processedText = await AITextProcessor.processDocument(
          formData.extracted_content,
          formData.title || 'Leadership Assessment Document'
        );

        // Create basic categories from extracted concepts
        const createdCategories = [];
        const uniqueTypes = [...new Set(processedText.concepts.map(c => c.type))];
        
        for (const type of uniqueTypes) {
          const categoryName = type.charAt(0).toUpperCase() + type.slice(1) + 's';
          const relatedConcepts = processedText.concepts.filter(c => c.type === type);
          
          try {
            // Check if category already exists
            const { data: existingCategory } = await supabase
              .from('content_categories')
              .select('*')
              .eq('name', categoryName)
              .single();

            if (existingCategory) {
              createdCategories.push(existingCategory);
            } else {
              // Create new category
              const { data: categoryData, error: categoryError } = await supabase
                .from('content_categories')
                .insert({
                  name: categoryName,
                  description: `${categoryName} extracted from ${formData.title}`,
                  framework_section: type === 'process' ? 'agility' : 'development',
                  ai_generated: true,
                  source_document_id: contentLibraryId || null,
                  confidence_score: Math.max(...relatedConcepts.map(c => c.confidence))
                })
                .select()
                .single();

              if (!categoryError && categoryData) {
                createdCategories.push(categoryData);
              }
            }
          } catch (error) {
            console.error(`Error processing category ${categoryName}:`, error);
          }
        }

        // Create basic assessment rubrics from high-confidence concepts
        const highConfidenceConcepts = processedText.concepts
          .filter(c => c.confidence > 0.7)
          .slice(0, 6); // Limit to 6 rubrics

        const createdRubrics = [];
        for (const concept of highConfidenceConcepts) {
          const matchedCategory = createdCategories.find(cat => 
            cat.name.toLowerCase().includes(concept.type)
          );

          const { data: rubricData, error: rubricError } = await supabase
            .from('assessment_rubrics')
            .insert({
              name: concept.title,
              criteria: {
                description: concept.content,
                indicators: [concept.title],
                development_areas: [`${concept.type} development`]
              },
              scoring_scale: {
                "1": "Needs significant development",
                "2": "Below expectations", 
                "3": "Meets expectations",
                "4": "Exceeds expectations",
                "5": "Outstanding performance"
              },
              category_id: matchedCategory?.id || null
            })
            .select()
            .single();

          if (!rubricError && rubricData) {
            createdRubrics.push(rubricData);
          }
        }

        toast({
          title: "Browser AI Analysis Complete",
          description: `Created ${createdCategories.length} categories and ${createdRubrics.length} rubrics using browser-based AI`,
          duration: 5000
        });
        
        // Refresh categories list
        await fetchCategories();
        
      } catch (fallbackError: any) {
        console.error('Browser fallback analysis also failed:', fallbackError);
        toast({
          title: "Analysis failed",
          description: "Both cloud and browser AI analysis failed. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content_type || !formData.extracted_content) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Check authentication before proceeding
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload content",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      let fileUrl = null;

      // Upload file if provided
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('content-library')
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        fileUrl = uploadData.path;
      }

      // Save to content library
      const { data: contentData, error } = await supabase
        .from('content_library')
        .insert({
          title: formData.title,
          content_type: formData.content_type,
          category_id: formData.category_id || null,
          extracted_content: formData.extracted_content,
          tags: formData.tags,
          file_url: fileUrl,
          original_filename: file?.name
        })
        .select()
        .single();

      if (error) throw error;

      // Extract knowledge from the document content
      if (formData.extracted_content) {
        try {
          console.log('Processing document for knowledge extraction...');
          const { error: knowledgeError } = await supabase.functions.invoke('process-document-knowledge', {
            body: {
              contentLibraryId: contentData.id,
              extractedContent: formData.extracted_content,
              title: formData.title
            }
          });
          
          if (knowledgeError) {
            console.error('Failed to extract knowledge:', knowledgeError);
          } else {
            console.log('Knowledge extraction completed successfully');
          }
        } catch (knowledgeError) {
          console.error('Error calling knowledge extraction:', knowledgeError);
        }
      }

      // If auto-generate is enabled, analyze content for rubrics
      if (autoGenerateRubrics && !isAnalyzing) {
        await analyzeDocumentContent(contentData.id);
      }

      const successMessage = autoGenerateRubrics 
        ? "Content uploaded, AI learning completed, and assessment rubrics generated successfully"
        : "Content uploaded and processed by AI learning system";

      toast({
        title: "Upload completed",
        description: successMessage
      });

      // Reset form
      setFormData({
        title: '',
        content_type: '',
        category_id: '',
        extracted_content: '',
        tags: []
      });
      setFile(null);
      setAutoGenerateRubrics(false);
      onClose();

    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Content to Library</DialogTitle>
          <DialogDescription>
            Add PDF or Word documents to enhance survey report generation
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Document File (PDF/Word)</Label>
              <div className="mt-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {file && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-muted rounded">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter content title"
                required
              />
            </div>

            <div>
              <Label htmlFor="content_type">Content Type *</Label>
              <Select value={formData.content_type} onValueChange={(value) => setFormData(prev => ({ ...prev, content_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="framework">Framework</SelectItem>
                  <SelectItem value="rubric">Assessment Rubric</SelectItem>
                  <SelectItem value="guide">Development Guide</SelectItem>
                  <SelectItem value="assessment">Assessment Criteria</SelectItem>
                  <SelectItem value="methodology">Methodology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category_id">Category (optional)</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
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

            <div>
              <Label htmlFor="extracted_content">Content Text *</Label>
              <Textarea
                id="extracted_content"
                value={formData.extracted_content}
                onChange={(e) => setFormData(prev => ({ ...prev, extracted_content: e.target.value }))}
                placeholder="Paste or type the content that will be used for AI analysis..."
                rows={8}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                This is the text content that will be used by AI for report generation
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
                <Checkbox
                  id="auto-generate"
                  checked={autoGenerateRubrics}
                  onCheckedChange={(checked) => setAutoGenerateRubrics(checked as boolean)}
                />
                <div className="space-y-1 leading-none">
                  <Label 
                    htmlFor="auto-generate" 
                    className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    Auto-generate Assessment Rubrics & Categories
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    AI will analyze the document content and automatically create relevant categories and assessment rubrics for leadership evaluation
                  </p>
                </div>
              </div>

              {autoGenerateRubrics && formData.extracted_content && (
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => analyzeDocumentContent()}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Content...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Preview AI Analysis
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Click to preview what categories and rubrics will be generated
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={addTag}
                placeholder="Type a tag and press Enter"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      {tag}
                      <X 
                        className="ml-1 h-3 w-3" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isAnalyzing}>
              {isLoading ? (
                autoGenerateRubrics ? 'Uploading & Generating...' : 'Uploading...'
              ) : (
                autoGenerateRubrics ? 'Upload & Generate Rubrics' : 'Upload Content'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};