import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SurveyHeader } from './survey/SurveyHeader';
import { SurveyProgress } from './survey/SurveyProgress';
import { SurveyNavigation } from './survey/SurveyNavigation';
import { InstructionsSection } from './survey/InstructionsSection';
import { QuestionRenderer } from './survey/QuestionRenderer';
import { useSurveyData } from './survey/useSurveyData';
import { useSurveyProgress } from './survey/useSurveyProgress';
import { supabase } from '@/integrations/supabase/client';

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

  const onNextClick = async () => {
    const isComplete = handleNext();
    if (isComplete) {
      // Survey complete - save to localStorage
      console.log('Survey submitted:', answers);
      
      // Prepare responses for AI analysis
      const responses = Object.entries(answers).map(([key, value]) => {
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
      }).filter(response => response.question); // Only include responses with questions

      // Generate AI summary
      let aiSummary = {
        currentLeadershipStyle: "Managing, but close to overload",
        confidenceRating: "Developing Confidence (2.5–3.4)",
        strongestArea: "Motivate and align your team",
        focusArea: "Lead through complexity and ambiguity",
        leadershipAspirations: ["Empowering and people-centred", "Strategic and future-focused", "Curious and adaptive"],
        purposeRating: 4,
        agilityLevel: "Achiever",
        topStrengths: ["Action Orientation & Delivery", "Decision-Making Agility", "Empowering Others & Collaboration"],
        developmentAreas: ["Navigating Change & Uncertainty", "Strategic Agility & Systems Thinking", "Learning Agility & Growth Mindset"],
        overallAssessment: "This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making."
      };

      try {
        // Call AI summary generation function
        const { data, error } = await supabase.functions.invoke('generate-leadership-summary', {
          body: {
            surveyResponses: responses,
            surveyTitle: survey.title
          }
        });

        if (error) {
          console.error('Error generating AI summary:', error);
        } else if (data?.aiSummary) {
          aiSummary = data.aiSummary;
          console.log('Generated AI summary:', aiSummary);
        }
      } catch (error) {
        console.error('Failed to generate AI summary:', error);
      }
      
      // Create survey submission object for database (matching schema)
      const surveySubmissionForDB = {
        learner_name: "Current User", // In real app, this would come from auth
        responses,
        status: "pending"
      };

      // Create full survey submission object for localStorage fallback
      const surveySubmission = {
        id: Date.now(), // Simple ID generation
        title: survey.title,
        learner: "Current User", // In real app, this would come from auth
        department: "Department", // In real app, this would come from user profile
        submittedDate: new Date().toISOString().split('T')[0],
        status: "pending",
        responses,
        aiSummary
      };

      // Save to Supabase database
      try {
        const { DataService } = await import('@/services/dataService');
        await DataService.addSurveySubmission(surveySubmissionForDB);
      } catch (error) {
        console.error('Failed to save survey submission:', error);
        // Fallback to localStorage
        const existingSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
        existingSurveys.push(surveySubmission);
        localStorage.setItem('surveySubmissions', JSON.stringify(existingSurveys));
      }

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
