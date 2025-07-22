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
      <div className="min-h-screen bg-unboxable-navy flex flex-col font-montserrat">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Unboxable Logo */}
            <div className="mb-8">
              <img 
                src="/lovable-uploads/fffe52f8-e9ca-4713-9638-169e09e23f57.png" 
                alt="Unboxable" 
                className="h-16 w-auto mx-auto"
              />
            </div>
            
            {/* Main Heading */}
            <div className="space-y-6 mb-12">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight">
                LEAD<br />
                FORWARD<span className="text-unboxable-orange">.</span>
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium">
                Leadership is evolving. What worked yesterday won't always work tomorrow. The future demands more than competence - it calls for clarity, adaptability, and forward-thinking.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => setShowLearnerLogin(true)}
                className="bg-unboxable-orange hover:bg-unboxable-orange/90 text-white font-semibold px-8 py-4 text-lg rounded-lg"
              >
                Start Your Journey →
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-purple-900 font-semibold px-8 py-4 text-lg rounded-lg bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Leadership Program Section */}
        <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-black text-unboxable-navy mb-2 tracking-tight">
              LEADERSHIP PROGRAM
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-unboxable-orange mb-8">
              DOUGLAS PHARMACEUTICALS
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              This isn't about reinventing yourself. It's about rethinking how you lead - using your existing strengths with a sharper focus, a wider lens, and a stronger impact.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-unboxable-navy/50 backdrop-blur-sm border-t border-white/10 p-4 sm:p-6">
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = 'https://unboxable.co.nz'}
                className="text-white/60 hover:text-white text-sm"
              >
                ← Back to Unboxable.co.nz
              </Button>
              <div className="text-white/60 text-xs sm:text-sm text-center sm:text-left">
                © 2024 Unboxable. All rights reserved.
              </div>
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
