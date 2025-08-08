import { useSurveyData } from '../components/survey/useSurveyData';
import { Question } from '../components/survey/types';

interface QuestionMap {
  [key: string]: {
    question: string;
    section: string;
    type: string;
    options?: string[];
    prompts?: string[];
    scaleLabels?: string[];
  };
}

// Create a mapping of question IDs to their details
export const createQuestionMap = (): QuestionMap => {
  const survey = useSurveyData();
  const questionMap: QuestionMap = {};
  
  survey.sections.forEach((section) => {
    if (section.questions) {
      section.questions.forEach((question: Question) => {
        questionMap[question.id] = {
          question: question.question,
          section: section.title,
          type: question.type,
          ...(question.type === 'radio' || question.type === 'checkbox' ? { options: question.options } : {}),
          ...(question.type === 'scale-grid' ? { prompts: question.prompts } : {}),
          ...(question.type === 'scale' ? { scaleLabels: question.scaleLabels } : {}),
        };
      });
    }
  });
  
  return questionMap;
};

// Get human-readable question text from ID
export const getQuestionText = (questionId: string): string => {
  const questionMap = createQuestionMap();
  
  // Handle composite IDs for scale-grid questions (e.g., "sentiment_2_0")
  const baseId = questionId.split('_').slice(0, 2).join('_');
  const promptIndex = questionId.includes('_') ? parseInt(questionId.split('_')[2]) : null;
  
  const questionData = questionMap[baseId];
  
  if (!questionData) {
    return `Unknown Question (${questionId})`;
  }
  
  // For scale-grid questions with specific prompts
  if (questionData.type === 'scale-grid' && promptIndex !== null && questionData.prompts) {
    const prompt = questionData.prompts[promptIndex];
    return prompt ? `${questionData.question}: ${prompt}` : questionData.question;
  }
  
  return questionData.question;
};

// Get section name for a question
export const getQuestionSection = (questionId: string): string => {
  const questionMap = createQuestionMap();
  const baseId = questionId.split('_').slice(0, 2).join('_');
  const questionData = questionMap[baseId];
  
  return questionData?.section || 'Unknown Section';
};

// Format answer based on question type
export const formatAnswer = (questionId: string, answer: any): string => {
  const questionMap = createQuestionMap();
  const baseId = questionId.split('_').slice(0, 2).join('_');
  const questionData = questionMap[baseId];
  
  if (!questionData) {
    return Array.isArray(answer) ? answer.join(', ') : String(answer);
  }
  
  // For scale questions, convert number to readable scale
  if (questionData.type === 'scale' && questionData.scaleLabels && typeof answer === 'number') {
    const index = answer - 1; // Scale is 1-based, array is 0-based
    return questionData.scaleLabels[index] || `Rating: ${answer}`;
  }
  
  // For scale-grid questions, show the rating
  if (questionData.type === 'scale-grid' && typeof answer === 'number') {
    return `Rating: ${answer}/6`;
  }
  
  // For multiple choice, join array
  if (Array.isArray(answer)) {
    return answer.join(', ');
  }
  
  return String(answer);
};