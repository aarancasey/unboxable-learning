
import { Button } from '@/components/ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';

interface LearnerHeaderProps {
  learnerName: string;
  onLogout: () => void;
  clientLogo?: string;
  courseName?: string;
}

const LearnerHeader = ({ learnerName, onLogout, clientLogo, courseName }: LearnerHeaderProps) => {
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
            
            <div className="flex items-center space-x-3">
              {/* Client Logo */}
              {clientLogo && (
                <>
                  <img 
                    src={clientLogo} 
                    alt="Client logo" 
                    className="h-6 sm:h-8 max-w-24 object-contain"
                  />
                  <div className="h-6 sm:h-8 w-px bg-gray-300"></div>
                </>
              )}
              
              {/* Unboxable Logo */}
              <img 
                src="/lovable-uploads/c8eb7e6b-35a2-4f41-a9d7-c1dd08c9b30b.png" 
                alt="Unboxable" 
                className="h-6 sm:h-8"
              />
              
              <div className="h-6 sm:h-8 w-px bg-gray-300 hidden sm:block"></div>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-semibold text-unboxable-navy">Learning Portal</h1>
                {courseName && (
                  <span className="text-xs text-gray-500 hidden sm:block">{courseName}</span>
                )}
              </div>
            </div>
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
