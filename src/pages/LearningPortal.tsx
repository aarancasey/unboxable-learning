import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, BookOpen, Users, Target, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { SettingsService } from '@/services/settingsService';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/components/auth/AuthProvider';

const LearningPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackPageView, trackEvent } = useAnalytics();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRole, setLoginRole] = useState<'learner' | 'admin'>('learner');
  const [learnMoreSettings, setLearnMoreSettings] = useState({
    visible: true,
    title: 'Learn More',
    description: 'Discover how our leadership development programs can transform your organization.',
    buttonText: 'Explore Programs'
  });

  useEffect(() => {
    trackPageView('learning-portal');
    
    // Load learn more settings
    const loadSettings = async () => {
      try {
        const settings = await SettingsService.getLearnMoreSettings();
        if (settings) {
          setLearnMoreSettings({
            visible: settings.enabled,
            title: settings.title,
            description: settings.content,
            buttonText: 'Explore Programs'
          });
        }
      } catch (error) {
        console.error('Error loading learn more settings:', error);
      }
    };
    
    loadSettings();
  }, [trackPageView]);

  // Redirect authenticated users to their dashboards
  useEffect(() => {
    if (user) {
      navigate('/learning/admin');
    }
  }, [user, navigate]);

  const handleLearnMoreClick = () => {
    trackEvent('learn_more_clicked');
    window.open('https://unboxable.co.nz', '_blank');
  };

  const handleLearnerLogin = () => {
    trackEvent('learner_login_clicked');
    setLoginRole('learner');
    setShowLoginModal(true);
  };

  const handleAdminLogin = () => {
    trackEvent('admin_login_clicked');
    setLoginRole('admin');
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (userData?: any) => {
    setShowLoginModal(false);
    if (loginRole === 'admin') {
      navigate('/learning/admin');
    } else {
      navigate('/learning/dashboard');
    }
  };

  if (showLoginModal) {
    return (
      <LoginPage 
        role={loginRole}
        onLogin={handleLoginSuccess}
        onBack={() => setShowLoginModal(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Back to Main Site */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="hover:bg-slate-100 text-unboxable-navy hover:text-unboxable-navy"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main Site
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-unboxable-orange text-white">
              Leadership Development Portal
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-unboxable-navy mb-6">
              <span className="text-unboxable-orange">Learning</span> Portal
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Access your personalized leadership assessments, learning modules, 
              and development programs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-unboxable-navy hover:bg-unboxable-navy/90 text-white"
                onClick={handleLearnerLogin}
              >
                <Users className="h-5 w-5 mr-2" />
                Learner Access
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleAdminLogin}
                className="border-unboxable-navy text-unboxable-navy hover:bg-unboxable-navy hover:text-white"
              >
                Admin Portal
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-unboxable-navy mb-4">
              Your Leadership Development Journey
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our integrated platform provides everything you need to accelerate 
              your leadership growth and development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-unboxable-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-unboxable-orange" />
                </div>
                <CardTitle className="text-unboxable-navy">LEADForward Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Complete your personalized leadership assessment to identify 
                  strengths and development opportunities.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-unboxable-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-unboxable-orange" />
                </div>
                <CardTitle className="text-unboxable-navy">Learning Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access curated learning content and modules tailored to your 
                  development needs and goals.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-unboxable-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-unboxable-orange" />
                </div>
                <CardTitle className="text-unboxable-navy">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Monitor your learning progress and see how your leadership 
                  capabilities are developing over time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Learn More Section */}
      {learnMoreSettings.visible && (
        <section className="py-16 bg-gradient-to-r from-unboxable-navy to-unboxable-navy/90">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {learnMoreSettings.title}
            </h2>
            <p className="text-lg text-white/90 mb-8">
              {learnMoreSettings.description}
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleLearnMoreClick}
              className="bg-unboxable-orange hover:bg-unboxable-orange/90 text-white"
            >
              <Zap className="h-5 w-5 mr-2" />
              {learnMoreSettings.buttonText}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default LearningPortal;