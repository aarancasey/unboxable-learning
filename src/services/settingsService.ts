import { supabase } from '@/integrations/supabase/client';

export class SettingsService {
  static async getSetting(key: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single();

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
}