import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, Clock, Check } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

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
  saveComplete: boolean;
  isSubmitting?: boolean;
  submissionComplete?: boolean;
  learnerName?: string;
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
  lastSaved,
  saveComplete,
  isSubmitting = false,
  submissionComplete = false,
  learnerName
}: SurveyNavigationProps) => {
  const { user } = useAuth();
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
      {/* Completion Message */}
      {submissionComplete && learnerName && (
        <div className="mb-4 p-6 bg-gradient-to-r from-unboxable-navy to-unboxable-orange rounded-lg text-white">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Assessment Complete!</h3>
            <p className="text-lg">
              Thank you, <span className="font-bold">{learnerName}</span>, for completing your LEADForward Assessment.
            </p>
            <p className="text-sm opacity-90 mt-2">
              Your responses have been submitted and you will receive your results soon.
            </p>
          </div>
        </div>
      )}

      {/* Save Success Message */}
      {saveComplete && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fade-in">
          <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-green-800 font-semibold">Progress Saved Successfully!</p>
            <p className="text-green-700 text-sm">Your answers have been saved. It's safe to exit the survey and return later.</p>
          </div>
        </div>
      )}

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
            disabled={!user || isSaving || saveComplete}
            title={!user ? "Please log in to save progress" : ""}
            className={`flex items-center gap-2 px-6 py-3 transition-all duration-300 ${
              saveComplete 
                ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-50 hover:border-green-500' 
                : !user
                ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'border-unboxable-orange/20 hover:border-unboxable-orange hover:bg-unboxable-orange/5'
            }`}
          >
            {saveComplete ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Saved ✓
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {!user ? 'Login to Save' : isSaving ? 'Saving...' : 'Save Progress'}
              </>
            )}
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
            disabled={!isCurrentAnswered() || isSubmitting || submissionComplete}
            className="flex items-center gap-2 px-6 py-3 bg-unboxable-orange hover:bg-unboxable-orange/90 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? 'Submitting...' : submissionComplete ? 'Survey Complete' : isLastItem ? 'Complete Survey' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};