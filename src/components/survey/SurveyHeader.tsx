import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface SurveyHeaderProps {
  title: string;
  onBack: () => void;
}

export const SurveyHeader = ({ title, onBack }: SurveyHeaderProps) => {
  return (
    <header className="survey-header-gradient px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/10 flex items-center space-x-2 border border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <div className="text-center">
            <div className="text-white text-sm font-medium opacity-90 mb-1">UNBOXABLE</div>
            <div className="text-white/60 text-xs tracking-wider">LEADERSHIP ASSESSMENT</div>
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
            Complete your leadership assessment to help you reflect on your current leadership mindset, sense of purpose and agility.
          </p>
        </div>
      </div>
    </header>
  );
};