

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { EditableAISummary } from '@/components/assessment/EditableAISummary';
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

  // Load surveys from Supabase database on component mount
  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const { DataService } = await import('@/services/dataService');
        const surveys = await DataService.getSurveySubmissions();
        setStoredSurveys(surveys);
      } catch (error) {
        console.error('Failed to load surveys:', error);
        // Fallback to localStorage
        const savedSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
        setStoredSurveys(savedSurveys);
      }
    };
    
    loadSurveys();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Review</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Reviewed</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
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
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Sort surveys by priority
  const allSurveys = [...storedSurveys].sort((a, b) => {
    // Priority order: pending first, then reviewed, then approved
    const statusPriority: { [key: string]: number } = {
      'pending': 1,
      'reviewed': 2,
      'approved': 3
    };
    
    const priorityA = statusPriority[a.status] || 4;
    const priorityB = statusPriority[b.status] || 4;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same status, sort by submitted date (newest first)
    return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
  });
  
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
                <span>{selectedSurvey.learner}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Submitted {selectedSurvey.submittedDate}</span>
              </div>
              {getStatusBadge(selectedSurvey.status)}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline">
              <ThumbsDown className="h-4 w-4 mr-2" />
              Request Revision
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Approve & Unlock Next Module
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Survey Reviews</h2>
          <p className="text-gray-600">Review learner survey responses and AI-generated insights</p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'pending' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button 
            variant={filter === 'reviewed' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('reviewed')}
          >
            Reviewed
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
                      <span>{survey.learner}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted {survey.submittedDate}</span>
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

