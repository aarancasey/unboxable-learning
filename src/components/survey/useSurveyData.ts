import { Survey } from './types';
import { useState, useEffect } from 'react';
import { surveyService } from '@/services/surveyService';

// Create a global state for survey data that can be updated
let globalSurveyData: Survey | null = null;
let subscribers: Set<(survey: Survey) => void> = new Set();

// Function to update global survey data and notify all subscribers
export const updateGlobalSurveyData = (survey: Survey) => {
  globalSurveyData = survey;
  subscribers.forEach(callback => callback(survey));
};

export const useSurveyData = (): Survey => {
  const [survey, setSurvey] = useState<Survey | null>(globalSurveyData);

  useEffect(() => {
    // Add this component to subscribers
    subscribers.add(setSurvey);

    // Load survey if not already loaded
    if (!globalSurveyData) {
      const loadSurvey = async () => {
        try {
          // ALWAYS load from Supabase first, ignore localStorage completely
          const savedSurvey = await surveyService.getActiveSurveyConfiguration();
          if (savedSurvey) {
            updateGlobalSurveyData(savedSurvey);
          } else {
            // Only use default if absolutely nothing in Supabase
            updateGlobalSurveyData(getDefaultSurveyData());
          }
        } catch (error) {
          console.error('Error loading survey data:', error);
          // If Supabase fails, use default (not localStorage)
          updateGlobalSurveyData(getDefaultSurveyData());
        }
      };

      loadSurvey();
    }

    // Cleanup: remove subscriber when component unmounts
    return () => {
      subscribers.delete(setSurvey);
    };
  }, []);

  return survey || getDefaultSurveyData();
};

const getDefaultSurveyData = (): Survey => {
  return {
    title: "Leadership Sentiment, Adaptive and Agile Self-Assessment",
    description: "This self-assessment is designed to help you explore your current leadership sentiment and intent, adaptability and agility. It will give insight into how you currently lead and respond to dynamic conditions, change, make decisions, empower others and lead in complexity.",
    sections: [
      {
        title: "Instructions",
        type: "instructions",
        content: `Leadership Sentiment, Purpose, Adaptive & Agility Self-Assessment (adapted from Joiner and Josephs)

This self-assessment is designed to help you explore your current leadership sentiment and intent, adaptability and agility.

It will give insight into how you currently lead and respond to dynamic conditions, change, make decisions, empower others and lead in complexity.

Why Combine Sentiment, Intent and Leadership Agility?

Most leadership assessments focus only on what leaders do - behaviours, styles, or competencies. But leadership isn't just behavioural. It's also deeply emotional, situational, and purpose driven.

By combining how leaders feel (sentiment), how they lead (adaptive agility), and why they lead (intent and purpose), we'll unlock a far more complete picture of your leadership.

We'll ask questions about your current capabilities, motivation, mindset, and direction - the internal drivers that influence how you show up, adapt, and grow over time as a leader.

This three-part survey creates a richer starting point for personal development, coaching, and programme impact.

It allows you to move from self-awareness to purposeful action - aligned with who you are and the kind of leader you want to become.

This pre-assessment in advance of your LEADForward program, is designed to help you reflect on how you lead today, how you're feeling in your leadership role, and where you want to go next. It combines:

• How you feel and experience leadership (Sentiment)
• What drives you and where you're headed (Purpose)  
• How you show up and adapt in complexity (Agility)

Together, these insights provide a richer, more complete picture of your leadership - one that's both practical and personal and can be used to help shape your leadership journey.

How This Helps:

• At the start of the programme, this provides you an understanding of your leadership that will help both within LEADForward as well as within your coaching sessions.

• This self-assessment survey will be repeated at the end of the LEADForward program and will help show shifts in your mindset, thinking, perspectives and capabilities.

• This self-assessment is to give you a point in time perspective, there are no right wrong answers and is purely to give you a sense of where you are currently at.

Instructions:
Before you complete the full self-assessment, take the opportunity to complete this in a quiet and calm space so that you can fully reflect.

Please answer these questions honestly. There are no right or wrong answers. Your responses will help you build insights and understanding as well as track shifts in mindset and perspective over time.

Your facilitator and coach will have oversight into your responses as this will help inform our leadership and coaching sessions. Your personal responses will not be shared more broadly.`
      },
      {
        title: "Leadership Sentiment Snapshot",
        type: "questions",
        description: "Before we look at your behaviours and capabilities, take a moment to reflect on how you're leading right now.",
        questions: [
          {
            id: "sentiment_1",
            type: "radio",
            question: "How would you describe your current leadership style?",
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
            type: "scale-grid",
            question: "How confident do you feel in your ability to:",
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
            type: "checkbox",
            question: "What best describes your current leadership mindset? (Select all that apply)",
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
            type: "text",
            question: "What feels most challenging in your leadership right now?"
          },
          {
            id: "sentiment_5",
            type: "text",
            question: "What feels most exciting or energising?"
          }
        ]
      },
      {
        title: "Leadership Intent & Purpose",
        type: "questions",
        description: "Leadership is not just about performance - it's about direction, meaning, and impact. These questions help clarify what drives you and what kind of leader you're becoming.",
        questions: [
          {
            id: "purpose_1",
            type: "text",
            question: "What matters most to you as a leader right now?"
          },
          {
            id: "purpose_2",
            type: "checkbox",
            question: "What kind of leader do you aspire to be? (Choose up to three)",
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
            ],
            maxSelections: 3
          },
          {
            id: "purpose_3",
            type: "text",
            question: "What impact do you want your leadership to have - on your team, your department, or the organisation?"
          },
          {
            id: "purpose_4",
            type: "text",
            question: "What's one leadership stretch goal you want to work toward over the next 6–12 months?"
          },
          {
            id: "purpose_5",
            type: "scale",
            question: "How connected do you feel to a sense of purpose in your current role?",
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
        type: "questions",
        description: "Rate each statement from 1 to 6, where: 1 = Never / Not at all true, 6 = Always / Very true",
        questions: [
          {
            id: "agility_change",
            type: "scale-grid",
            question: "Navigating Change & Uncertainty",
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
        type: "questions",
        description: "Rate each statement from 1 to 6, where: 1 = Never / Not at all true, 6 = Always / Very true",
        questions: [
          {
            id: "agility_systems",
            type: "scale-grid",
            question: "Systems Thinking & Strategic Agility",
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
        type: "questions",
        description: "Rate each statement from 1 to 6, where: 1 = Never / Not at all true, 6 = Always / Very true",
        questions: [
          {
            id: "agility_learning",
            type: "scale-grid",
            question: "Learning Agility & Growth Mindset",
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
        type: "questions",
        description: "Rate each statement from 1 to 6, where: 1 = Never / Not at all true, 6 = Always / Very true",
        questions: [
          {
            id: "agility_empowering",
            type: "scale-grid",
            question: "Empowering Others & Building Collective Agility",
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
        type: "questions",
        description: "Rate each statement from 1 to 6, where: 1 = Never / Not at all true, 6 = Always / Very true",
        questions: [
          {
            id: "agility_action",
            type: "scale-grid",
            question: "Action Orientation & Agility in Delivery",
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
        type: "questions",
        description: "Rate each statement from 1 to 6, where: 1 = Never / Not at all true, 6 = Always / Very true",
        questions: [
          {
            id: "agility_decisions",
            type: "scale-grid",
            question: "Decision-Making Agility",
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
      }
    ]
  };
};