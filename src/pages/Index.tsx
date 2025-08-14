import { useState, useEffect } from 'react';
import LearnerDashboard from '@/components/LearnerDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import LoginPage from '@/components/LoginPage';
import PasswordCreationPage from '@/components/PasswordCreationPage';
import AuthPage from '@/components/auth/AuthPage';
import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, Users, LogOut } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import LoginForm from '@/components/login/LoginForm';
import { User, Session } from '@supabase/supabase-js';
import { SettingsService } from '@/services/settingsService';


const AppContent = () => {
  const [learnerData, setLearnerData] = useState<any>(null);
  const [showLearnerLogin, setShowLearnerLogin] = useState(false);
  const [pendingPasswordCreation, setPendingPasswordCreation] = useState(null);
  const [learnMoreSettings, setLearnMoreSettings] = useState({
    enabled: false,
    title: 'Learn More About Our Program',
    content: ''
  });
  const [isLearnMoreModalOpen, setIsLearnMoreModalOpen] = useState(false);
  const { user, session, signOut, isLoading } = useAuth();
  const { trackUserLogin, trackPageView } = useAnalytics();

  // Determine user role and authentication status from Supabase auth
  const isAuthenticated = !!user && !!session;
  const userRole = learnerData ? 'learner' : (isAuthenticated ? 'admin' : null);

  // Check if authenticated user is a learner and fetch their data
  useEffect(() => {
    const checkLearnerStatus = async () => {
      if (isAuthenticated && user?.email && !learnerData && !pendingPasswordCreation) {
        try {
          // Import DataService to check if user is a learner
          const { DataService } = await import('@/services/dataService');
          const learners = await DataService.getLearners();
          const learner = learners.find(l => l.email.toLowerCase() === user.email.toLowerCase());
          
          if (learner) {
            // Check if the learner requires a password change
            if (learner.requires_password_change) {
              setPendingPasswordCreation(learner);
            } else {
              setLearnerData(learner);
              trackUserLogin('learner');
              trackPageView('/dashboard');
            }
          }
        } catch (error) {
          console.error('Error checking learner status:', error);
        }
      }
    };

    checkLearnerStatus();
  }, [isAuthenticated, user?.email, learnerData, pendingPasswordCreation, trackUserLogin, trackPageView]);

  // Load Learn More settings
  useEffect(() => {
    const loadLearnMoreSettings = async () => {
      try {
        const settings = await SettingsService.getLearnMoreSettings();
        setLearnMoreSettings(settings);
      } catch (error) {
        console.error('Error loading learn more settings:', error);
      }
    };
    loadLearnMoreSettings();
  }, []);

  const handleLearnerLogin = (userData?: any, requiresPasswordChange?: boolean) => {
    if (userData) {
      if (requiresPasswordChange) {
        // Don't set learnerData yet, show password creation first
        setPendingPasswordCreation(userData);
        setShowLearnerLogin(false);
      } else {
        setLearnerData(userData);
        trackUserLogin('learner');
        trackPageView('/dashboard');
        setShowLearnerLogin(false);
      }
    } else {
      setShowLearnerLogin(false);
    }
  };

  const handlePasswordCreated = (userData: any) => {
    setPendingPasswordCreation(null);
    setLearnerData(userData);
    trackUserLogin('learner');
    trackPageView('/dashboard');
  };

  const handleBackToLogin = () => {
    setPendingPasswordCreation(null);
    setShowLearnerLogin(true);
  };

  const handleAdminLogin = () => {
    // Admin access is now controlled by Supabase auth
    // If user is authenticated, they have admin access
    if (isAuthenticated) {
      trackUserLogin('admin');
      trackPageView('/dashboard');
    }
  };

  const handleLogout = async () => {
    console.log('Index: Logout requested...');
    try {
      if (user) {
        await signOut();
      }
      // Always clear local state
      setLearnerData(null);
      setShowLearnerLogin(false);
      console.log('Index: Logout completed successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if signOut fails
      setLearnerData(null);
      setShowLearnerLogin(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-unboxable-navy">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-unboxable-orange"></div>
      </div>
    );
  }

  // Show authentication page if not authenticated and trying to access admin
  if (!isAuthenticated && !showLearnerLogin) {
    // Check if this is an admin access attempt
    const isAdminAccess = new URLSearchParams(window.location.search).get('admin') === 'true';
    if (isAdminAccess) {
      return <AuthPage onAuthSuccess={(authUser: User, authSession: Session) => {
        trackUserLogin('admin');
        trackPageView('/dashboard');
        console.log('Admin authenticated via Supabase:', authUser.email);
        // Clear the admin parameter after successful login
        window.history.replaceState({}, '', '/');
      }} />;
    }
  }


  // Show password creation page for first-time users
  if (pendingPasswordCreation) {
    return (
      <PasswordCreationPage
        learnerData={pendingPasswordCreation}
        onPasswordCreated={handlePasswordCreated}
        onBack={handleBackToLogin}
      />
    );
  }

  if (!isAuthenticated && !learnerData) {
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
            {/* Sign out button for authenticated users */}
            {user && (
              <div className="absolute top-4 right-4">
                <Button 
                  variant="outline" 
                  onClick={handleLogout} 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            )}
            
            {/* Unboxable Logo */}
            <div className="mb-8">
              <img 
                src="/lovable-uploads/fffe52f8-e9ca-4713-9638-169e09e23f57.png" 
                alt="Unboxable" 
                className="h-16 w-auto mx-auto"
              />
            </div>
            
            {/* Welcome message for authenticated users */}
            {user && (
              <div className="mb-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-white/90 text-lg">
                  Welcome back, {user.email}! You now have full access to admin features including the content library.
                </p>
              </div>
            )}
            
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                onClick={() => setShowLearnerLogin(true)}
                className="bg-unboxable-orange hover:bg-unboxable-orange/90 text-white font-semibold px-8 py-4 text-lg rounded-lg"
              >
                Start Your Journey →
              </Button>
              {learnMoreSettings.enabled && learnMoreSettings.content && (
                <Button 
                  variant="outline"
                  onClick={() => setIsLearnMoreModalOpen(true)}
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-900 font-semibold px-8 py-4 text-lg rounded-lg bg-transparent"
                >
                  Learn More
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Leadership Program Section */}
        <div className="bg-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-black text-unboxable-navy mb-2 tracking-tight">
              LEADERSHIP PROGRAM
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-unboxable-orange mb-8">
              DOUGLAS
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              This isn't about reinventing yourself. It's about rethinking how you lead - using your existing strengths with a sharper focus, a wider lens, and a stronger impact.
            </p>
          </div>
        </div>

        {/* Learn More Modal */}
        <Dialog open={isLearnMoreModalOpen} onOpenChange={setIsLearnMoreModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-unboxable-navy">
                {learnMoreSettings.title}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground leading-relaxed">
                {learnMoreSettings.content}
              </p>
            </div>
          </DialogContent>
        </Dialog>

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
            
            {user ? (
              <Button 
                variant="ghost" 
                className="text-white/60 hover:text-white text-sm" 
                onClick={handleAdminLogin}
              >
                Admin Dashboard
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                className="text-white/60 hover:text-white text-sm"
                onClick={() => window.location.href = '/?admin=true'}
              >
                Admin Portal
              </Button>
            )}
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

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
