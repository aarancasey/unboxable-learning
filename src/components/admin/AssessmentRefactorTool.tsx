import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Database,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RefactorResult {
  submissionId: number;
  learnerName: string;
  success: boolean;
  error?: string;
  newFormat?: any;
}

interface RefactorSummary {
  total: number;
  successful: number;
  failed: number;
}

export const AssessmentRefactorTool = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refactorResults, setRefactorResults] = useState<RefactorResult[]>([]);
  const [refactorSummary, setRefactorSummary] = useState<RefactorSummary | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('survey_submissions')
        .select('id, learner_name, submitted_at, status, responses')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch survey submissions",
        variant: "destructive",
      });
    }
  };

  const hasNewFormat = (responses: any) => {
    return responses?.refactored_format_version === '2.0' || 
           (responses?.ai_summary?.confidenceLevels !== undefined);
  };

  const getFormatBadge = (responses: any) => {
    if (hasNewFormat(responses)) {
      return <Badge variant="default" className="bg-green-100 text-green-800">New Format</Badge>;
    }
    return <Badge variant="secondary">Old Format</Badge>;
  };

  const handleSubmissionToggle = (submissionId: number) => {
    setSelectedSubmissions(prev => 
      prev.includes(submissionId) 
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  const handleSelectAll = () => {
    const oldFormatSubmissions = submissions
      .filter(s => !hasNewFormat(s.responses))
      .map(s => s.id);
    setSelectedSubmissions(oldFormatSubmissions);
  };

  const handleDeselectAll = () => {
    setSelectedSubmissions([]);
  };

  const refactorAssessments = async (mode: 'selected' | 'all') => {
    setIsLoading(true);
    setShowResults(false);
    
    try {
      const payload = mode === 'all' 
        ? { mode: 'all' }
        : { submissionIds: selectedSubmissions, mode: 'selected' };

      const { data, error } = await supabase.functions.invoke('refactor-assessments', {
        body: payload
      });

      if (error) throw error;

      if (data.success) {
        setRefactorResults(data.results || []);
        setRefactorSummary(data.summary || null);
        setShowResults(true);
        
        toast({
          title: "Refactoring Complete",
          description: data.message,
        });

        // Refresh submissions to show updated format badges
        await fetchSubmissions();
        setSelectedSubmissions([]);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error refactoring assessments:', error);
      toast({
        title: "Refactoring Failed",
        description: error.message || "An error occurred during refactoring",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(refactorResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `assessment-refactor-results-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const oldFormatCount = submissions.filter(s => !hasNewFormat(s.responses)).length;
  const newFormatCount = submissions.filter(s => hasNewFormat(s.responses)).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Assessment Format Refactoring Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This tool will update all AI assessments to use the new LEADForward criteria structure. 
              This process cannot be undone, but it will preserve all original data while adding the new format.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{oldFormatCount}</div>
              <div className="text-sm text-muted-foreground">Old Format</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{newFormatCount}</div>
              <div className="text-sm text-muted-foreground">New Format</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => refactorAssessments('all')}
              disabled={isLoading || submissions.length === 0}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refactor All Assessments
            </Button>
            
            <Button 
              onClick={() => refactorAssessments('selected')}
              disabled={isLoading || selectedSubmissions.length === 0}
              variant="outline"
              className="flex-1"
            >
              Refactor Selected ({selectedSubmissions.length})
            </Button>
          </div>

          {oldFormatCount > 0 && (
            <div className="flex gap-2">
              <Button 
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
              >
                Select All Old Format
              </Button>
              <Button 
                onClick={handleDeselectAll}
                variant="outline"
                size="sm"
              >
                Deselect All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {submissions.map((submission) => (
              <div 
                key={submission.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedSubmissions.includes(submission.id)
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSubmissionToggle(submission.id)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.includes(submission.id)}
                    onChange={() => handleSubmissionToggle(submission.id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">{submission.learner_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={submission.status === 'completed' ? 'default' : 'secondary'}>
                    {submission.status}
                  </Badge>
                  {getFormatBadge(submission.responses)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && refactorSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Refactoring Results
              <Button onClick={downloadResults} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Results
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{refactorSummary.total}</div>
                <div className="text-sm text-muted-foreground">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{refactorSummary.successful}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{refactorSummary.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {refactorSummary.successful > 0 && (
              <Progress value={(refactorSummary.successful / refactorSummary.total) * 100} />
            )}

            <div className="max-h-64 overflow-y-auto space-y-2">
              {refactorResults.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-2 border rounded ${
                    result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">{result.learnerName}</span>
                  </div>
                  
                  {result.error && (
                    <span className="text-sm text-red-600">{result.error}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};