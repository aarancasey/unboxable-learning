
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LearnerHeaderProps {
  learnerName: string;
  onLogout: () => void;
}

const LearnerHeader = ({ learnerName, onLogout }: LearnerHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/d0544c04-760a-4cf9-824c-612e5ef4aeaa.png" 
              alt="Unboxable" 
              className="h-8"
            />
            <div className="h-8 w-px bg-gray-300"></div>
            <h1 className="text-xl font-semibold text-unboxable-navy">Learning Portal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {learnerName || 'Learner'}</span>
            <Button variant="ghost" size="sm" onClick={onLogout} className="hover:bg-slate-100 text-unboxable-navy hover:text-unboxable-navy">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LearnerHeader;
