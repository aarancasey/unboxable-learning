import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

interface SurveyHeaderProps {
  title: string;
  onBack: () => void;
}

export const SurveyHeader = ({ title, onBack }: SurveyHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-orange-600" />
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};