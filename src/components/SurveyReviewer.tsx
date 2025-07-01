
import { useState } from 'react';
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

  const mockSurveys = [
    {
      id: 1,
      title: "Communication Skills Assessment",
      learner: "Sarah Johnson",
      department: "Marketing",
      submittedDate: "2024-01-20",
      status: "pending",
      responses: [
        {
          question: "How comfortable are you with public speaking?",
          answer: "Somewhat comfortable - I can do it when needed"
        },
        {
          question: "Which communication style do you prefer in team meetings?",
          answer: "Collaborative and discussion-focused"
        },
        {
          question: "Describe a recent situation where you had to communicate complex information to a colleague.",
          answer: "Last week, I had to explain our new marketing automation workflow to a colleague from sales. I broke it down into step-by-step visuals and walked through each stage, making sure to relate it to their existing processes. I also provided a written summary they could reference later."
        },
        {
          question: "What's your biggest challenge in workplace communication?",
          answer: "Speaking up in meetings"
        },
        {
          question: "What communication skills would you most like to improve?",
          answer: "I'd like to improve my confidence in presenting to leadership and my ability to give constructive feedback to team members. I sometimes struggle with finding the right balance between being direct and being diplomatic."
        }
      ],
      aiSummary: {
        strengths: [
          "Shows collaborative communication style preference",
          "Demonstrates good written communication skills",
          "Uses visual aids effectively to explain complex concepts"
        ],
        challenges: [
          "Lacks confidence in speaking up during meetings",
          "Needs development in presentation skills for leadership",
          "Struggles with giving constructive feedback"
        ],
        recommendations: [
          "Enroll in the 'Executive Presentation Skills' module",
          "Practice feedback delivery through role-playing exercises",
          "Join the peer mentoring program for confidence building"
        ],
        overallAssessment: "Sarah demonstrates strong foundational communication skills with a collaborative approach. Her main development areas focus on confidence-building in formal settings and feedback delivery. She would benefit from structured practice opportunities and mentorship."
      }
    },
    {
      id: 2,
      title: "Leadership Style Assessment",
      learner: "Mike Chen",
      department: "Engineering",
      submittedDate: "2024-01-19",
      status: "reviewed",
      responses: [
        {
          question: "How do you typically approach team conflicts?",
          answer: "I try to understand all perspectives first, then facilitate a discussion to find common ground"
        },
        {
          question: "What motivates you most as a leader?",
          answer: "Seeing team members grow and achieve their goals"
        }
      ],
      aiSummary: {
        strengths: [
          "Shows empathetic leadership approach",
          "Focuses on team development and growth",
          "Demonstrates conflict resolution skills"
        ],
        challenges: [
          "May need to be more decisive in certain situations",
          "Could benefit from strategic planning skills"
        ],
        recommendations: [
          "Complete the 'Strategic Leadership' advanced module",
          "Practice decision-making frameworks",
          "Consider executive coaching sessions"
        ],
        overallAssessment: "Mike shows natural leadership instincts with a people-first approach. To advance to senior leadership roles, he should focus on strategic thinking and decisive action when needed."
      }
    },
    {
      id: 3,
      title: "Onboarding Experience Survey",
      learner: "Emily Davis",
      department: "Sales",
      submittedDate: "2024-01-18",
      status: "approved",
      responses: [
        {
          question: "How would you rate your onboarding experience?",
          answer: "Very positive - felt welcomed and well-informed"
        },
        {
          question: "What was most helpful during your first week?",
          answer: "The buddy system and having someone to ask questions to"
        }
      ],
      aiSummary: {
        strengths: [
          "Positive onboarding experience indicates good program effectiveness",
          "Values peer support and mentorship",
          "Shows engagement with company culture"
        ],
        challenges: [
          "No significant challenges identified in onboarding"
        ],
        recommendations: [
          "Continue with standard learning path",
          "Consider for peer mentor role in future",
          "Monitor progress through first 90 days"
        ],
        overallAssessment: "Emily had an excellent onboarding experience and shows strong potential for contributing to team culture. She could be a valuable peer mentor for future new hires."
      }
    }
  ];

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

  const filteredSurveys = filter === 'all' ? mockSurveys : mockSurveys.filter(survey => survey.status === filter);

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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>AI Analysis Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-green-700 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Strengths Identified
                  </h4>
                  <ul className="space-y-1">
                    {selectedSurvey.aiSummary.strengths.map((strength: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-orange-700 mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Development Areas
                  </h4>
                  <ul className="space-y-1">
                    {selectedSurvey.aiSummary.challenges.map((challenge: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-1">
                    {selectedSurvey.aiSummary.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Overall Assessment</h4>
                  <p className="text-sm text-gray-700">{selectedSurvey.aiSummary.overallAssessment}</p>
                </div>
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
