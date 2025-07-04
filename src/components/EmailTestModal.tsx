import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EmailTestModal = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to test",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('test-email', {
        body: { testEmail }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "✅ Email Test Successful!",
          description: `Test email sent to ${testEmail}. Check your inbox.`,
        });
        setIsOpen(false);
        setTestEmail('');
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Email test error:', error);
      
      let errorMessage = "Failed to send test email";
      if (error.message?.includes("RESEND_API_KEY not configured")) {
        errorMessage = "Resend API key not configured. Please add it to Supabase secrets.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "❌ Email Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Test Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Test Email System
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Send a test email to verify your email configuration is working correctly.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="testEmail">Test Email Address</Label>
            <Input
              id="testEmail"
              type="email"
              placeholder="your.email@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">What this test checks:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Resend API key configuration</li>
                  <li>• Email sending functionality</li>
                  <li>• Edge function connectivity</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTestEmail}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTestModal;