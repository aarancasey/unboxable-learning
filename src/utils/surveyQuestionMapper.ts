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
        title: "Instructions",
        questions: []
      },
      {
        title: "Leadership Sentiment Snapshot",
        questions: [
          {
            id: "sentiment_1",
            question: "How would you describe your current leadership style?",
            type: "radio",
            options: [
              "Stuck and or disengaged",
              "Uncertain and reactive", 
              "Managing, but close to overload",
              "Confident but stretched",
              "Calm, focused and consistent",
              "Energised and clear"
            ]
          },
          {
            id: "sentiment_2",
            question: "How confident do you feel in your ability to:",
            type: "scale-grid",
            prompts: [
              "Lead through complexity and ambiguity",
              "Motivate and align your team",
              "Make decisions with pace and clarity",
              "Empower others to take ownership and lead",
              "Balance strategic and operational demands",
              "Create space for learning and experimentation",
              "Stay resilient and maintain personal energy"
            ]
          },
          {
            id: "sentiment_3",
            question: "What best describes your current leadership mindset? (Select all that apply)",
            type: "checkbox",
            options: [
              "I'm in constant problem-solving mode",
              "I'm feeling stretched but staying afloat",
              "I'm navigating change and finding my rhythm",
              "I'm actively exploring how to lead differently",
              "I'm leading with confidence and growing in impact",
              "I'm thriving and evolving as a leader"
            ]
          },
          {
            id: "sentiment_4",
            question: "What feels most challenging in your leadership right now?",
            type: "text"
          },
          {
            id: "sentiment_5",
            question: "What feels most exciting or energising?",
            type: "text"
          }
        ]
      },
      {
        title: "Leadership Intent & Purpose",
        questions: [
          {
            id: "purpose_1",
            question: "What matters most to you as a leader right now?",
            type: "text"
          },
          {
            id: "purpose_2",
            question: "What kind of leader do you aspire to be? (Choose up to three)",
            type: "checkbox",
            options: [
              "Strategic and future-focused",
              "Empowering and people-centred",
              "Bold and transformational",
              "Calm and composed under pressure",
              "Curious and adaptive",
              "Purpose-led and values-driven",
              "High-performing and results-oriented",
              "Trusted and respected across the organisation",
              "Creative and innovative"
            ]
          },
          {
            id: "purpose_3",
            question: "What impact do you want your leadership to have - on your team, your department, or the organisation?",
            type: "text"
          },
          {
            id: "purpose_4",
            question: "What's one leadership stretch goal you want to work toward over the next 6–12 months?",
            type: "text"
          },
          {
            id: "purpose_5",
            question: "How connected do you feel to a sense of purpose in your current role?",
            type: "scale",
            scaleLabels: [
              "I feel disconnected or unclear",
              "I'm going through the motions", 
              "I feel somewhat engaged but not fully aligned",
              "I feel connected and gaining clarity",
              "I feel mostly aligned and on track",
              "I feel deeply purposeful and driven"
            ]
          }
        ]
      },
      {
        title: "Adaptive & Agile Leadership - Navigating Change & Uncertainty",
        questions: [
          {
            id: "agility_change",
            question: "Navigating Change & Uncertainty",
            type: "scale-grid",
            prompts: [
              "I remain calm and constructive during periods of uncertainty",
              "I see change as an opportunity rather than a threat",
              "I adapt quickly when priorities or plans shift",
              "I help others manage emotional responses during times of change",
              "I can balance the need for structure with the need for flexibility",
              "I embrace ambiguity and help others feel comfortable in it",
              "I challenge outdated processes or mindsets, even when it's uncomfortable",
              "I stay focused on outcomes even when the path forward is unclear"
            ]
          }
        ]
      },
      {
        title: "Adaptive & Agile Leadership - Systems Thinking & Strategic Agility",
        questions: [
          {
            id: "agility_systems",
            question: "Systems Thinking & Strategic Agility",
            type: "scale-grid",
            prompts: [
              "I consider how decisions impact multiple parts of the business",
              "I connect immediate actions to long-term strategic goals",
              "I regularly zoom out to view challenges through a system-wide lens",
              "I ask strategic questions that explore beyond the surface of an issue",
              "I factor in future trends when making current decisions",
              "I navigate complexity with a mindset of curiosity, not control",
              "I look for patterns and signals in data and behaviour",
              "I help others connect their work to the bigger picture"
            ]
          }
        ]
      },
      {
        title: "Adaptive & Agile Leadership - Learning Agility & Growth Mindset",
        questions: [
          {
            id: "agility_learning",
            question: "Learning Agility & Growth Mindset",
            type: "scale-grid",
            prompts: [
              "I actively seek feedback, including from those who think differently to me",
              "I regularly reflect on what I've learned and how I can improve",
              "I am open to unlearning habits or approaches that no longer serve me",
              "I explore diverse perspectives and challenge my own assumptions",
              "I invest time in developing new capabilities, even when I'm busy",
              "I encourage experimentation and view failure as part of learning",
              "I stay curious, especially when faced with something unfamiliar",
              "I role-model continuous learning for my team or peers"
            ]
          }
        ]
      },
      {
        title: "Adaptive & Agile Leadership - Empowering Others & Building Collective Agility",
        questions: [
          {
            id: "agility_empowering",
            question: "Empowering Others & Building Collective Agility",
            type: "scale-grid",
            prompts: [
              "I trust others to take ownership of outcomes",
              "I foster open dialogue, even when it involves disagreement",
              "I encourage my team to challenge me and offer alternative ideas",
              "I create an environment where people feel safe to take risks",
              "I prioritise relationships and collaboration over control",
              "I share decision-making authority where appropriate",
              "I coach others to solve problems, rather than solve them for them",
              "I intentionally build diversity of thought into how we work"
            ]
          }
        ]
      },
      {
        title: "Adaptive & Agile Leadership - Action Orientation & Agility in Delivery",
        questions: [
          {
            id: "agility_action",
            question: "Action Orientation & Agility in Delivery",
            type: "scale-grid",
            prompts: [
              "I take action without waiting for all the information to be perfect",
              "I make trade-offs and prioritise what matters most",
              "I iterate quickly, learning and adjusting along the way",
              "I balance immediate needs with long-term outcomes",
              "I ensure clarity of outcomes while remaining flexible in how we achieve them",
              "I remove barriers that prevent others from moving quickly",
              "I focus more on learning and delivery than on perfection",
              "I help others stay focused on impact rather than getting stuck in process"
            ]
          }
        ]
      },
      {
        title: "Adaptive & Agile Leadership - Decision-Making Agility",
        questions: [
          {
            id: "agility_decisions",
            question: "Decision-Making Agility",
            type: "scale-grid",
            prompts: [
              "I make decisions without needing perfect information",
              "I balance speed and reflection when deciding",
              "I seek input from others when decisions affect them or the wider system",
              "I know when to be decisive and when to pause or re-evaluate",
              "I'm willing to change direction when new insights emerge",
              "I use both data and intuition when making choices",
              "I clarify decision rights so others know when and how to act",
              "I learn from past decisions to improve future thinking"
            ]
          }
        ]
      },
      {
        title: "Self-Reflection Questions",
        questions: [
          {
            id: "reflection_1",
            question: "Based on your responses, what patterns do you notice about your current leadership approach?",
            type: "text"
          },
          {
            id: "reflection_2", 
            question: "Which areas of leadership agility feel strongest for you right now?",
            type: "text"
          },
          {
            id: "reflection_3",
            question: "Which areas would you most like to develop further?",
            type: "text"
          },
          {
            id: "reflection_4",
            question: "What's one insight from this assessment that you want to explore more deeply?",
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