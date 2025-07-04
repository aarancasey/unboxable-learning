import { useState } from 'react';
import { Survey, Question, ScaleGridQuestion } from './types';

export const useSurveyProgress = (survey: Survey) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

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
    handleAnswerChange,
    handleScaleGridChange,
    handleNext,
    handlePrevious
  };
};