import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Download, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { dateHelpers } from '@/lib/dateUtils';

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  extracted_content: string;
  tags: string[];
  file_url: string | null;
  original_filename: string | null;
  created_at: string;
  content_categories: {
    name: string;
    framework_section: string;
  } | null;
}

export const ContentLibraryList: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    filterContent();
  }, [content, searchTerm, filterType, filterCategory]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select(`
          *,
          content_categories (
            name,
            framework_section
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading content",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterContent = () => {
    let filtered = content;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.extracted_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.content_type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.content_categories?.framework_section === filterCategory
      );
    }

    setFilteredContent(filtered);
  };

  const handleDownload = async (item: ContentItem) => {
    if (!item.file_url) {
      toast({
        title: "No file available",
        description: "This content item doesn't have an associated file",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('content-library')
        .download(item.file_url);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.original_filename || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const { error } = await supabase
        .from('content_library')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Content deleted",
        description: "Content has been removed from the library"
      });

      fetchContent();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="framework">Framework</SelectItem>
            <SelectItem value="rubric">Assessment Rubric</SelectItem>
            <SelectItem value="guide">Development Guide</SelectItem>
            <SelectItem value="assessment">Assessment Criteria</SelectItem>
            <SelectItem value="methodology">Methodology</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="sentiment">Leadership Sentiment</SelectItem>
            <SelectItem value="purpose">Intent & Purpose</SelectItem>
            <SelectItem value="agility">Adaptive & Agile</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="assessment">Assessment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredContent.map((item) => (
          <Card key={item.id} className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>
                    {item.content_categories?.name}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  {item.file_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(item)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">
                  {item.content_type}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-3">
                {item.extracted_content}
              </p>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Added {dateHelpers.shortDate(item.created_at)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {content.length === 0 
              ? "No content in library yet. Upload some documents to get started."
              : "No content matches your search criteria."
            }
          </p>
        </div>
      )}
    </div>
  );
};