import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SurveyProgressProps {
  progress: number;
  currentSection: number;
  totalSections: number;
  sectionTitle: string;
  currentQuestion?: number;
  totalQuestions?: number;
  isInstructionsSection: boolean;
}

export const SurveyProgress = ({ 
  progress, 
  currentSection, 
  totalSections, 
  sectionTitle, 
  currentQuestion, 
  totalQuestions,
  isInstructionsSection 
}: SurveyProgressProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Assessment Progress</span>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="mb-2" />
        <div className="text-xs text-gray-500">
          Section {currentSection + 1} of {totalSections}: {sectionTitle}
          {!isInstructionsSection && totalQuestions && currentQuestion !== undefined && 
            ` - Question ${currentQuestion + 1} of ${totalQuestions}`
          }
        </div>
      </CardContent>
    </Card>
  );
};