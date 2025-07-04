import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SurveyHeader } from './survey/SurveyHeader';
import { SurveyProgress } from './survey/SurveyProgress';
import { SurveyNavigation } from './survey/SurveyNavigation';
import { InstructionsSection } from './survey/InstructionsSection';
import { QuestionRenderer } from './survey/QuestionRenderer';
import { useSurveyData } from './survey/useSurveyData';
import { useSurveyProgress } from './survey/useSurveyProgress';

interface SurveyFormProps {
  onBack: () => void;
  onSubmit: () => void;
}

const SurveyForm = ({ onBack, onSubmit }: SurveyFormProps) => {
  const survey = useSurveyData();
  const {
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
  } = useSurveyProgress(survey);

  const onNextClick = () => {
    const isComplete = handleNext();
    if (isComplete) {
      // Survey complete - save to localStorage
      console.log('Survey submitted:', answers);
      
      // Create survey submission object
      const surveySubmission = {
        id: Date.now(), // Simple ID generation
        title: survey.title,
        learner: "Current User", // In real app, this would come from auth
        department: "Department", // In real app, this would come from user profile
        submittedDate: new Date().toISOString().split('T')[0],
        status: "pending",
        responses: Object.entries(answers).map(([key, value]) => {
          // Find the question for this answer
          let question = "";
          for (const section of survey.sections) {
            if (section.questions) {
              const q = section.questions.find(q => 
                q.id === key || key.startsWith(q.id + '_')
              );
              if (q) {
                if (key.includes('_') && q.type === 'scale-grid') {
                  // Handle scale-grid questions
                  const promptIndex = parseInt(key.split('_')[1]);
                  const scaleGridQ = q as any;
                  question = `${q.question} - ${scaleGridQ.prompts[promptIndex]}`;
                } else {
                  question = q.question;
                }
                break;
              }
            }
          }
          
          return {
            question,
            answer: Array.isArray(value) ? value.join(', ') : value.toString()
          };
        }).filter(response => response.question), // Only include responses with questions
        aiSummary: {
          strengths: [
            "Demonstrates self-awareness in leadership assessment",
            "Shows commitment to professional development",
            "Engages thoughtfully with reflection questions"
          ],
          challenges: [
            "Areas for development identified through self-assessment",
            "Opportunities for growth in leadership agility"
          ],
          recommendations: [
            "Continue with LEADForward program modules",
            "Focus on areas rated lower in self-assessment",
            "Schedule follow-up coaching sessions"
          ],
          overallAssessment: "Completed comprehensive leadership self-assessment showing engagement with personal development. Ready to progress through structured learning modules."
        }
      };

      // Save to localStorage
      const existingSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
      existingSurveys.push(surveySubmission);
      localStorage.setItem('surveySubmissions', JSON.stringify(existingSurveys));

      onSubmit();
    }
  };

  const renderContent = () => {
    if (isInstructionsSection) {
      return <InstructionsSection content={currentSectionData.content || ''} />;
    }

    if (!currentQ) return null;

    return (
      <QuestionRenderer
        question={currentQ}
        answers={answers}
        onAnswerChange={handleAnswerChange}
        onScaleGridChange={handleScaleGridChange}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SurveyHeader title={survey.title} onBack={onBack} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SurveyProgress
          progress={progress}
          currentSection={currentSection}
          totalSections={totalSections}
          sectionTitle={currentSectionData.title}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          isInstructionsSection={isInstructionsSection}
        />

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
            {renderContent()}
          </CardContent>
        </Card>

        <SurveyNavigation
          onPrevious={handlePrevious}
          onNext={onNextClick}
          isFirstItem={isFirstItem}
          isLastItem={isLastItem}
          isCurrentAnswered={isCurrentAnswered()}
          progress={progress}
        />
      </div>
    </div>
  );
};

export default SurveyForm;
