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
    <div className="flex justify-between items-center">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        disabled={isFirstItem}
      >
        Previous
      </Button>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">
          {Math.round(progress)}% Complete
        </span>
        {progress === 100 && <CheckCircle className="h-4 w-4 text-green-600" />}
      </div>

      <Button 
        onClick={onNext}
        disabled={!isCurrentAnswered}
        className="bg-orange-600 hover:bg-orange-700"
      >
        {isLastItem ? 'Submit Assessment' : 'Next'}
      </Button>
    </div>
  );
};