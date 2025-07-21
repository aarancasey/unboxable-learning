import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, BookOpen, Settings, Sparkles } from 'lucide-react';
import { ContentUploadModal } from './ContentUploadModal';
import { ContentLibraryList } from './ContentLibraryList';
import { ContentCategoriesManager } from './ContentCategoriesManager';
import { AssessmentRubricsManager } from './AssessmentRubricsManager';
import { AIKnowledgeChat } from '../ai/AIKnowledgeChat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ContentLibraryManager: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('library');
  const [isExtractingKnowledge, setIsExtractingKnowledge] = useState(false);
  const { toast } = useToast();

  const handleManualKnowledgeExtraction = async () => {
    setIsExtractingKnowledge(true);
    
    try {
      // Fetch all content library items
      const { data: contentItems, error: fetchError } = await supabase
        .from('content_library')
        .select('id, title, extracted_content')
        .not('extracted_content', 'is', null);

      if (fetchError) throw fetchError;

      if (!contentItems || contentItems.length === 0) {
        toast({
          title: "No documents found",
          description: "No documents with extracted content found to process",
          variant: "destructive"
        });
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Process each document
      for (const item of contentItems) {
        try {
          console.log(`Processing document: ${item.title}`);
          
          const { error: knowledgeError } = await supabase.functions.invoke('process-document-knowledge', {
            body: {
              contentLibraryId: item.id,
              extractedContent: item.extracted_content,
              title: item.title
            }
          });
          
          if (knowledgeError) {
            console.error(`Failed to extract knowledge for ${item.title}:`, knowledgeError);
            errorCount++;
          } else {
            console.log(`Successfully processed: ${item.title}`);
            successCount++;
          }
        } catch (itemError) {
          console.error(`Error processing ${item.title}:`, itemError);
          errorCount++;
        }
      }

      const totalProcessed = successCount + errorCount;
      
      if (successCount > 0) {
        toast({
          title: "Knowledge extraction completed",
          description: `Successfully processed ${successCount} of ${totalProcessed} documents. Knowledge base updated for AI chat.`,
        });
      } else {
        toast({
          title: "Knowledge extraction failed",
          description: `Failed to process all ${errorCount} documents. Check console for details.`,
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Error during manual knowledge extraction:', error);
      toast({
        title: "Extraction failed",
        description: error.message || "Failed to extract knowledge from documents",
        variant: "destructive"
      });
    } finally {
      setIsExtractingKnowledge(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Library</h1>
          <p className="text-muted-foreground">
            Manage your leadership assessment content, frameworks, and rubrics
          </p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Content
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Content Library
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="rubrics" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Assessment Rubrics
          </TabsTrigger>
          <TabsTrigger value="ai-chat" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            AI Knowledge Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          {/* Manual Knowledge Extraction Section */}
          <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Knowledge Extraction</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Process existing documents to extract knowledge for AI chat functionality.
            </p>
            <Button 
              onClick={handleManualKnowledgeExtraction}
              disabled={isExtractingKnowledge}
              variant="outline"
              className="w-full"
            >
              {isExtractingKnowledge ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Processing Documents...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract Knowledge from All Documents
                </>
              )}
            </Button>
          </div>
          
          <ContentLibraryList />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <ContentCategoriesManager />
        </TabsContent>

        <TabsContent value="rubrics" className="space-y-4">
          <AssessmentRubricsManager />
        </TabsContent>
        
        <TabsContent value="ai-chat" className="space-y-4">
          <AIKnowledgeChat />
        </TabsContent>
      </Tabs>

      <ContentUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};