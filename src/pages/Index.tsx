import { useState } from 'react';
import LearnerDashboard from '@/components/LearnerDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import LoginPage from '@/components/LoginPage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, Users } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import LoginForm from '@/components/login/LoginForm';

const Index = () => {
  const [userRole, setUserRole] = useState<'learner' | 'admin' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [learnerData, setLearnerData] = useState<any>(null);
  const [showLearnerLogin, setShowLearnerLogin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const { trackUserLogin, trackPageView } = useAnalytics();

  const handleLearnerLogin = (userData?: any) => {
    setUserRole('learner');
    setIsAuthenticated(true);
    if (userData) {
      setLearnerData(userData);
    }
    trackUserLogin('learner');
    trackPageView('/dashboard');
    setShowLearnerLogin(false);
  };

  const handleAdminLogin = (userData?: any) => {
    setUserRole('admin');
    setIsAuthenticated(true);
    trackUserLogin('admin');
    trackPageView('/dashboard');
    setIsAdminModalOpen(false);
  };

  const handleLogout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
    setLearnerData(null);
    setShowLearnerLogin(false);
  };

  if (!isAuthenticated) {
    return showLearnerLogin ? (
      <LoginPage 
        role="learner" 
        onLogin={handleLearnerLogin} 
        onBack={() => setShowLearnerLogin(false)} 
      />
    ) : (
      <div className="min-h-screen bg-unboxable-navy flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full text-center space-y-8">
            <div className="space-y-2">
              <img 
                src="/lovable-uploads/d0544c04-760a-4cf9-824c-612e5ef4aeaa.png" 
                alt="Unboxable" 
                className="h-20 mx-auto mb-6 filter brightness-0 invert"
              />
              <p className="text-sm text-white font-medium mb-6">RETHINKING BUSINESS</p>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Sparking the shift<br />
                Inspiring action.
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Learning to help you move forward
              </p>
            </div>

            {/* Learner Access */}
            <div className="pt-8">
              <Card className="max-w-md mx-auto bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all">
                <CardContent className="p-8 text-center">
                  <GraduationCap className="mx-auto h-16 w-16 text-white mb-4" />
                  <h3 className="text-2xl font-semibold mb-3 text-white">Learner Access</h3>
                  <p className="text-white/80 mb-6">Access your courses and complete surveys</p>
                  <Button 
                    onClick={() => setShowLearnerLogin(true)}
                    className="w-full bg-white text-unboxable-navy hover:bg-white/90 font-semibold py-3"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-unboxable-navy/50 backdrop-blur-sm border-t border-white/10 p-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="text-white/60 text-sm">
              © 2024 Unboxable. All rights reserved.
            </div>
            
            <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-white/60 hover:text-white text-sm">
                  Admin Portal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center text-unboxable-navy">Admin Portal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center">
                    <Users className="mx-auto h-12 w-12 text-unboxable-orange mb-3" />
                  </div>
                  <LoginForm role="admin" onLogin={handleAdminLogin} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userRole === 'learner' ? (
        <LearnerDashboard onLogout={handleLogout} learnerData={learnerData} />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Index;
