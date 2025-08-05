import { useState, useEffect } from 'react';
import { Survey, Question, ScaleGridQuestion } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

export const useSurveyProgress = (survey: Survey) => {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load saved progress on mount
  useEffect(() => {
    if (user) {
      loadSavedProgress();
    }
  }, [user]);

  // Auto-save every 2 minutes
  useEffect(() => {
    if (user && Object.keys(answers).length > 0) {
      const interval = setInterval(() => {
        saveProgress();
      }, 2 * 60 * 1000); // 2 minutes

      return () => clearInterval(interval);
    }
  }, [user, answers, currentSection, currentQuestion]);

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
        setLastSaved(new Date(data.updated_at));
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
      }
    }
  };

  const saveProgress = async (showToast = false) => {
    if (!user || isSaving) return;

    setIsSaving(true);
    
    try {
      const progressData = {
        user_id: user.id,
        current_section: currentSection,
        current_question: currentQuestion,
        answers,
        survey_type: 'leadership_assessment'
      };

      const { error } = await supabase
        .from('survey_progress')
        .upsert(progressData, { onConflict: 'user_id,survey_type' });

      if (error) throw error;

      setLastSaved(new Date());
      
      // Also save to localStorage as backup
      localStorage.setItem('surveyProgress', JSON.stringify(progressData));
      
      if (showToast) {
        toast({
          title: "Success",
          description: "Progress saved successfully! It's now safe to exit the survey.",
        });
      }
      
      console.log('Survey progress saved');
    } catch (error) {
      console.error('Failed to save progress:', error);
      // Fallback to localStorage only
      localStorage.setItem('surveyProgress', JSON.stringify({
        currentSection,
        currentQuestion,
        answers
      }));
      
      if (showToast) {
        toast({
          title: "Warning",
          description: "Failed to save to cloud, but saved locally. It's safe to exit the survey.",
          variant: "destructive"
        });
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
    }
  };

  const handleScaleGridChange = (promptIndex: number, value: string) => {
    if (currentQ) {
      const key = `${currentQ.id}_${promptIndex}`;
      setAnswers(prev => ({
        ...prev,
        [key]: value
      }));
    }
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
    handleAnswerChange,
    handleScaleGridChange,
    handleNext,
    handlePrevious,
    saveProgress,
    deleteSavedProgress
  };
};