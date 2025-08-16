import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SurveySubmission {
  id: number;
  learner_name: string;
  learner_id?: number;
  responses: any;
  status: string;
  submitted_at: string;
}

interface SurveyProgress {
  id: string;
  user_id: string;
  current_section: number;
  current_question: number;
  answers: any;
  participant_info: any;
  updated_at: string;
}

interface SurveyStatusResult {
  status: 'not_started' | 'in_progress' | 'completed';
  submission?: SurveySubmission;
  progress?: SurveyProgress;
  loading: boolean;
  lastUpdated?: string;
}

export const useSurveyStatus = (learnerEmail?: string, learnerName?: string, learnerId?: number) => {
  const [result, setResult] = useState<SurveyStatusResult>({
    status: 'not_started',
    loading: true
  });

  useEffect(() => {
    if (!learnerEmail && !learnerName && !learnerId) {
      setResult({ status: 'not_started', loading: false });
      return;
    }

    const fetchSurveyStatus = async () => {
      try {
        setResult(prev => ({ ...prev, loading: true }));

        // Check for completed submissions first
        const { data: submissions } = await supabase
          .from('survey_submissions')
          .select('*')
          .order('submitted_at', { ascending: false });

        let matchedSubmission = null;
        if (submissions) {
          // Try to match by learner_id first, then by name or email
          matchedSubmission = submissions.find(sub => 
            (learnerId && sub.learner_id === learnerId) ||
            (learnerName && sub.learner_name === learnerName) ||
            (learnerEmail && sub.learner_name === learnerEmail)
          );
        }

        if (matchedSubmission) {
          setResult({
            status: 'completed',
            submission: matchedSubmission,
            loading: false,
            lastUpdated: matchedSubmission.submitted_at
          });
          return;
        }

        // Check for in-progress surveys (requires user to be authenticated)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: progressData } = await supabase
            .from('survey_progress')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (progressData) {
            setResult({
              status: 'in_progress',
              progress: progressData,
              loading: false,
              lastUpdated: progressData.updated_at
            });
            return;
          }
        }

        // Check localStorage for progress as fallback
        const localProgress = localStorage.getItem('surveyProgress');
        if (localProgress) {
          const parsed = JSON.parse(localProgress);
          if (parsed.participantInfo?.email === learnerEmail || 
              parsed.participantInfo?.name === learnerName) {
            setResult({
              status: 'in_progress',
              loading: false,
              lastUpdated: new Date().toISOString()
            });
            return;
          }
        }

        // No progress found - not started
        setResult({
          status: 'not_started',
          loading: false
        });

      } catch (error) {
        console.error('Error fetching survey status:', error);
        setResult({
          status: 'not_started',
          loading: false
        });
      }
    };

    fetchSurveyStatus();
  }, [learnerEmail, learnerName, learnerId]);

  return result;
};