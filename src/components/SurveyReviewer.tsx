

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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

  // Load surveys from localStorage on component mount
  useEffect(() => {
    const savedSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
    setStoredSurveys(savedSurveys);
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
      <div className="space-y-6">
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
            <Card className="border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-6">
                <CardTitle className="flex items-center space-x-3">
                  <Brain className="h-6 w-6 text-purple-600" aria-hidden="true" />
                  <span className="text-xl font-semibold text-gray-900">AI Leadership Assessment Summary</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2" id="ai-summary-description">
                  Comprehensive analysis of leadership capabilities, sentiment, and development opportunities based on survey responses.
                </p>
              </CardHeader>
              <CardContent className="space-y-8 pt-8" aria-describedby="ai-summary-description">
                
                {/* Section 1: Leadership Sentiment Snapshot */}
                <section className="border-l-4 border-blue-500 pl-6 pb-8 border-b border-gray-100 last:border-b-0" aria-labelledby="sentiment-heading">
                  <h3 id="sentiment-heading" className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3" aria-hidden="true">1</span>
                    Leadership Sentiment Snapshot
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-3" id="leadership-style-label">Current Leadership Style</h4>
                      <div className="flex items-center" role="group" aria-labelledby="leadership-style-label">
                        <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {selectedSurvey.aiSummary.currentLeadershipStyle || 'Managing, but close to overload'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-3" id="confidence-rating-label">Confidence Rating</h4>
                      <div className="flex items-center" role="group" aria-labelledby="confidence-rating-label">
                        <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {selectedSurvey.aiSummary.confidenceRating || 'Developing Confidence (2.5–3.4)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-3 flex items-center" id="strongest-area-label">
                        <span className="text-green-600 mr-2" aria-hidden="true">✓</span>
                        Strongest Area
                      </h4>
                      <p className="text-sm text-green-700 leading-relaxed" aria-labelledby="strongest-area-label">
                        {selectedSurvey.aiSummary.strongestArea || 'Motivate and align your team'}
                      </p>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-medium text-orange-800 mb-3 flex items-center" id="focus-area-label">
                        <span className="text-orange-600 mr-2" aria-hidden="true">→</span>
                        Area to Focus On
                      </h4>
                      <p className="text-sm text-orange-700 leading-relaxed" aria-labelledby="focus-area-label">
                        {selectedSurvey.aiSummary.focusArea || 'Lead through complexity and ambiguity'}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 2: Leadership Intent & Purpose */}
                <section className="border-l-4 border-purple-500 pl-6 pb-8 border-b border-gray-100 last:border-b-0" aria-labelledby="intent-heading">
                  <h3 id="intent-heading" className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3" aria-hidden="true">2</span>
                    Leadership Intent & Purpose
                  </h3>
                  
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-4" id="aspirations-label">Leadership Aspirations</h4>
                    <div className="flex flex-wrap gap-3" role="list" aria-labelledby="aspirations-label">
                      {(selectedSurvey.aiSummary.leadershipAspirations || ['Empowering and people-centred', 'Strategic and future-focused', 'Curious and adaptive']).map((aspiration: string, index: number) => (
                        <span key={index} role="listitem" className="inline-flex items-center px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium border border-purple-200">
                          {aspiration}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3" id="purpose-rating-label">Connection to Purpose Rating</h4>
                    <div className="flex items-center space-x-3" role="group" aria-labelledby="purpose-rating-label">
                      <span className="text-3xl font-bold text-blue-600" aria-label={`Rating: ${selectedSurvey.aiSummary.purposeRating || '4'} out of 6`}>
                        {selectedSurvey.aiSummary.purposeRating || '4'}
                      </span>
                      <div>
                        <span className="text-sm text-gray-600 block">/ 6</span>
                        <span className="text-sm text-blue-700 font-medium">Connected and gaining clarity</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3: Adaptive & Agile Leadership Snapshot */}
                <section className="border-l-4 border-indigo-500 pl-6 pb-8 border-b border-gray-100 last:border-b-0" aria-labelledby="agility-heading">
                  <h3 id="agility-heading" className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="bg-indigo-100 text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3" aria-hidden="true">3</span>
                    Adaptive & Agile Leadership Snapshot
                  </h3>
                  
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-800 mb-4" id="agility-level-label">Leadership Agility Level</h4>
                    <div className="inline-flex items-center px-6 py-3 bg-indigo-100 text-indigo-800 rounded-lg font-semibold text-base border border-indigo-200" role="group" aria-labelledby="agility-level-label">
                      {selectedSurvey.aiSummary.agilityLevel || 'Achiever'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                      <h4 className="font-medium text-green-800 mb-4 flex items-center" id="strengths-label">
                        <span className="text-green-600 mr-2" aria-hidden="true">🌟</span>
                        Notable Strengths (Top 3)
                      </h4>
                      <ul className="space-y-3" role="list" aria-labelledby="strengths-label">
                        {(selectedSurvey.aiSummary.topStrengths || ['Action Orientation & Delivery', 'Decision-Making Agility', 'Empowering Others & Collaboration']).map((strength: string, index: number) => (
                          <li key={index} role="listitem" className="text-sm text-green-700 flex items-start leading-relaxed">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" aria-hidden="true"></span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
                      <h4 className="font-medium text-orange-800 mb-4 flex items-center" id="development-areas-label">
                        <span className="text-orange-600 mr-2" aria-hidden="true">🎯</span>
                        Development Areas (Focus Areas)
                      </h4>
                      <ul className="space-y-3" role="list" aria-labelledby="development-areas-label">
                        {(selectedSurvey.aiSummary.developmentAreas || ['Navigating Change & Uncertainty', 'Strategic Agility & Systems Thinking', 'Learning Agility & Growth Mindset']).map((area: string, index: number) => (
                          <li key={index} role="listitem" className="text-sm text-orange-700 flex items-start leading-relaxed">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" aria-hidden="true"></span>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 4: General Summary */}
                <section className="border-l-4 border-gray-500 pl-6" aria-labelledby="summary-heading">
                  <h3 id="summary-heading" className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="bg-gray-100 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3" aria-hidden="true">4</span>
                    Overall Assessment Summary
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-base text-gray-700 leading-relaxed" aria-labelledby="summary-heading">
                      {selectedSurvey.aiSummary.overallAssessment || 'This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.'}
                    </p>
                  </div>
                </section>
              </CardContent>
            </Card>

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

