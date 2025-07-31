

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { EditableAISummary } from '@/components/assessment/EditableAISummary';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Brain,
  User,
  Calendar,
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const SurveyReviewer = () => {
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [storedSurveys, setStoredSurveys] = useState<any[]>([]);
  const { toast } = useToast();

  // Load surveys from Supabase database on component mount
  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const { DataService } = await import('@/services/dataService');
        const surveys = await DataService.getSurveySubmissions();
        setStoredSurveys(surveys);
      } catch (error) {
        console.error('Failed to load surveys:', error);
        setStoredSurveys([]);
      }
    };
    
    loadSurveys();
  }, []);

  const handleApproveSurvey = async (survey: any) => {
    try {
      // Update survey status to approved in Supabase
      const { DataService } = await import('@/services/dataService');
      await DataService.updateSurveySubmission(survey.id, { status: 'approved' });
      
      // Update state immediately
      const updatedSurvey = { ...survey, status: 'approved' };
      const updatedSurveys = storedSurveys.map((s: any) => 
        s.id === survey.id ? updatedSurvey : s
      );
      setStoredSurveys(updatedSurveys);
      setSelectedSurvey(updatedSurvey);
      
      toast({
        title: "Survey Approved",
        description: `${survey.learner_name || survey.learner}'s survey has been approved. Learning modules are now unlocked.`,
      });
      
    } catch (error) {
      console.error('Failed to approve survey:', error);
      toast({
        title: "Error",
        description: "Failed to approve survey. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectSurvey = async (survey: any) => {
    try {
      const { DataService } = await import('@/services/dataService');
      await DataService.updateSurveySubmission(survey.id, { status: 'needs_revision' });
      
      const updatedSurvey = { ...survey, status: 'needs_revision' };
      const updatedSurveys = storedSurveys.map((s: any) => 
        s.id === survey.id ? updatedSurvey : s
      );
      setStoredSurveys(updatedSurveys);
      setSelectedSurvey(updatedSurvey);
      
      toast({
        title: "Revision Requested",
        description: `${survey.learner_name || survey.learner} will be notified to revise their survey.`,
        variant: "destructive",
      });
      
    } catch (error) {
      console.error('Failed to request revision:', error);
      toast({
        title: "Error", 
        description: "Failed to request revision. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Review</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Reviewed</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'needs_revision':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Needs Revision</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'reviewed':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs_revision':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Sort surveys by priority and add statistics
  const allSurveys = [...storedSurveys].sort((a, b) => {
    // Priority order: pending first, needs_revision, then reviewed, then approved
    const statusPriority: { [key: string]: number } = {
      'pending': 1,
      'needs_revision': 2, 
      'reviewed': 3,
      'approved': 4
    };
    
    const priorityA = statusPriority[a.status] || 5;
    const priorityB = statusPriority[b.status] || 5;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same status, sort by submitted date (newest first)
    return new Date(b.submitted_at || b.submittedDate).getTime() - new Date(a.submitted_at || a.submittedDate).getTime();
  });

  // Calculate statistics
  const stats = {
    total: allSurveys.length,
    pending: allSurveys.filter(s => s.status === 'pending').length,
    needsRevision: allSurveys.filter(s => s.status === 'needs_revision').length,
    approved: allSurveys.filter(s => s.status === 'approved').length,
    reviewed: allSurveys.filter(s => s.status === 'reviewed').length,
  };
  
  const filteredSurveys = filter === 'all' ? allSurveys : allSurveys.filter(survey => survey.status === filter);

  if (selectedSurvey) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => setSelectedSurvey(null)} className="mb-2">
              ← Back to Surveys
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">{selectedSurvey.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{selectedSurvey.learner_name || selectedSurvey.learner || 'Unknown User'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Submitted {selectedSurvey.submitted_at ? new Date(selectedSurvey.submitted_at).toLocaleDateString() : selectedSurvey.submittedDate}</span>
              </div>
              {getStatusBadge(selectedSurvey.status)}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => handleRejectSurvey(selectedSurvey)}
              disabled={selectedSurvey.status === 'needs_revision'}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Request Revision
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleApproveSurvey(selectedSurvey)}
              disabled={selectedSurvey.status === 'approved'}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Approve & Unlock Modules
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Survey Responses */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  <span>Survey Responses</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedSurvey.responses.map((response: any, index: number) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h4 className="font-medium text-gray-900 mb-2">{response.question}</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{response.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* AI Summary */}
          <div className="space-y-4">
            <EditableAISummary 
              survey={selectedSurvey}
              onSummaryUpdate={(updatedSummary) => {
                const updatedSurvey = { ...selectedSurvey, aiSummary: updatedSummary };
                setSelectedSurvey(updatedSurvey);
                
                // Update the survey in the stored surveys list
                const savedSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
                const updatedSurveys = savedSurveys.map((s: any) => 
                  s.id === selectedSurvey.id ? updatedSurvey : s
                );
                localStorage.setItem('surveySubmissions', JSON.stringify(updatedSurveys));
                setStoredSurveys(updatedSurveys);
              }}
            />

            {/* Admin Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Add your notes about this survey response..."
                  className="min-h-[100px]"
                />
                <Button size="sm" className="mt-3">Save Notes</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Survey Management</h2>
          <p className="text-gray-600">Review learner survey responses and manage approvals</p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Surveys</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.needsRevision}</div>
              <div className="text-sm text-gray-600">Needs Revision</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
              <div className="text-sm text-gray-600">Reviewed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </Button>
          <Button 
            variant={filter === 'pending' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </Button>
          <Button 
            variant={filter === 'needs_revision' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('needs_revision')}
          >
            Needs Revision ({stats.needsRevision})
          </Button>
          <Button 
            variant={filter === 'reviewed' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('reviewed')}
          >
            Reviewed ({stats.reviewed})
          </Button>
          <Button 
            variant={filter === 'approved' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('approved')}
          >
            Approved ({stats.approved})
          </Button>
        </div>
      </div>

      {/* Surveys List */}
      <div className="space-y-4">
        {filteredSurveys.map((survey) => (
          <Card 
            key={survey.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedSurvey(survey)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">{survey.title}</h3>
                    {getStatusBadge(survey.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{survey.learner_name || survey.learner || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted {survey.submitted_at ? new Date(survey.submitted_at).toLocaleDateString() : survey.submittedDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Department:</span>
                      <span>{survey.department}</span>
                    </div>
                  </div>

                  {survey.aiSummary && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">AI Analysis Ready</span>
                      </div>
                      <p className="text-sm text-purple-700 line-clamp-2">
                        {survey.aiSummary.overallAssessment}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {getStatusIcon(survey.status)}
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSurveys.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys found</h3>
            <p className="text-gray-600">No surveys match your current filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SurveyReviewer;

