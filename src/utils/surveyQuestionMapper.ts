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

// Static survey data to avoid React hook issues in utility functions
const getSurveyData = () => {
  return {
    sections: [
      {
        title: "About You",
        questions: [
          {
            id: "participant_info",
            question: "Participant Information",
            type: "participant_info"
          }
        ]
      },
      {
        title: "Sentiment Assessment",
        questions: [
          {
            id: "sentiment_1",
            question: "How do you generally feel about your work?",
            type: "scale",
            scaleLabels: ["Very Negative", "Negative", "Somewhat Negative", "Neutral", "Somewhat Positive", "Positive", "Very Positive"]
          },
          {
            id: "sentiment_2",
            question: "How would you rate your experience with each of the following aspects?",
            type: "scale-grid",
            prompts: [
              "Overall job satisfaction",
              "Work-life balance",
              "Career development opportunities",
              "Relationship with manager",
              "Team collaboration",
              "Workload management",
              "Recognition and appreciation",
              "Company culture",
              "Learning and growth opportunities",
              "Autonomy and independence"
            ]
          }
        ]
      },
      {
        title: "Confidence Assessment",
        questions: [
          {
            id: "confidence_1",
            question: "How confident do you feel in your current role?",
            type: "scale",
            scaleLabels: ["Not Confident", "Slightly Confident", "Moderately Confident", "Confident", "Very Confident", "Extremely Confident"]
          },
          {
            id: "confidence_2",
            question: "Rate your confidence level in each of these areas:",
            type: "scale-grid",
            prompts: [
              "Technical skills",
              "Communication skills",
              "Leadership abilities",
              "Problem-solving",
              "Decision making",
              "Time management",
              "Adaptability",
              "Teamwork",
              "Innovation and creativity",
              "Strategic thinking"
            ]
          }
        ]
      },
      {
        title: "Purpose and Engagement",
        questions: [
          {
            id: "purpose_1",
            question: "How clearly do you understand your role's purpose within the organization?",
            type: "scale",
            scaleLabels: ["Very Unclear", "Unclear", "Somewhat Unclear", "Neutral", "Somewhat Clear", "Clear", "Very Clear"]
          },
          {
            id: "purpose_2",
            question: "How would you rate your engagement with:",
            type: "scale-grid",
            prompts: [
              "Daily tasks and responsibilities",
              "Team goals and objectives",
              "Company mission and vision",
              "Professional development",
              "Innovation and improvement initiatives"
            ]
          }
        ]
      },
      {
        title: "Agility and Adaptability",
        questions: [
          {
            id: "agility_1",
            question: "How well do you adapt to changes in your work environment?",
            type: "scale",
            scaleLabels: ["Very Poorly", "Poorly", "Somewhat Poorly", "Neutral", "Somewhat Well", "Well", "Very Well"]
          },
          {
            id: "agility_2",
            question: "Rate your ability to handle:",
            type: "scale-grid",
            prompts: [
              "Unexpected challenges",
              "New technologies or tools",
              "Changing priorities",
              "Feedback and criticism",
              "Ambiguous situations",
              "Fast-paced environments"
            ]
          }
        ]
      },
      {
        title: "Leadership and Growth",
        questions: [
          {
            id: "leadership_1",
            question: "How would you describe your leadership style?",
            type: "radio",
            options: [
              "Directive - I provide clear instructions and expectations",
              "Collaborative - I work closely with others to achieve goals",
              "Supportive - I focus on helping others develop and succeed",
              "Delegative - I give autonomy and trust others to deliver",
              "Adaptive - I adjust my style based on the situation",
              "Still developing my leadership approach"
            ]
          },
          {
            id: "leadership_2",
            question: "What areas of leadership development are most important to you? (Select all that apply)",
            type: "checkbox",
            options: [
              "Strategic thinking and planning",
              "Communication and presentation skills",
              "Team building and motivation",
              "Conflict resolution",
              "Change management",
              "Emotional intelligence",
              "Decision making under pressure",
              "Coaching and mentoring others",
              "Innovation and creative thinking",
              "Cross-functional collaboration"
            ]
          }
        ]
      },
      {
        title: "Additional Feedback",
        questions: [
          {
            id: "feedback_1",
            question: "What is working well in your current role or organization?",
            type: "text"
          },
          {
            id: "feedback_2",
            question: "What challenges are you currently facing?",
            type: "text"
          },
          {
            id: "feedback_3",
            question: "What would you like to see improved or changed?",
            type: "text"
          },
          {
            id: "feedback_4",
            question: "Any additional comments or suggestions?",
            type: "text"
          }
        ]
      }
    ]
  };
};

// Create a mapping of question IDs to their details
export const createQuestionMap = (): QuestionMap => {
  const survey = getSurveyData();
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

        // For scale-grid questions, also create entries for each prompt
        if (question.type === 'scale-grid' && question.prompts) {
          question.prompts.forEach((prompt, index) => {
            const compositeId = `${question.id}_${index}`;
            questionMap[compositeId] = {
              question: prompt,
              section: section.title,
              type: 'scale-grid-item',
              prompts: question.prompts
            };
          });
        }
      });
    }
  });
  
  return questionMap;
};

// Get human-readable question text from ID or question text
export const getQuestionText = (questionId: string): string => {
  const questionMap = createQuestionMap();
  
  // First try direct lookup
  if (questionMap[questionId]) {
    return questionMap[questionId].question;
  }
  
  // Handle composite IDs for scale-grid questions (e.g., "sentiment_2_0")
  const parts = questionId.split('_');
  if (parts.length >= 3) {
    const baseId = parts.slice(0, 2).join('_');
    const promptIndex = parseInt(parts[2]);
    
    const questionData = questionMap[baseId];
    if (questionData?.type === 'scale-grid' && questionData.prompts && promptIndex < questionData.prompts.length) {
      return `${questionData.question}: ${questionData.prompts[promptIndex]}`;
    }
  }
  
  // Try to find by question text in stored responses
  for (const [id, data] of Object.entries(questionMap)) {
    if (data.question === questionId) {
      return data.question;
    }
  }
  
  // Return the original string if it looks like a question
  if (questionId.length > 10 && questionId.includes(' ')) {
    return questionId;
  }
  
  return `Unknown Question (${questionId})`;
};

// Get section name for a question
export const getQuestionSection = (questionId: string): string => {
  const questionMap = createQuestionMap();
  
  // Try direct lookup first
  if (questionMap[questionId]) {
    return questionMap[questionId].section;
  }
  
  // Handle composite IDs
  const baseId = questionId.split('_').slice(0, 2).join('_');
  const questionData = questionMap[baseId];
  
  if (questionData) {
    return questionData.section;
  }
  
  // Try to find by question text
  for (const [id, data] of Object.entries(questionMap)) {
    if (data.question === questionId) {
      return data.section;
    }
  }
  
  return 'Unknown Section';
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