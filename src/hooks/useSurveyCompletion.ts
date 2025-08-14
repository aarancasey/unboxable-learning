import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SurveySubmission {
  id: number;
  learner_name: string;
  responses: any;
  status: string;
  submitted_at: string;
  learner_id?: number;
}

interface SurveyCompletionResult {
  isCompleted: boolean;
  submission?: SurveySubmission;
  loading: boolean;
}

export const useSurveyCompletion = (learnerData?: any): SurveyCompletionResult => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [submission, setSubmission] = useState<SurveySubmission | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSurveyCompletion = async () => {
      if (!learnerData) {
        setLoading(false);
        return;
      }

      try {
        // Check Supabase first
        const { data: supabaseSubmissions, error } = await supabase
          .from('survey_submissions')
          .select('*')
          .order('submitted_at', { ascending: false });

        let foundSubmission: SurveySubmission | undefined;

        if (!error && supabaseSubmissions) {
          // Try multiple matching criteria for better accuracy
          foundSubmission = supabaseSubmissions.find((sub: SurveySubmission) => {
            const learnerName = learnerData.name || 
              (learnerData.first_name && learnerData.last_name 
                ? `${learnerData.first_name} ${learnerData.last_name}` 
                : learnerData.email);
            
            return (
              // Match by learner ID if available
              (learnerData.id && sub.learner_id === learnerData.id) ||
              // Match by exact name
              sub.learner_name === learnerName ||
              // Match by case-insensitive name
              sub.learner_name?.toLowerCase() === learnerName?.toLowerCase() ||
              // Match by email in responses
              (learnerData.email && sub.responses?.participantInfo?.email === learnerData.email) ||
              (learnerData.email && sub.responses?.email === learnerData.email)
            );
          });
        }

        // Fallback to localStorage if no Supabase submission found
        if (!foundSubmission) {
          const localSubmissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
          const learnerName = learnerData.name || 
            (learnerData.first_name && learnerData.last_name 
              ? `${learnerData.first_name} ${learnerData.last_name}` 
              : learnerData.email);

          foundSubmission = localSubmissions.find((sub: any) => {
            return (
              // Match by learner ID
              (learnerData.id && sub.learnerId === learnerData.id) ||
              // Match by name
              sub.learnerName === learnerName ||
              sub.participantInfo?.fullName === learnerName ||
              // Match by email
              (learnerData.email && sub.participantInfo?.email === learnerData.email)
            );
          });

          // Convert localStorage format to match Supabase format
          if (foundSubmission) {
            foundSubmission = {
              id: foundSubmission.id,
              learner_name: foundSubmission.learnerName || foundSubmission.participantInfo?.fullName,
              responses: foundSubmission,
              status: foundSubmission.status || 'completed',
              submitted_at: foundSubmission.submittedAt,
              learner_id: foundSubmission.learnerId
            };
          }
        }

        if (foundSubmission) {
          setIsCompleted(true);
          setSubmission(foundSubmission);
        } else {
          setIsCompleted(false);
          setSubmission(undefined);
        }

      } catch (error) {
        console.error('Error checking survey completion:', error);
        // On error, assume not completed to allow access
        setIsCompleted(false);
        setSubmission(undefined);
      } finally {
        setLoading(false);
      }
    };

    checkSurveyCompletion();
  }, [learnerData]);

  return { isCompleted, submission, loading };
};