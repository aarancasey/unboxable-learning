import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface SurveyNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  isFirstItem: boolean;
  isLastItem: boolean;
  isCurrentAnswered: boolean;
  progress: number;
}

export const SurveyNavigation = ({ 
  onPrevious, 
  onNext, 
  isFirstItem, 
  isLastItem, 
  isCurrentAnswered, 
  progress 
}: SurveyNavigationProps) => {
  return (
    <div className="flex justify-between items-center bg-card rounded-xl p-6 survey-card-shadow border-0">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        disabled={isFirstItem}
        className="px-8 py-3 text-base border-primary/20 hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </Button>
      
      <div className="flex items-center space-x-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {Math.round(progress)}%
          </div>
          <div className="text-sm text-muted-foreground">Complete</div>
        </div>
        {progress === 100 && (
          <CheckCircle className="h-6 w-6 text-green-600 animate-pulse" />
        )}
      </div>

      <Button 
        onClick={onNext}
        disabled={!isCurrentAnswered}
        className={`px-8 py-3 text-base font-semibold transition-all duration-200 ${
          isLastItem 
            ? 'survey-accent-gradient hover:shadow-lg hover:scale-105' 
            : 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:scale-105'
        } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
      >
        {isLastItem ? 'Submit Assessment' : 'Next'}
      </Button>
    </div>
  );
};