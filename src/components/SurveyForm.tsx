
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText } from 'lucide-react';

interface SurveyFormProps {
  onBack: () => void;
  onSubmit: () => void;
}

const SurveyForm = ({ onBack, onSubmit }: SurveyFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const mockSurvey = {
    title: "Communication Skills Assessment",
    description: "This survey helps us understand your communication preferences and identify areas for improvement.",
    questions: [
      {
        id: 1,
        type: "multiple-choice",
        question: "How comfortable are you with public speaking?",
        options: [
          "Very comfortable - I enjoy speaking to large groups",
          "Somewhat comfortable - I can do it when needed",
          "Neutral - It depends on the situation",
          "Somewhat uncomfortable - I prefer to avoid it",
          "Very uncomfortable - I find it very stressful"
        ]
      },
      {
        id: 2,
        type: "multiple-choice",
        question: "Which communication style do you prefer in team meetings?",
        options: [
          "Direct and to-the-point",
          "Collaborative and discussion-focused",
          "Structured with clear agenda",
          "Informal and flexible",
          "Listen more than speak"
        ]
      },
      {
        id: 3,
        type: "text",
        question: "Describe a recent situation where you had to communicate complex information to a colleague. How did you approach it?"
      },
      {
        id: 4,
        type: "multiple-choice",
        question: "What's your biggest challenge in workplace communication?",
        options: [
          "Speaking up in meetings",
          "Giving feedback to peers",
          "Presenting to leadership",
          "Resolving conflicts",
          "Writing clear emails"
        ]
      },
      {
        id: 5,
        type: "text",
        question: "What communication skills would you most like to improve, and why?"
      }
    ]
  };

  const progress = ((currentQuestion + 1) / mockSurvey.questions.length) * 100;
  const currentQ = mockSurvey.questions[currentQuestion];

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < mockSurvey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Simulate AI processing
      console.log('Survey submitted:', answers);
      onSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isAnswered = answers[currentQ.id] && answers[currentQ.id].trim() !== '';
  const isLastQuestion = currentQuestion === mockSurvey.questions.length - 1;

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
                <h1 className="text-lg font-semibold text-gray-900">{mockSurvey.title}</h1>
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
              <span className="text-sm font-medium text-gray-600">Survey Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mb-2" />
            <div className="text-xs text-gray-500">
              Question {currentQuestion + 1} of {mockSurvey.questions.length}
            </div>
          </CardContent>
        </Card>

        {/* Survey Description (first question only) */}
        {currentQuestion === 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <p className="text-gray-600">{mockSurvey.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQ.type === 'multiple-choice' ? (
              <RadioGroup
                value={answers[currentQ.id] || ''}
                onValueChange={handleAnswerChange}
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
            ) : (
              <Textarea
                placeholder="Please share your thoughts..."
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="min-h-[120px]"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {mockSurvey.questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentQuestion ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button 
            onClick={handleNext}
            disabled={!isAnswered}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLastQuestion ? 'Submit Survey' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
