import { supabase } from '@/integrations/supabase/client';
import { Survey } from '@/components/survey/types';

export interface SurveyConfiguration {
  id: string;
  survey_type: string;
  configuration: any; // Using any for JSONB compatibility
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_active: boolean;
}

export const surveyService = {
  // Get the active survey configuration
  async getActiveSurveyConfiguration(surveyType: string = 'leadership_assessment'): Promise<Survey | null> {
    try {
      const { data, error } = await supabase
        .from('survey_configurations')
        .select('configuration')
        .eq('survey_type', surveyType)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching survey configuration:', error);
        return null;
      }

      return (data?.configuration as unknown as Survey) || null;
    } catch (error) {
      console.error('Error fetching survey configuration:', error);
      return null;
    }
  },

  // Save survey configuration
  async saveSurveyConfiguration(survey: Survey, surveyType: string = 'leadership_assessment'): Promise<boolean> {
    try {
      // First, deactivate any existing active configurations
      await supabase
        .from('survey_configurations')
        .update({ is_active: false })
        .eq('survey_type', surveyType)
        .eq('is_active', true);

      // Insert new configuration
      const { error } = await supabase
        .from('survey_configurations')
        .insert({
          survey_type: surveyType,
          configuration: survey as any,
          is_active: true
        });

      if (error) {
        console.error('Error saving survey configuration:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving survey configuration:', error);
      return false;
    }
  },

  // Get survey configuration history
  async getSurveyConfigurationHistory(surveyType: string = 'leadership_assessment'): Promise<SurveyConfiguration[]> {
    try {
      const { data, error } = await supabase
        .from('survey_configurations')
        .select('*')
        .eq('survey_type', surveyType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching survey configuration history:', error);
        return [];
      }

      return (data as SurveyConfiguration[]) || [];
    } catch (error) {
      console.error('Error fetching survey configuration history:', error);
      return [];
    }
  },

  // Restore a previous configuration
  async restoreConfiguration(configurationId: string): Promise<boolean> {
    try {
      // Get the configuration to restore
      const { data: configData, error: fetchError } = await supabase
        .from('survey_configurations')
        .select('*')
        .eq('id', configurationId)
        .single();

      if (fetchError || !configData) {
        console.error('Error fetching configuration to restore:', fetchError);
        return false;
      }

      // Deactivate current active configurations
      await supabase
        .from('survey_configurations')
        .update({ is_active: false })
        .eq('survey_type', configData.survey_type)
        .eq('is_active', true);

      // Create new active configuration based on the selected one
      const { error: insertError } = await supabase
        .from('survey_configurations')
        .insert({
          survey_type: configData.survey_type,
          configuration: configData.configuration as any,
          is_active: true
        });

      if (insertError) {
        console.error('Error restoring configuration:', insertError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error restoring configuration:', error);
      return false;
    }
  }
};