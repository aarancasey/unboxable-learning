import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SettingsService } from '@/services/settingsService';
import { toast } from 'sonner';
import { Mail, Settings, UserPlus, BookOpen, ClipboardList, Send } from 'lucide-react';

interface EmailTemplateSettings {
  survey_completion: boolean;
  learner_invitation: boolean;
  module_unlock: boolean;
  pre_survey: boolean;
}

const emailTemplateConfig = {
  survey_completion: {
    label: 'Survey Completion Emails',
    description: 'Send automated emails to learners when their assessment is ready for review',
    icon: ClipboardList
  },
  learner_invitation: {
    label: 'Learner Invitation Emails',
    description: 'Send welcome emails when new learners are invited to join courses',
    icon: UserPlus
  },
  module_unlock: {
    label: 'Module Unlock Notifications',
    description: 'Notify learners when new course modules become available',
    icon: BookOpen
  },
  pre_survey: {
    label: 'Pre-Survey Reminders',
    description: 'Send reminder emails for surveys that need to be completed',
    icon: Send
  }
};

export const EmailTemplateSettings = () => {
  const [settings, setSettings] = useState<EmailTemplateSettings>({
    survey_completion: true,
    learner_invitation: true,
    module_unlock: true,
    pre_survey: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const emailSettings = await SettingsService.getEmailTemplateSettings();
      // Ensure we have all the required properties
      const typedSettings: EmailTemplateSettings = {
        survey_completion: emailSettings.survey_completion ?? true,
        learner_invitation: emailSettings.learner_invitation ?? true,
        module_unlock: emailSettings.module_unlock ?? true,
        pre_survey: emailSettings.pre_survey ?? true
      };
      setSettings(typedSettings);
    } catch (error) {
      console.error('Failed to load email template settings:', error);
      toast.error('Failed to load email settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (templateType: keyof EmailTemplateSettings, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      [templateType]: enabled
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert EmailTemplateSettings to Record<string, boolean>
      const settingsRecord: Record<string, boolean> = {
        survey_completion: settings.survey_completion,
        learner_invitation: settings.learner_invitation,
        module_unlock: settings.module_unlock,
        pre_survey: settings.pre_survey
      };
      
      const success = await SettingsService.setEmailTemplateSettings(settingsRecord);
      
      if (success) {
        toast.success('Email settings saved successfully');
      } else {
        toast.error('Failed to save email settings');
      }
    } catch (error) {
      console.error('Failed to save email settings:', error);
      toast.error('Failed to save email settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Template Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const enabledCount = Object.values(settings).filter(Boolean).length;
  const totalCount = Object.keys(settings).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Template Settings
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Control which automated emails are sent to learners ({enabledCount}/{totalCount} enabled)
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(emailTemplateConfig).map(([templateType, config]) => {
          const Icon = config.icon;
          const key = templateType as keyof EmailTemplateSettings;
          
          return (
            <div key={templateType}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor={`${templateType}-enabled`} className="text-base font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    {config.description}
                  </div>
                </div>
                <Switch
                  id={`${templateType}-enabled`}
                  checked={settings[key]}
                  onCheckedChange={(enabled) => handleSettingChange(key, enabled)}
                  disabled={isSaving}
                />
              </div>
              {templateType !== 'pre_survey' && <Separator className="mt-4" />}
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Settings className="h-4 w-4" />
            <span>
              {enabledCount === totalCount 
                ? "All email notifications are enabled for learners."
                : enabledCount === 0
                ? "All email notifications are disabled. Learners will need to check their dashboard for updates."
                : `${enabledCount} out of ${totalCount} email types are enabled.`
              }
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                const allEnabled = enabledCount === totalCount;
                const newSettings = Object.keys(settings).reduce((acc, key) => {
                  acc[key as keyof EmailTemplateSettings] = !allEnabled;
                  return acc;
                }, {} as EmailTemplateSettings);
                setSettings(newSettings);
              }}
              disabled={isSaving}
              className="sm:w-auto"
            >
              {enabledCount === totalCount ? 'Disable All' : 'Enable All'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};