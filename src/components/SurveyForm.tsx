
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface SurveyFormProps {
  onBack: () => void;
  onSubmit: () => void;
}

const SurveyForm = ({ onBack, onSubmit }: SurveyFormProps) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const survey = {
    title: "Leadership Sentiment, Adaptive and Agile Self-Assessment",
    description: "This self-assessment is designed to help you explore your current leadership sentiment and intent, adaptability and agility. It will give insight into how you currently lead and respond to dynamic conditions, change, make decisions, empower others and lead in complexity.",
    sections: [
      {
        title: "Instructions",
        type: "instructions",
        content: `This pre-assessment in advance of your LEADForward program, is designed to help you reflect on how you lead today, how you're feeling in your leadership role, and where you want to go next. It combines:

• How you feel and experience leadership (Sentiment)
• What drives you and where you're headed (Purpose)  
• How you show up and adapt in complexity (Agility)

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
      },
      {
        title: "Self-Reflection Questions",
        type: "questions",
        description: "Take a moment to reflect on your leadership journey and development.",
        questions: [
          {
            id: "reflection_1",
            type: "text",
            question: "Based on your responses, what patterns do you notice about your current leadership approach?"
          },
          {
            id: "reflection_2", 
            type: "text",
            question: "Which areas of leadership agility feel strongest for you right now?"
          },
          {
            id: "reflection_3",
            type: "text",
            question: "Which areas would you most like to develop further?"
          },
          {
            id: "reflection_4",
            type: "text",
            question: "What's one insight from this assessment that you want to explore more deeply?"
          }
        ]
      }
    ]
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
      const prompts = currentQ.prompts || [];
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
      if (currentSection === totalSections - 1) {
        // Survey complete
        console.log('Survey submitted:', answers);
        onSubmit();
      } else {
        setCurrentSection(currentSection + 1);
        setCurrentQuestion(0);
      }
    } else {
      // Next question in current section
      setCurrentQuestion(currentQuestion + 1);
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

  const renderQuestion = () => {
    if (isInstructionsSection) {
      return (
        <div className="space-y-4">
          <div className="prose max-w-none">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed">
              {currentSectionData.content}
            </div>
          </div>
        </div>
      );
    }

    if (!currentQ) return null;

    switch (currentQ.type) {
      case 'radio':
        return (
          <RadioGroup
            value={answers[currentQ.id] as string || ''}
            onValueChange={(value) => handleAnswerChange(value)}
          >
            {currentQ.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        const selectedOptions = (answers[currentQ.id] as string[]) || [];
        const maxSelections = currentQ.maxSelections;
        
        return (
          <div className="space-y-3">
            {maxSelections && (
              <p className="text-sm text-gray-600 mb-4">
                Select up to {maxSelections} options
              </p>
            )}
            {currentQ.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`checkbox-${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    let newSelection = [...selectedOptions];
                    if (checked) {
                      if (!maxSelections || newSelection.length < maxSelections) {
                        newSelection.push(option);
                      }
                    } else {
                      newSelection = newSelection.filter(item => item !== option);
                    }
                    handleAnswerChange(newSelection);
                  }}
                  disabled={maxSelections && selectedOptions.length >= maxSelections && !selectedOptions.includes(option)}
                />
                <Label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'scale':
        return (
          <RadioGroup
            value={answers[currentQ.id] as string || ''}
            onValueChange={(value) => handleAnswerChange(value)}
          >
            {currentQ.scaleLabels?.map((label, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={(index + 1).toString()} id={`scale-${index}`} />
                <Label htmlFor={`scale-${index}`} className="flex-1 cursor-pointer">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'scale-grid':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-xs text-gray-600 mb-4">
              <div></div>
              <div className="text-center">1<br/>Never</div>
              <div className="text-center">2</div>
              <div className="text-center">3</div>
              <div className="text-center">4</div>
              <div className="text-center">5</div>
              <div className="text-center">6<br/>Always</div>
            </div>
            {currentQ.prompts?.map((prompt, promptIndex) => (
              <div key={promptIndex} className="grid grid-cols-7 gap-2 items-center py-2 border-b border-gray-100">
                <div className="text-sm pr-4">{prompt}</div>
                {[1, 2, 3, 4, 5, 6].map((value) => (
                  <div key={value} className="flex justify-center">
                    <input
                      type="radio"
                      name={`${currentQ.id}_${promptIndex}`}
                      value={value.toString()}
                      checked={answers[`${currentQ.id}_${promptIndex}`] === value.toString()}
                      onChange={(e) => handleScaleGridChange(promptIndex, e.target.value)}
                      className="w-4 h-4 text-orange-600"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <Textarea
            placeholder="Please share your thoughts..."
            value={answers[currentQ.id] as string || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="min-h-[120px]"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-orange-600" />
                <h1 className="text-lg font-semibold text-gray-900">{survey.title}</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Assessment Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mb-2" />
            <div className="text-xs text-gray-500">
              Section {currentSection + 1} of {totalSections}: {currentSectionData.title}
              {!isInstructionsSection && ` - Question ${currentQuestion + 1} of ${totalQuestions}`}
            </div>
          </CardContent>
        </Card>

        {/* Section Description */}
        {currentSectionData.description && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <p className="text-gray-600">{currentSectionData.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Question/Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              {isInstructionsSection ? currentSectionData.title : currentQ?.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderQuestion()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={isFirstItem}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
            {progress === 100 && <CheckCircle className="h-4 w-4 text-green-600" />}
          </div>

          <Button 
            onClick={handleNext}
            disabled={!isCurrentAnswered()}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLastItem ? 'Submit Assessment' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
