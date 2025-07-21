import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

interface SurveyPrerequisiteSectionProps {
  surveys: any[];
  surveyStatus: 'not_started' | 'completed' | 'approved';
  onStartSurvey: () => void;
  onStartPostSurvey: () => void;
  hasCompletedModules: boolean;
}

const SurveyPrerequisiteSection = ({ 
  surveys, 
  surveyStatus, 
  onStartSurvey, 
  onStartPostSurvey,
  hasCompletedModules 
}: SurveyPrerequisiteSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const getStatusIcon = () => {
    switch (surveyStatus) {
      case 'completed':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (surveyStatus) {
      case 'completed':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Approval</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Required</Badge>;
    }
  };

  const getStatusMessage = () => {
    switch (surveyStatus) {
      case 'completed':
        return "Your pre-course survey has been submitted and is pending admin approval. Learning modules will be unlocked once approved.";
      case 'approved':
        return "Pre-course survey approved! Learning modules are now available. Complete the post-course survey after finishing all modules.";
      default:
        return "Please complete the pre-course survey to unlock your learning modules.";
    }
  };

  const shouldShowPostSurvey = surveyStatus === 'approved' && hasCompletedModules;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-8 border-2 border-unboxable-orange/20 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-50/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-unboxable-navy">
              <div className="flex items-center space-x-2">
                <ClipboardList className="h-6 w-6 text-unboxable-orange" />
                <span>Course Assessment</span>
                {getStatusBadge()}
              </div>
              <ChevronDown className={`h-5 w-5 text-unboxable-orange transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              {getStatusIcon()}
              <div className="flex-1">
                <p className="text-gray-700 mb-4">{getStatusMessage()}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pre-course Survey */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-medium text-unboxable-navy mb-2 flex items-center">
                      <ClipboardList className="h-4 w-4 mr-2 text-unboxable-orange" />
                      Pre-Course Survey
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Complete this assessment before starting your learning journey
                    </p>
                    <Button
                      onClick={onStartSurvey}
                      disabled={surveyStatus !== 'not_started'}
                      className="w-full bg-unboxable-orange hover:bg-unboxable-orange/90 text-white disabled:bg-gray-400"
                    >
                      {surveyStatus === 'not_started' ? (
                        <>
                          Start Survey
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      ) : surveyStatus === 'completed' ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Awaiting Approval
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Post-course Survey */}
                  <div className={`p-4 bg-white rounded-lg border border-gray-200 ${!shouldShowPostSurvey ? 'opacity-50' : ''}`}>
                    <h4 className="font-medium text-unboxable-navy mb-2 flex items-center">
                      <ClipboardList className="h-4 w-4 mr-2 text-unboxable-orange" />
                      Post-Course Survey
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Complete after finishing all learning modules
                    </p>
                    <Button
                      onClick={onStartPostSurvey}
                      disabled={!shouldShowPostSurvey}
                      className="w-full bg-unboxable-orange hover:bg-unboxable-orange/90 text-white disabled:bg-gray-400"
                    >
                      {shouldShowPostSurvey ? (
                        <>
                          Start Post-Survey
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Complete Modules First
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default SurveyPrerequisiteSection;