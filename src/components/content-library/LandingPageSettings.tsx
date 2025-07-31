import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Save, Monitor } from 'lucide-react';
import { SettingsService } from '@/services/settingsService';
import { useToast } from '@/hooks/use-toast';

export const LandingPageSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    title: 'Learn More About Our Program',
    content: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  const maxContentLength = 1000;
  const remainingChars = maxContentLength - settings.content.length;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await SettingsService.getLearnMoreSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error loading settings",
        description: "Failed to load landing page settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (settings.content.length > maxContentLength) {
      toast({
        title: "Content too long",
        description: `Content must be ${maxContentLength} characters or less`,
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const success = await SettingsService.setLearnMoreSettings(
        settings.enabled,
        settings.title,
        settings.content
      );

      if (success) {
        toast({
          title: "Settings saved",
          description: "Landing page settings have been updated successfully"
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "Failed to save landing page settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (value: string) => {
    if (value.length <= maxContentLength) {
      setSettings(prev => ({ ...prev, content: value }));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Landing Page Settings</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Landing Page Settings
        </CardTitle>
        <CardDescription>
          Configure the "Learn More" button on the landing page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="learn-more-enabled">Enable "Learn More" Button</Label>
            <p className="text-sm text-muted-foreground">
              Show the "Learn More" button on the landing page
            </p>
          </div>
          <Switch
            id="learn-more-enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, enabled: checked }))
            }
          />
        </div>

        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="learn-more-title">Modal Title</Label>
          <Input
            id="learn-more-title"
            value={settings.title}
            onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter the modal title..."
            disabled={!settings.enabled}
          />
        </div>

        {/* Content Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="learn-more-content">Content</Label>
            <span className={`text-sm ${remainingChars < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {remainingChars} characters remaining
            </span>
          </div>
          <Textarea
            id="learn-more-content"
            value={settings.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Enter the content that will appear in the modal when users click 'Learn More'..."
            className="min-h-[120px]"
            disabled={!settings.enabled}
          />
          <p className="text-xs text-muted-foreground">
            Maximum {maxContentLength} characters. This content will be displayed in a modal when users click the "Learn More" button.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || remainingChars < 0}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>

          {settings.enabled && settings.content && (
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview Modal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{settings.title}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {settings.content}
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Status Indicator */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <p className="text-sm">
            <strong>Status:</strong>{' '}
            {settings.enabled ? (
              <span className="text-green-600">
                "Learn More" button is enabled and will appear on the landing page
              </span>
            ) : (
              <span className="text-muted-foreground">
                "Learn More" button is hidden from the landing page
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};