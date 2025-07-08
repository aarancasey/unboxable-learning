import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GraduationCap, ArrowRight, CheckCircle, Users, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface LearnerWelcomeSectionProps {
  learnerName: string;
  surveyStatus: 'not_started' | 'completed' | 'approved';
}

const LearnerWelcomeSection = ({ learnerName, surveyStatus }: LearnerWelcomeSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const getWelcomeMessage = () => {
    switch (surveyStatus) {
      case 'approved':
        return `Great work, ${learnerName}! Your pre-course assessment has been approved and your learning modules are now unlocked.`;
      case 'completed':
        return `Thank you, ${learnerName}! Your pre-course assessment is being reviewed by our team.`;
      default:
        return `Welcome to your learning journey, ${learnerName}!`;
    }
  };

  const getInstructions = () => {
    switch (surveyStatus) {
      case 'approved':
        return [
          "Complete the learning modules at your own pace over the next 4 weeks",
          "Track your progress using the overview cards below",
          "Once you've finished all modules, you'll unlock the post-course assessment",
          "Your learning data will help us provide detailed improvement insights"
        ];
      case 'completed':
        return [
          "Your pre-course assessment has been submitted successfully",
          "Our team is reviewing your responses to personalize your learning experience", 
          "You'll receive notification once your learning modules are unlocked",
          "This usually takes 1-2 business days"
        ];
      default:
        return [
          "Start by completing your pre-course assessment below",
          "This helps us understand your current knowledge and tailor your learning",
          "Once submitted and approved, your personalized learning modules will unlock",
          "Complete all modules over 4 weeks, then take the post-course assessment"
        ];
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-unboxable-navy/10">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-4 sm:pb-6 cursor-pointer hover:bg-white/20 transition-colors rounded-t-lg">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-3 text-unboxable-navy">
              <div className="flex items-center space-x-3">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-unboxable-orange" />
                <span className="text-lg sm:text-xl leading-tight">{getWelcomeMessage()}</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-unboxable-navy flex items-center">
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-unboxable-orange" />
                    Your Learning Path
                  </h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {getInstructions().map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-2 text-xs sm:text-sm text-gray-700">
                        <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-unboxable-orange/20 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-medium text-unboxable-orange">{index + 1}</span>
                        </div>
                        <span className="leading-relaxed">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/60 rounded-lg p-3 sm:p-4 border border-white/40">
                  <h4 className="font-semibold text-unboxable-navy flex items-center mb-3">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-unboxable-orange" />
                    Support & Guidance
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <p className="flex items-start">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      Expert-designed curriculum tailored to your industry
                    </p>
                    <p className="flex items-start">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      Flexible learning that fits your schedule
                    </p>
                    <p className="flex items-start">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      Detailed progress tracking and insights
                    </p>
                    <p className="flex items-start">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      Pre and post-assessment comparison reports
                    </p>
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

export default LearnerWelcomeSection;