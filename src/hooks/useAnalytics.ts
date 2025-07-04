import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const useAnalytics = () => {
  const trackEvent = (eventName: string, parameters?: { [key: string]: any }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  };

  const trackPageView = (path: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Replace with your actual GA4 Measurement ID
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_path: path,
      });
    }
    
    // Store page views locally for analytics dashboard
    const pageViews = JSON.parse(localStorage.getItem('pageViews') || '{}');
    pageViews[path] = (pageViews[path] || 0) + 1;
    pageViews.total = (pageViews.total || 0) + 1;
    pageViews.lastVisit = new Date().toISOString();
    localStorage.setItem('pageViews', JSON.stringify(pageViews));
  };

  return {
    trackEvent,
    trackPageView,
    // Learning-specific tracking methods
    trackCourseEnrollment: (courseId: string, courseName: string) => {
      trackEvent('course_enrollment', {
        course_id: courseId,
        course_name: courseName,
      });
    },
    trackModuleStart: (moduleId: string, moduleName: string, courseId: string) => {
      trackEvent('module_start', {
        module_id: moduleId,
        module_name: moduleName,
        course_id: courseId,
      });
    },
    trackModuleComplete: (moduleId: string, moduleName: string, courseId: string) => {
      trackEvent('module_complete', {
        module_id: moduleId,
        module_name: moduleName,
        course_id: courseId,
      });
    },
    trackSurveySubmission: (surveyId: string, surveyType: string) => {
      trackEvent('survey_submission', {
        survey_id: surveyId,
        survey_type: surveyType,
      });
    },
    trackUserLogin: (userRole: string) => {
      trackEvent('login', {
        user_role: userRole,
      });
    },
  };
};