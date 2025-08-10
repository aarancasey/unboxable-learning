import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const isLearningSection = location.pathname.startsWith('/learning');

  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/c8eb7e6b-35a2-4f41-a9d7-c1dd08c9b30b.png" 
                  alt="Unboxable" 
                  className="h-4 sm:h-6"
                />
                <span className="text-lg sm:text-xl font-semibold text-unboxable-navy">Unboxable</span>
              </Link>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Button 
                variant={isLearningSection ? "default" : "ghost"}
                size="sm"
                asChild
                className="hover:bg-unboxable-navy/10 text-unboxable-navy hover:text-unboxable-navy"
              >
                <Link to="/learning">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Learning
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};