import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SurveyHeader } from './survey/SurveyHeader';
import { SurveyProgress } from './survey/SurveyProgress';
import { SurveyNavigation } from './survey/SurveyNavigation';
import { InstructionsSection } from './survey/InstructionsSection';
import { QuestionRenderer } from './survey/QuestionRenderer';
import { ParticipantInfoForm, ParticipantInfo } from './survey/ParticipantInfoForm';
import { SurveyCompletedMessage } from './survey/SurveyCompletedMessage';
import { SurveyThankYouModal } from './survey/SurveyThankYouModal';
import { useSurveyData } from './survey/useSurveyData';
import { useSurveyProgressEnhanced } from './survey/useSurveyProgressEnhanced';
import { useSurveyCompletion } from '@/hooks/useSurveyCompletion';
import { supabase } from '@/integrations/supabase/client';
import { dateHelpers } from '@/lib/dateUtils';
import { SettingsService } from '@/services/settingsService';
import { useState } from 'react';

interface SurveyFormProps {
  onBack: () => void;
  onSubmit: () => void;
  learnerData?: any;
}

const SurveyForm = ({ onBack, onSubmit, learnerData }: SurveyFormProps) => {
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const survey = useSurveyData();
  const { isCompleted, submission, loading } = useSurveyCompletion(learnerData);
  const {
    currentSection,
    currentQuestion,
    answers,
    participantInfo: savedParticipantInfo,
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
    saveComplete,
    hasUnsavedChanges,
    handleAnswerChange,
    handleScaleGridChange,
    handleParticipantInfoChange,
    handleNext,
    handlePrevious,
    saveProgress,
    deleteSavedProgress
  } = useSurveyProgressEnhanced(survey);

  // Use saved participant info if available, otherwise use local state
  const effectiveParticipantInfo = participantInfo || savedParticipantInfo;

  const handleParticipantInfoComplete = (data: ParticipantInfo) => {
    setParticipantInfo(data);
    handleParticipantInfoChange(data);
  };

  const handleManualSave = () => {
    saveProgress(true); // Show toast for manual save
  };

  const onNextClick = async () => {
    const isComplete = handleNext();
    if (isComplete) {
      // Prevent double submission
      if (isSubmitting || submissionComplete) {
        return;
      }
      
      setIsSubmitting(true);
      try {
        // Survey complete - save final submission and delete progress
        console.log('Survey submitted:', answers);

        // Get the participant info from the survey state if available
        let finalParticipantInfo = effectiveParticipantInfo;
        
        // If no participant info from form, try to extract from learnerData
        if (!finalParticipantInfo && learnerData) {
          finalParticipantInfo = {
            fullName: learnerData.first_name && learnerData.last_name 
              ? `${learnerData.first_name} ${learnerData.last_name}` 
              : learnerData.email || '',
            date: new Date().toISOString().split('T')[0],
            company: learnerData.company || '',
            businessArea: learnerData.team || '',
            role: learnerData.role || ''
          };
        }

        // Create full survey submission object for localStorage
        const submissionData: any = {
          id: crypto.randomUUID(),
          participantInfo: finalParticipantInfo,
          answers,
          submittedAt: new Date().toISOString(),
          status: 'completed',
          learnerId: learnerData?.id,
          learnerName: learnerData?.first_name && learnerData?.last_name 
            ? `${learnerData.first_name} ${learnerData.last_name}` 
            : learnerData?.email
        };

        // Generate AI summary using the edge function
        try {
          const { data: summaryData, error: summaryError } = await supabase.functions.invoke('generate-leadership-summary', {
            body: {
              surveyResponses: Object.entries(answers).map(([key, value]) => ({
                question: key,
                answer: Array.isArray(value) ? value.join(', ') : value
              })),
              surveyTitle: survey.title
            }
          });

          if (summaryError) {
            console.error('Failed to generate AI summary:', summaryError);
          } else if (summaryData) {
            submissionData.aiSummary = summaryData.aiSummary;
          }
        } catch (summaryError) {
          console.error('AI summary generation failed:', summaryError);
          // Continue without AI summary
        }

        // Always save to localStorage first as primary storage
        const existingSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
        existingSurveys.push(submissionData);
        localStorage.setItem('surveySubmissions', JSON.stringify(existingSurveys));
        console.log('Survey saved to localStorage successfully');

        // Try to save to database using upsert to prevent duplicates
        try {
          const { error: dbError } = await supabase
            .from('survey_submissions')
            .upsert([{
              learner_id: learnerData?.id || null,
              learner_name: finalParticipantInfo?.fullName || 'Unknown User',
              responses: submissionData as any, // Cast to Json type
              status: 'completed'
            }], {
              onConflict: 'learner_name',
              ignoreDuplicates: false
            });
          
          if (!dbError) {
            console.log('Survey saved to database successfully');
          }
        } catch (error) {
          console.warn('Database save failed, but survey is saved locally:', error);
        }

        // Send completion email using template (only if enabled)
        try {
          const emailEnabled = await SettingsService.getSurveyEmailEnabled();
          
          if (emailEnabled) {
            const { error: emailError } = await supabase.functions.invoke('send-assessment-summary', {
              body: {
                learnerName: finalParticipantInfo?.fullName || learnerData?.name || 'Unknown User',
                learnerEmail: learnerData?.email || '',
                summary: submissionData.aiSummary || {},
                surveyTitle: survey.title,
                completionDate: dateHelpers.shortDate(new Date()),
                useTemplate: true // Flag to use template system
              }
            });

            if (emailError) {
              console.error('Failed to send completion email:', emailError);
            } else {
              console.log('Survey completion email sent successfully');
            }
          } else {
            console.log('Survey completion email disabled via settings');
          }
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
        }

        // Delete the progress since survey is complete
        await deleteSavedProgress();
        
        setSubmissionComplete(true);
        setShowThankYouModal(true);
      } catch (error) {
        console.error('Error submitting survey:', error);
        // Still show thank you modal even if there was an error
        setShowThankYouModal(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleThankYouModalClose = () => {
    setShowThankYouModal(false);
    onSubmit();
  };

  const renderContent = () => {
    if (isInstructionsSection) {
      return <InstructionsSection content={currentSectionData.content || ''} />;
    }

    if (!currentQ) return null;

    const isSingleChoice = currentQ.type === 'radio' || currentQ.type === 'scale';

    return (
      <div className="space-y-4">
        {isSingleChoice && (
          <p className="text-muted-foreground text-sm font-medium">
            Choose one that applies
          </p>
        )}
        <QuestionRenderer
          question={currentQ}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          onScaleGridChange={handleScaleGridChange}
        />
      </div>
    );
  };

  const learnerFullName = learnerData?.name || 
    (learnerData?.first_name && learnerData?.last_name 
      ? `${learnerData.first_name} ${learnerData.last_name}` 
      : learnerData?.email || '');

  // Show loading state while checking completion
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-unboxable-orange mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking survey status...</p>
        </div>
      </div>
    );
  }

  // Show completed message if survey is already submitted
  if (isCompleted && submission) {
    return (
      <SurveyCompletedMessage
        onBack={onBack}
        submissionDate={submission.submitted_at}
        status={submission.status}
        learnerName={learnerFullName}
      />
    );
  }

  // Show participant info form first
  if (!effectiveParticipantInfo) {
    return (
      <div className="min-h-screen bg-background">
        <SurveyHeader 
          title={survey.title} 
          onBack={onBack} 
          learnerName={learnerFullName}
        />
        
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
      <SurveyHeader 
        title={survey.title} 
        onBack={onBack} 
        learnerName={learnerFullName}
      />

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
              <p className="text-muted-foreground text-lg leading-relaxed font-bold">{currentSectionData.description}</p>
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
            saveComplete={saveComplete}
            hasUnsavedChanges={hasUnsavedChanges}
            isSubmitting={isSubmitting}
            submissionComplete={submissionComplete}
            learnerName={learnerFullName}
          />
        </div>
      </div>

      <SurveyThankYouModal 
        isOpen={showThankYouModal} 
        onClose={handleThankYouModalClose} 
      />
    </div>
  );
};

export default SurveyForm;
