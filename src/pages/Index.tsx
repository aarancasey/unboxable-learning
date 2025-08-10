import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import AuthPage from '@/components/auth/AuthPage';
import AdminDashboard from '@/components/AdminDashboard';
import LearnerDashboard from '@/components/LearnerDashboard';
import LoginPage from '@/components/LoginPage';
import { useAnalytics } from '@/hooks/useAnalytics';
import { DataService } from '@/services/dataService';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-unboxable-navy"></div>
  </div>
);

// AppContent component - main app logic
const AppContent = () => {
  const { user, isLoading } = useAuth();
  const { trackPageView, trackEvent } = useAnalytics();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Authentication and modal states
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [showLearnerLoginModal, setShowLearnerLoginModal] = useState(false);
  const [learnerData, setLearnerData] = useState(null);

  // Determine user role - admin if authenticated via Supabase, learner if has learner data
  const userRole = user ? 'admin' : (learnerData ? 'learner' : null);

  useEffect(() => {
    // Handle learning routes
    const path = location.pathname;
    if (path === '/learning/admin' || path.startsWith('/learning/admin/')) {
      if (!user) {
        setShowAuthPage(true);
      }
    } else if (path === '/learning/dashboard' || path.startsWith('/learning/dashboard/')) {
      if (!learnerData) {
        setShowLearnerLoginModal(true);
      }
    }
    
    trackPageView('app');
  }, [trackPageView, location.pathname, user, learnerData]);

  // Handle learner login
  const handleLearnerLogin = async (loginData: any) => {
    try {
      trackEvent('learner_login', { learner_id: loginData.id });
      setLearnerData(loginData);
      setShowLearnerLoginModal(false);
      navigate('/learning/dashboard');
    } catch (error) {
      console.error('Error during learner login:', error);
    }
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    trackEvent('admin_logout');
    setShowAuthPage(false);
    navigate('/learning');
  };

  // Handle learner logout
  const handleLearnerLogout = () => {
    trackEvent('learner_logout');
    setLearnerData(null);
    navigate('/learning');
  };

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show admin authentication page
  if (showAuthPage && location.pathname.startsWith('/learning/admin')) {
    return (
      <AuthPage 
        onAuthSuccess={() => {
          setShowAuthPage(false);
          navigate('/learning/admin');
        }}
      />
    );
  }

  // Show learner login modal
  if (showLearnerLoginModal && location.pathname.startsWith('/learning/dashboard')) {
    return (
      <LoginPage 
        role="learner"
        onLogin={handleLearnerLogin}
        onBack={() => {
          setShowLearnerLoginModal(false);
          navigate('/learning');
        }}
      />
    );
  }

  // Show admin dashboard for authenticated users on admin routes
  if (userRole === 'admin' && location.pathname.startsWith('/learning/admin')) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  // Show learner dashboard for learners on dashboard routes
  if (userRole === 'learner' && location.pathname.startsWith('/learning/dashboard')) {
    return <LearnerDashboard onLogout={handleLearnerLogout} learnerData={learnerData} />;
  }

  // Redirect to appropriate section based on authentication
  if (location.pathname === '/learning/admin' && !user) {
    setShowAuthPage(true);
    return <LoadingSpinner />;
  }

  if (location.pathname === '/learning/dashboard' && !learnerData) {
    setShowLearnerLoginModal(true);
    return <LoadingSpinner />;
  }

  // Default: redirect to learning portal
  if (location.pathname.startsWith('/learning/')) {
    navigate('/learning');
    return <LoadingSpinner />;
  }

  return <div>Not found</div>;
};

// Main Index component - handles learning routes
const Index = () => {
  return <AppContent />;
};

export default Index;