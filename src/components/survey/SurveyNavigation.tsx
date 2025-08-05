import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, Clock } from 'lucide-react';

interface SurveyNavigationProps {
  isFirstItem: boolean;
  isLastItem: boolean;
  isCurrentAnswered: () => boolean;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
}

export const SurveyNavigation = ({
  isFirstItem,
  isLastItem,
  isCurrentAnswered,
  onPrevious,
  onNext,
  onBack,
  onSave,
  isSaving,
  lastSaved
}: SurveyNavigationProps) => {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-8">
      {/* Save Status */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        {isSaving ? (
          <span>Saving...</span>
        ) : lastSaved ? (
          <span>Last saved: {formatLastSaved(lastSaved)}</span>
        ) : (
          <span>Progress will be saved automatically</span>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between bg-card rounded-xl p-6 survey-card-shadow border-0">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 border-primary/20 hover:border-primary hover:bg-primary/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Survey
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 border-unboxable-orange/20 hover:border-unboxable-orange hover:bg-unboxable-orange/5"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Progress'}
          </Button>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onPrevious}
            disabled={isFirstItem}
            className="flex items-center gap-2 px-6 py-3 border-primary/20 hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <Button 
            onClick={onNext}
            disabled={!isCurrentAnswered()}
            className="flex items-center gap-2 px-6 py-3 bg-unboxable-orange hover:bg-unboxable-orange/90 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLastItem ? 'Complete Survey' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};