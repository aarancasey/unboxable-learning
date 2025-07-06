
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';

interface LearnerHeaderProps {
  learnerName: string;
  onLogout: () => void;
}

const LearnerHeader = ({ learnerName, onLogout }: LearnerHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.href = 'https://unboxable.co.nz'}
              className="hover:bg-slate-100 text-unboxable-navy hover:text-unboxable-navy mr-2"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Back to Unboxable</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <img 
              src="/lovable-uploads/d0544c04-760a-4cf9-824c-612e5ef4aeaa.png" 
              alt="Unboxable" 
              className="h-6 sm:h-8"
            />
            <div className="h-6 sm:h-8 w-px bg-gray-300 hidden sm:block"></div>
            <h1 className="text-lg sm:text-xl font-semibold text-unboxable-navy">Learning Portal</h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-xs sm:text-sm text-gray-600 hidden md:inline">Welcome, {learnerName || 'Learner'}</span>
            <span className="text-xs sm:text-sm text-gray-600 md:hidden">{(learnerName || 'Learner').split(' ')[0]}</span>
            <Button variant="ghost" size="sm" onClick={onLogout} className="hover:bg-slate-100 text-unboxable-navy hover:text-unboxable-navy">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LearnerHeader;
