import { Progress } from '@/components/ui/progress';

interface SurveyProgressIndicatorProps {
  currentSection: number;
  totalSections: number;
  currentQuestion: number;
  totalQuestions: number;
  className?: string;
}

const SurveyProgressIndicator = ({ 
  currentSection, 
  totalSections, 
  currentQuestion, 
  totalQuestions,
  className 
}: SurveyProgressIndicatorProps) => {
  // Calculate overall progress percentage
  const calculateProgress = () => {
    if (totalSections === 0 || totalQuestions === 0) return 0;
    
    // Weight sections and questions equally
    const sectionProgress = (currentSection / totalSections) * 50;
    const questionProgress = (currentQuestion / totalQuestions) * 50;
    
    return Math.min(100, Math.round(sectionProgress + questionProgress));
  };

  const progress = calculateProgress();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Survey Progress</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Section {currentSection}/{totalSections}</span>
        <span>Question {currentQuestion}/{totalQuestions}</span>
      </div>
    </div>
  );
};

export default SurveyProgressIndicator;