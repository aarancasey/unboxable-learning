import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Mail } from 'lucide-react';
import { dateHelpers } from '@/lib/dateUtils';

interface SurveyCompletedMessageProps {
  onBack: () => void;
  submissionDate: string;
  status: string;
  learnerName: string;
}

export const SurveyCompletedMessage = ({ 
  onBack, 
  submissionDate, 
  status, 
  learnerName 
}: SurveyCompletedMessageProps) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'approved':
        return {
          title: 'Assessment Approved!',
          message: 'Your assessment has been reviewed and approved. You can now access the learning modules.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'completed':
      case 'pending':
      case 'reviewed':
        return {
          title: 'Assessment Submitted',
          message: 'Your assessment has been submitted and is currently under review. You will be notified once it has been approved.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'needs_revision':
        return {
          title: 'Assessment Needs Revision',
          message: 'Your assessment has been reviewed and requires some revisions. Please contact your facilitator for more details.',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      default:
        return {
          title: 'Assessment Already Completed',
          message: 'You have already completed this assessment.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-2`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className={`h-16 w-16 ${statusInfo.color}`} />
            </div>
            <CardTitle className={`text-2xl font-bold ${statusInfo.color}`}>
              {statusInfo.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-center text-gray-700 leading-relaxed">
              {statusInfo.message}
            </p>

            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <span className="font-medium text-gray-700">Submitted on:</span>
                  <span className="ml-2 text-gray-600">
                    {dateHelpers.longDate(new Date(submissionDate))}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <span className="font-medium text-gray-700">Participant:</span>
                  <span className="ml-2 text-gray-600">{learnerName}</span>
                </div>
              </div>
            </div>

            {status === 'needs_revision' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>Need assistance?</strong> Contact your facilitator or learning administrator 
                  for specific feedback on required revisions.
                </p>
              </div>
            )}

            <div className="pt-4 text-center">
              <Button onClick={onBack} variant="outline" size="lg">
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};