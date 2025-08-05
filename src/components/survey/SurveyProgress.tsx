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
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-primary mb-1">
            {sectionTitle}
          </h2>
          <span className="text-sm text-muted-foreground">
            Section {currentSection + 1} of {totalSections}
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">
            {Math.round(progress)}%
          </span>
          <div className="text-sm text-muted-foreground">Complete</div>
        </div>
      </div>
      
      <Progress value={progress} className="h-3 mb-3" />
      
      {!isInstructionsSection && totalQuestions && currentQuestion !== undefined && (
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
      )}
    </div>
  );
};