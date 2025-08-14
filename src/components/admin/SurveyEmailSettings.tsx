import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { SettingsService } from '@/services/settingsService';
import { toast } from 'sonner';
import { Mail, Settings } from 'lucide-react';

export const SurveyEmailSettings = () => {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const enabled = await SettingsService.getSurveyEmailEnabled();
      setEmailEnabled(enabled);
    } catch (error) {
      console.error('Failed to load email settings:', error);
      toast.error('Failed to load email settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const success = await SettingsService.setSurveyEmailEnabled(emailEnabled);
      
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
            Survey Email Settings
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Survey Email Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-enabled" className="text-base font-medium">
              Survey Completion Emails
            </Label>
            <div className="text-sm text-muted-foreground">
              Send automated emails to learners when their assessment is ready for review
            </div>
          </div>
          <Switch
            id="email-enabled"
            checked={emailEnabled}
            onCheckedChange={setEmailEnabled}
            disabled={isSaving}
          />
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Settings className="h-4 w-4" />
            <span>
              {emailEnabled 
                ? "Learners will receive an email notification when their survey is completed and ready for review."
                : "Email notifications are disabled. Learners will need to check their dashboard for assessment updates."
              }
            </span>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};