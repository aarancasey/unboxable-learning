import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, BookOpen, Settings } from 'lucide-react';
import { ContentUploadModal } from './ContentUploadModal';
import { ContentLibraryList } from './ContentLibraryList';
import { ContentCategoriesManager } from './ContentCategoriesManager';
import { AssessmentRubricsManager } from './AssessmentRubricsManager';
import { AIKnowledgeChat } from '../ai/AIKnowledgeChat';

export const ContentLibraryManager: React.FC = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('library');

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