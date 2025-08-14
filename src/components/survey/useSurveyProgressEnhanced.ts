import { useState, useEffect, useCallback, useRef } from 'react';
import { Survey, Question, ScaleGridQuestion } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { ParticipantInfo } from './ParticipantInfoForm';

export const useSurveyProgressEnhanced = (survey: Survey) => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveComplete, setSaveComplete] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Activity tracking
  const lastActivityRef = useRef<Date>(new Date());
  const activityTimeoutRef = useRef<NodeJS.Timeout>();
  const autoSaveIntervalRef = useRef<NodeJS.Timeout>();

  // Track user activity
  const updateActivity = useCallback(() => {
    lastActivityRef.current = new Date();
    setHasUnsavedChanges(true);
  }, []);

  // Load saved progress on mount
  useEffect(() => {
    if (user) {
      loadSavedProgress();
    }
  }, [user]);

  // Set up activity tracking and auto-save
  useEffect(() => {
    if (user) {
      // Activity event listeners
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, updateActivity, true);
      });

      // Auto-save every 2 minutes
      autoSaveIntervalRef.current = setInterval(() => {
        if (Object.keys(answers).length > 0 || participantInfo) {
          saveProgress();
        }
      }, 2 * 60 * 1000);

      // Check for inactivity every 30 seconds
      const inactivityChecker = setInterval(() => {
        const now = new Date();
        const timeSinceActivity = now.getTime() - lastActivityRef.current.getTime();
        
        // If inactive for 30 minutes, save and show notification
        if (timeSinceActivity >= 30 * 60 * 1000 && hasUnsavedChanges) {
          saveProgress(true);
          toast.info("Your progress has been saved due to inactivity. You can safely resume later.");
        }
      }, 30 * 1000);

      // Page exit detection
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasUnsavedChanges) {
          // Save progress synchronously
          saveProgressSync();
          // Show warning
          e.preventDefault();
          e.returnValue = '';
        }
      };

      const handlePageHide = () => {
        if (hasUnsavedChanges) {
          saveProgressSync();
        }
      };

      const handleVisibilityChange = () => {
        if (document.hidden && hasUnsavedChanges) {
          saveProgress();
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handlePageHide);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        // Cleanup
        events.forEach(event => {
          document.removeEventListener(event, updateActivity, true);
        });
        
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
        
        if (activityTimeoutRef.current) {
          clearTimeout(activityTimeoutRef.current);
        }
        
        clearInterval(inactivityChecker);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', handlePageHide);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user, answers, participantInfo, hasUnsavedChanges]);

  const loadSavedProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('survey_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('survey_type', 'leadership_assessment')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCurrentSection(data.current_section);
        setCurrentQuestion(data.current_question);
        setAnswers((data.answers as Record<string, string | string[]>) || {});
        setParticipantInfo((data.participant_info as any) || null);
        setLastSaved(new Date(data.updated_at));
        setHasUnsavedChanges(false);
        
        if (data.participant_info || Object.keys(data.answers || {}).length > 0) {
          toast.success("Previous progress restored! You can continue where you left off.");
        }
        
        console.log('Loaded saved survey progress:', data);
      }
    } catch (error) {
      console.error('Failed to load saved progress:', error);
      // Fallback to localStorage
      const localProgress = localStorage.getItem('surveyProgress');
      if (localProgress) {
        const parsed = JSON.parse(localProgress);
        setCurrentSection(parsed.currentSection || 0);
        setCurrentQuestion(parsed.currentQuestion || 0);
        setAnswers(parsed.answers || {});
        setParticipantInfo(parsed.participantInfo || null);
        setHasUnsavedChanges(false);
      }
    }
  };

  const saveProgressSync = () => {
    if (!user) return;
    
    const progressData = {
      user_id: user.id,
      current_section: currentSection,
      current_question: currentQuestion,
      answers,
      participant_info: participantInfo,
      survey_type: 'leadership_assessment'
    };

    // Save to localStorage immediately
    localStorage.setItem('surveyProgress', JSON.stringify(progressData));
    
    // Attempt beacon API for reliable sending
    if ('navigator' in window && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(progressData)], { type: 'application/json' });
      navigator.sendBeacon('/api/save-progress', blob);
    }
  };

  const saveProgress = async (showToast = false) => {
    if (!user) {
      if (showToast) {
        toast.error("Please log in to save your progress.");
      }
      return;
    }
    
    if (isSaving) return;

    setIsSaving(true);
    setSaveComplete(false);
    
    try {
      const progressData = {
        user_id: user.id,
        current_section: currentSection,
        current_question: currentQuestion,
        answers: answers as any,
        participant_info: participantInfo as any,
        survey_type: 'leadership_assessment'
      };

      const { error } = await supabase
        .from('survey_progress')
        .upsert(progressData, { onConflict: 'user_id,survey_type' });

      if (error) throw error;

      // Also save to localStorage as backup
      localStorage.setItem('surveyProgress', JSON.stringify(progressData));

      setLastSaved(new Date());
      setSaveComplete(true);
      setHasUnsavedChanges(false);
      
      if (showToast) {
        toast.success("Progress saved successfully! It's safe to exit and resume later.");
      }
      
      // Reset the "Saved" state after 3 seconds
      setTimeout(() => {
        setSaveComplete(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to save progress:', error);
      
      if (showToast) {
        toast.error("Failed to save progress. Please try again or check your connection.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSavedProgress = async () => {
    if (!user) return;

    try {
      await supabase
        .from('survey_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('survey_type', 'leadership_assessment');
      
      localStorage.removeItem('surveyProgress');
      setHasUnsavedChanges(false);
      console.log('Survey progress deleted');
    } catch (error) {
      console.error('Failed to delete saved progress:', error);
    }
  };

  const totalSections = survey.sections.length;
  const currentSectionData = survey.sections[currentSection];
  const isInstructionsSection = currentSectionData.type === 'instructions';
  const totalQuestions = isInstructionsSection ? 1 : (currentSectionData.questions?.length || 0);
  const currentQ = !isInstructionsSection ? currentSectionData.questions?.[currentQuestion] : null;

  // Calculate overall progress
  let totalCompleted = 0;
  let totalItems = 0;
  
  survey.sections.forEach((section, sectionIndex) => {
    if (section.type === 'instructions') {
      totalItems += 1;
      if (sectionIndex < currentSection) totalCompleted += 1;
    } else {
      totalItems += section.questions?.length || 0;
      if (sectionIndex < currentSection) {
        totalCompleted += section.questions?.length || 0;
      } else if (sectionIndex === currentSection) {
        totalCompleted += currentQuestion;
      }
    }
  });

  const progress = (totalCompleted / totalItems) * 100;

  const handleAnswerChange = (value: string | string[]) => {
    if (currentQ) {
      setAnswers(prev => ({
        ...prev,
        [currentQ.id]: value
      }));
      updateActivity();
    }
  };

  const handleScaleGridChange = (promptIndex: number, value: string) => {
    if (currentQ) {
      const key = `${currentQ.id}_${promptIndex}`;
      setAnswers(prev => ({
        ...prev,
        [key]: value
      }));
      updateActivity();
    }
  };

  const handleParticipantInfoChange = (info: ParticipantInfo) => {
    setParticipantInfo(info);
    updateActivity();
  };

  const isCurrentAnswered = () => {
    if (isInstructionsSection) return true;
    if (!currentQ) return false;

    if (currentQ.type === 'scale-grid') {
      const prompts = (currentQ as ScaleGridQuestion).prompts || [];
      return prompts.every((_, index) => {
        const key = `${currentQ.id}_${index}`;
        return answers[key] && answers[key] !== '';
      });
    } else if (currentQ.type === 'checkbox') {
      const answer = answers[currentQ.id] as string[];
      return answer && answer.length > 0;
    } else {
      const answer = answers[currentQ.id];
      return answer && (typeof answer === 'string' ? answer.trim() !== '' : answer.length > 0);
    }
  };

  const handleNext = () => {
    updateActivity();
    
    if (isInstructionsSection || currentQuestion === totalQuestions - 1) {
      // Move to next section
      if (currentSection < totalSections - 1) {
        setCurrentSection(currentSection + 1);
        setCurrentQuestion(0);
        return false; // Not complete
      } else {
        return true; // Survey complete
      }
    } else {
      // Next question in current section
      setCurrentQuestion(currentQuestion + 1);
      return false; // Not complete
    }
  };

  const handlePrevious = () => {
    updateActivity();
    
    if (currentQuestion === 0) {
      // Go to previous section
      if (currentSection > 0) {
        const prevSection = survey.sections[currentSection - 1];
        setCurrentSection(currentSection - 1);
        setCurrentQuestion(prevSection.type === 'instructions' ? 0 : (prevSection.questions?.length || 1) - 1);
      }
    } else {
      // Previous question in current section
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isLastItem = currentSection === totalSections - 1 && (isInstructionsSection || currentQuestion === totalQuestions - 1);
  const isFirstItem = currentSection === 0 && currentQuestion === 0;

  return {
    currentSection,
    currentQuestion,
    answers,
    participantInfo,
    currentSectionData,
    currentQ,
    isInstructionsSection,
    totalSections,
    totalQuestions,
    progress,
    isLastItem,
    isFirstItem,
    isCurrentAnswered,
    isSaving,
    lastSaved,
    saveComplete,
    hasUnsavedChanges,
    handleAnswerChange,
    handleScaleGridChange,
    handleParticipantInfoChange,
    handleNext,
    handlePrevious,
    saveProgress,
    deleteSavedProgress
  };
};