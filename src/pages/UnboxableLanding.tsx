import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, BookOpen, Users, Target, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { SettingsService } from '@/services/settingsService';

const UnboxableLanding = () => {
  const { trackPageView, trackEvent } = useAnalytics();
  const [learnMoreSettings, setLearnMoreSettings] = useState({
    visible: true,
    title: 'Learn More',
    description: 'Discover how our leadership development programs can transform your organization.',
    buttonText: 'Explore Programs'
  });

  useEffect(() => {
    trackPageView('landing');
    
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

  const handleLearnMoreClick = () => {
    trackEvent('learn_more_clicked');
    window.open('https://unboxable.co.nz', '_blank');
  };

  const handleLearningPortalClick = () => {
    trackEvent('learning_portal_accessed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-unboxable-orange text-white">
              Leadership Development Platform
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-unboxable-navy mb-6">
              Welcome to <span className="text-unboxable-orange">Unboxable</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your leadership journey with our comprehensive development programs, 
              assessments, and personalized learning experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-unboxable-navy hover:bg-unboxable-navy/90 text-white"
                asChild
                onClick={handleLearningPortalClick}
              >
                <Link to="/learning">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Access Learning Portal
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              
              {learnMoreSettings.visible && (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleLearnMoreClick}
                  className="border-unboxable-navy text-unboxable-navy hover:bg-unboxable-navy hover:text-white"
                >
                  {learnMoreSettings.buttonText}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-unboxable-navy mb-4">
              Comprehensive Leadership Development
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines assessments, learning modules, and personalized coaching 
              to accelerate your leadership growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-unboxable-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-unboxable-orange" />
                </div>
                <CardTitle className="text-unboxable-navy">Leadership Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Comprehensive self-assessment tools to identify your leadership strengths 
                  and development opportunities.
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
                  Interactive courses and modules designed to enhance your leadership 
                  skills and capabilities.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-unboxable-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-unboxable-orange" />
                </div>
                <CardTitle className="text-unboxable-navy">Personalized Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tailored learning paths based on your assessment results and 
                  individual development goals.
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

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img 
                src="/lovable-uploads/c8eb7e6b-35a2-4f41-a9d7-c1dd08c9b30b.png" 
                alt="Unboxable" 
                className="h-6"
              />
              <span className="text-lg font-semibold text-unboxable-navy">Unboxable</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2024 Unboxable. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UnboxableLanding;