import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  status: 'success' | 'error';
  message: string;
  details?: any;
}

export const RubricsTestButton: React.FC = () => {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const testRubricsGeneration = async () => {
    setIsAnalysing(true);
    setTestResults([]);

    try {
      setTestResults(prev => [...prev, {
        status: 'success',
        message: 'Starting environment validation...',
        details: { step: 'initialization' }
      }]);

      // Get the most recent document without rubrics
      const { data: contentData, error: contentError } = await supabase
        .from('content_library')
        .select('id, title, extracted_content')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (contentError) {
        setTestResults(prev => [...prev, {
          status: 'error',
          message: `Database query failed: ${contentError.message}`,
          details: { error: contentError, step: 'document_fetch' }
        }]);
        throw new Error(`Failed to fetch document: ${contentError.message}`);
      }

      if (!contentData) {
        setTestResults(prev => [...prev, {
          status: 'error',
          message: 'No documents found to analyse',
          details: { step: 'document_validation' }
        }]);
        throw new Error('No documents found to analyse');
      }

      setTestResults(prev => [...prev, {
        status: 'success',
        message: `Found document: ${contentData.title}`,
        details: { 
          documentId: contentData.id,
          title: contentData.title,
          contentLength: contentData.extracted_content?.length || 0,
          step: 'document_found'
        }
      }]);

      // Test the edge function directly
      
      
      setTestResults(prev => [...prev, {
        status: 'success',
        message: 'Calling analyse-document-content edge function...',
        details: { step: 'edge_function_call' }
      }]);

      const startTime = Date.now();
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke(
        'analyse-document-content',
        {
          body: {
            extractedContent: contentData.extracted_content,
            documentTitle: contentData.title
          }
        }
      );
      const duration = Date.now() - startTime;

      if (analysisError) {
        
        setTestResults(prev => [...prev, {
          status: 'error',
          message: `Edge function failed: ${analysisError.message || 'Unknown error'}`,
          details: { 
            error: analysisError,
            duration: `${duration}ms`,
            step: 'edge_function_error'
          }
        }]);
        return;
      }

      

      if (analysisResult?.success) {
        setTestResults(prev => [...prev, {
          status: 'success',
          message: `Successfully created ${analysisResult.categories?.length || 0} categories and ${analysisResult.rubrics?.length || 0} rubrics`,
          details: analysisResult
        }]);

        // Update the content library record to link it to the rubrics
        if (analysisResult.rubrics?.length > 0) {
          const { error: updateError } = await supabase
            .from('assessment_rubrics')
            .update({ content_library_id: contentData.id })
            .in('id', analysisResult.rubrics.map((r: any) => r.id));

          if (updateError) {
            
          } else {
            
          }
        }

        toast({
          title: "Analysis Complete!",
          description: `Generated ${analysisResult.categories?.length || 0} categories and ${analysisResult.rubrics?.length || 0} rubrics`,
        });
      } else {
        setTestResults(prev => [...prev, {
          status: 'error',
          message: 'Analysis failed or returned no results',
          details: analysisResult
        }]);
      }

    } catch (error: any) {
      
      setTestResults(prev => [...prev, {
        status: 'error',
        message: error.message,
        details: error
      }]);

      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Test Rubrics Generation
        </CardTitle>
        <CardDescription>
          Manually trigger the AI analysis for your uploaded documents to generate assessment rubrics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testRubricsGeneration}
          disabled={isAnalysing}
          className="w-full"
        >
          {isAnalysing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Document...
            </>
          ) : (
            <>
              <Bot className="mr-2 h-4 w-4" />
              Analyze Latest Document
            </>
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                {result.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={result.status === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {result.message}
                  </p>
                  {result.details && (
                    <pre className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};