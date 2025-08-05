import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SurveyHeader } from './survey/SurveyHeader';
import { SurveyProgress } from './survey/SurveyProgress';
import { SurveyNavigation } from './survey/SurveyNavigation';
import { InstructionsSection } from './survey/InstructionsSection';
import { QuestionRenderer } from './survey/QuestionRenderer';
import { ParticipantInfoForm, ParticipantInfo } from './survey/ParticipantInfoForm';
import { useSurveyData } from './survey/useSurveyData';
import { useSurveyProgress } from './survey/useSurveyProgress';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

interface SurveyFormProps {
  onBack: () => void;
  onSubmit: () => void;
  learnerData?: any;
}

const SurveyForm = ({ onBack, onSubmit, learnerData }: SurveyFormProps) => {
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null);
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
    isSaving,
    lastSaved,
    handleAnswerChange,
    handleScaleGridChange,
    handleNext,
    handlePrevious,
    saveProgress,
    deleteSavedProgress
  } = useSurveyProgress(survey);

  const handleParticipantInfoComplete = (data: ParticipantInfo) => {
    setParticipantInfo(data);
  };

  const handleManualSave = () => {
    saveProgress(true); // Show toast for manual save
  };

  const onNextClick = async () => {
    const isComplete = handleNext();
    if (isComplete) {
      try {
        // Survey complete - save final submission and delete progress
        console.log('Survey submitted:', answers);

        // Get the participant info from the survey state if available
        let finalParticipantInfo = participantInfo;
        
        // If no participant info from form, try to extract from learnerData
        if (!finalParticipantInfo && learnerData) {
          finalParticipantInfo = {
            fullName: learnerData.first_name && learnerData.last_name 
              ? `${learnerData.first_name} ${learnerData.last_name}` 
              : learnerData.email || '',
            date: new Date().toISOString().split('T')[0],
            company: learnerData.company || '',
            businessArea: learnerData.department || '',
            role: learnerData.role || ''
          };
        }

        // Generate AI summary using the edge function
        const { data: summaryData, error: summaryError } = await supabase.functions.invoke('generate-leadership-summary', {
          body: {
            answers,
            participantInfo: finalParticipantInfo
          }
        });

        if (summaryError) {
          console.error('Failed to generate AI summary:', summaryError);
        }

        // Create full survey submission object for localStorage
        const submissionData = {
          id: crypto.randomUUID(),
          participantInfo: finalParticipantInfo,
          answers,
          submittedAt: new Date().toISOString(),
          status: 'completed',
          learnerId: learnerData?.id,
          learnerName: learnerData?.first_name && learnerData?.last_name 
            ? `${learnerData.first_name} ${learnerData.last_name}` 
            : learnerData?.email,
          ...(summaryData && { aiSummary: summaryData })
        };

        // Always save to localStorage first as primary storage
        const existingSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
        existingSurveys.push(submissionData);
        localStorage.setItem('surveySubmissions', JSON.stringify(existingSurveys));
        console.log('Survey saved to localStorage successfully');

        // Try to save to database as backup
        try {
          const { error: dbError } = await supabase
            .from('survey_submissions')
            .insert([{
              learner_id: learnerData?.id || null,
              learner_name: finalParticipantInfo?.fullName || 'Unknown User',
              responses: submissionData as any, // Cast to Json type
              status: 'completed'
            }]);
          
          if (!dbError) {
            console.log('Survey also saved to database');
          }
        } catch (error) {
          console.warn('Database save failed, but survey is saved locally:', error);
        }

        // Delete the progress since survey is complete
        await deleteSavedProgress();
        
        onSubmit();
      } catch (error) {
        console.error('Error submitting survey:', error);
        // Still call onSubmit to proceed even if there was an error
        onSubmit();
      }
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

  // Show participant info form first
  if (!participantInfo) {
    return (
      <div className="min-h-screen bg-background">
        <SurveyHeader title={survey.title} onBack={onBack} />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
              <span>Part 1 of 3</span>
              <span>33% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
              <div className="bg-gradient-to-r from-unboxable-navy to-unboxable-orange h-2 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>
          
          <ParticipantInfoForm 
            onComplete={handleParticipantInfoComplete} 
            learnerData={learnerData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
          <Card className="mb-8 survey-card-shadow border-0 survey-fade-in">
            <CardContent className="p-8">
              <p className="text-muted-foreground text-lg leading-relaxed">{currentSectionData.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Question/Content */}
        <Card className="mb-8 survey-card-shadow border-0 survey-slide-in">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-semibold text-primary leading-relaxed">
              {isInstructionsSection ? currentSectionData.title : currentQ?.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {renderContent()}
          </CardContent>
        </Card>

        <div className="survey-fade-in">
          <SurveyNavigation
            isFirstItem={isFirstItem}
            isLastItem={isLastItem}
            isCurrentAnswered={isCurrentAnswered}
            onPrevious={handlePrevious}
            onNext={onNextClick}
            onBack={onBack}
            onSave={handleManualSave}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
