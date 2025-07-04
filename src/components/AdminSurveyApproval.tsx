import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Eye } from 'lucide-react';

const AdminSurveyApproval = () => {
  const [surveySubmissions, setSurveySubmissions] = useState<any[]>([]);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const submissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
    setSurveySubmissions(submissions);
    setIsApproved(localStorage.getItem('surveyApproved') === 'true');
  }, []);

  const handleApprove = () => {
    localStorage.setItem('surveyApproved', 'true');
    setIsApproved(true);
    alert('Survey approved! Learner modules will now be unlocked.');
  };

  const handleReset = () => {
    localStorage.removeItem('surveyApproved');
    localStorage.removeItem('surveySubmissions');
    setIsApproved(false);
    setSurveySubmissions([]);
    alert('Survey approval reset. Learner will need to complete survey again.');
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-unboxable-orange" />
          <span>Admin: Survey Approval</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-unboxable-navy">Survey Status</h3>
            <p className="text-sm text-gray-600">
              {surveySubmissions.length > 0 
                ? `${surveySubmissions.length} survey(s) submitted` 
                : 'No surveys submitted yet'}
            </p>
          </div>
          {isApproved ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <CheckCircle className="h-4 w-4 mr-1" />
              Approved
            </Badge>
          ) : surveySubmissions.length > 0 ? (
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
              <Clock className="h-4 w-4 mr-1" />
              Pending Approval
            </Badge>
          ) : (
            <Badge variant="secondary">
              No Submissions
            </Badge>
          )}
        </div>

        {surveySubmissions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-unboxable-navy">Recent Submissions</h4>
            {surveySubmissions.map((submission: any, index: number) => (
              <div key={index} className="p-3 bg-white border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{submission.title}</p>
                    <p className="text-sm text-gray-600">
                      Submitted: {submission.submittedDate}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-3 pt-4 border-t">
          {!isApproved && surveySubmissions.length > 0 && (
            <Button 
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Survey
            </Button>
          )}
          <Button 
            onClick={handleReset}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Reset for Demo
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Admin Instructions</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Learners must complete the pre-course survey first</li>
            <li>• Admin approval is required to unlock learning modules</li>
            <li>• After completing all modules, learners can take the post-course survey</li>
            <li>• Compare pre/post results to generate improvement reports</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSurveyApproval;