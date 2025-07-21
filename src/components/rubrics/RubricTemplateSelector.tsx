
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RubricTemplate } from '@/types/rubrics';
import { getRubricTemplates } from '@/hooks/useRubrics';
import { Search, FileText, Users, Briefcase, MessageSquare, Sparkles } from 'lucide-react';

interface RubricTemplateSelectorProps {
  onTemplateSelect: (template: RubricTemplate) => void;
  onCreateFromScratch: () => void;
  suggestedCategory?: string;
}

export const RubricTemplateSelector = ({ 
  onTemplateSelect, 
  onCreateFromScratch,
  suggestedCategory
}: RubricTemplateSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const templates = getRubricTemplates();
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  // Auto-select suggested category if provided
  useEffect(() => {
    if (suggestedCategory && categories.includes(suggestedCategory)) {
      setSelectedCategory(suggestedCategory);
    }
  }, [suggestedCategory, categories]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'leadership': return <Users className="w-4 h-4" />;
      case 'communication': return <MessageSquare className="w-4 h-4" />;
      case 'management': return <Briefcase className="w-4 h-4" />;
      case 'teamwork': return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {suggestedCategory && (
        <Card className="border-unboxable-navy bg-unboxable-navy/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-unboxable-navy">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">
                Suggested category: {suggestedCategory}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === suggestedCategory && <Sparkles className="w-3 h-3 mr-1" />}
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create from scratch option */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-unboxable-navy transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle className="text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              Create from Scratch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center mb-4">
              Build a custom rubric tailored to your specific needs
            </p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={onCreateFromScratch}
            >
              Start Building
            </Button>
          </CardContent>
        </Card>

        {/* Template options */}
        {filteredTemplates.map(template => (
          <Card 
            key={template.id} 
            className={`hover:shadow-lg transition-shadow cursor-pointer ${
              template.category === suggestedCategory ? 'ring-2 ring-unboxable-navy ring-opacity-20' : ''
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {getCategoryIcon(template.category)}
                {template.name}
                {template.category === suggestedCategory && (
                  <Sparkles className="w-4 h-4 text-unboxable-navy" />
                )}
              </CardTitle>
              <Badge 
                variant={template.category === suggestedCategory ? "default" : "secondary"} 
                className="w-fit"
              >
                {template.category}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {template.description}
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Criteria ({template.criteria.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.criteria.slice(0, 3).map((criterion, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {criterion.name}
                      </Badge>
                    ))}
                    {template.criteria.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.criteria.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Scoring Scale</h4>
                  <p className="text-xs text-gray-500">
                    {template.scoring_scale.levels.length} levels • Max {template.scoring_scale.maxPoints} points
                  </p>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={() => onTemplateSelect(template)}
                variant={template.category === suggestedCategory ? "default" : "outline"}
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or create a custom rubric from scratch.
          </p>
          <Button onClick={onCreateFromScratch}>
            Create Custom Rubric
          </Button>
        </div>
      )}
    </div>
  );
};
