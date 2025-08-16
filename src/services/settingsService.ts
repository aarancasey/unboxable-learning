import { supabase } from '@/integrations/supabase/client';

export class SettingsService {
  static async getSetting(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (error) throw error;
      return data?.value || null;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return null;
    }
  }

  static async setSetting(key: string, value: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  }

  static async getLearnMoreSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['learn_more_enabled', 'learn_more_title', 'learn_more_content']);

      if (error) throw error;

      const settings = data?.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>) || {};

      return {
        enabled: settings.learn_more_enabled === 'true',
        title: settings.learn_more_title || 'Learn More About Our Program',
        content: settings.learn_more_content || ''
      };
    } catch (error) {
      console.error('Error getting learn more settings:', error);
      return {
        enabled: false,
        title: 'Learn More About Our Program',
        content: ''
      };
    }
  }

  static async setLearnMoreSettings(enabled: boolean, title: string, content: string): Promise<boolean> {
    try {
      const updates = [
        { key: 'learn_more_enabled', value: enabled.toString() },
        { key: 'learn_more_title', value: title },
        { key: 'learn_more_content', value: content }
      ];

      const { error } = await supabase
        .from('settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting learn more settings:', error);
      return false;
    }
  }

  static async getSurveyEmailEnabled(): Promise<boolean> {
    try {
      const value = await this.getSetting('survey_completion_email_enabled');
      return value === null ? true : value === 'true'; // Default to true if not set
    } catch (error) {
      console.error('Error getting survey email setting:', error);
      return true; // Default to enabled on error
    }
  }

  static async setSurveyEmailEnabled(enabled: boolean): Promise<boolean> {
    return this.setSetting('survey_completion_email_enabled', enabled.toString());
  }

  static async getEmailTemplateSettings(): Promise<Record<string, boolean>> {
    try {
      const templateTypes = ['survey_completion', 'learner_invitation', 'module_unlock', 'pre_survey'];
      const settingKeys = templateTypes.map(type => `${type}_email_enabled`);
      
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', settingKeys);

      if (error) throw error;

      const settings = data?.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>) || {};

      // Return defaults (all enabled) if settings don't exist
      return templateTypes.reduce((acc, type) => {
        const key = `${type}_email_enabled`;
        acc[type] = settings[key] === null ? true : settings[key] === 'true';
        return acc;
      }, {} as Record<string, boolean>);
    } catch (error) {
      console.error('Error getting email template settings:', error);
      // Return defaults on error
      return {
        survey_completion: true,
        learner_invitation: true,
        module_unlock: true,
        pre_survey: true
      };
    }
  }

  static async setEmailTemplateSettings(settings: Record<string, boolean>): Promise<boolean> {
    try {
      const updates = Object.entries(settings).map(([templateType, enabled]) => ({
        key: `${templateType}_email_enabled`,
        value: enabled.toString()
      }));

      const { error } = await supabase
        .from('settings')
        .upsert(updates, { onConflict: 'key' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error setting email template settings:', error);
      return false;
    }
  }
}