import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import UnboxableLogo from '@/components/login/UnboxableLogo';
interface SurveyHeaderProps {
  title: string;
  onBack: () => void;
}
export const SurveyHeader = ({
  title,
  onBack
}: SurveyHeaderProps) => {
  return <header className="survey-header-gradient px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img src="/lovable-uploads/ee20533f-0842-485a-a131-07d4bfc223a0.png" alt="unboxable." className="h-10 w-auto" />
            <div className="text-left">
              <h1 className="text-2xl font-montserrat font-bold text-white">LEADForward</h1>
              <p className="text-white/90 text-sm font-montserrat font-bold">Leadership Self Assessment</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10 flex items-center space-x-2 border border-white/20">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>
        
        
      </div>
    </header>;
};