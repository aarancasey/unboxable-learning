import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, User, Send, CheckCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailSendModalProps {
  open: boolean;
  onClose: () => void;
  survey: any;
}

export const EmailSendModal = ({ open, onClose, survey }: EmailSendModalProps) => {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const learnerName = survey.learner || survey.learner_name || 'Unknown Learner';
  const learnerEmail = survey.email || 'learner@example.com';
  const surveyTitle = survey.title || 'Leadership Assessment';

  const handleSend = async () => {
    setIsSending(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-assessment-summary', {
        body: {
          learnerName: learnerName,
          learnerEmail: learnerEmail,
          summary: survey.aiSummary,
          surveyTitle: surveyTitle
        }
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Email Sent",
        description: `Assessment summary sent successfully to ${learnerEmail}`,
      });
    } catch (error) {
      console.error('Email failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to send email');
      toast({
        title: "Email Failed",
        description: "Failed to send assessment summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    handleSend();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Assessment Summary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipient Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{learnerName}</div>
                    <div className="text-sm text-muted-foreground">{learnerEmail}</div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-sm font-medium mb-1">Assessment to Send:</div>
                  <Badge variant="outline" className="text-xs">
                    {surveyTitle}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success State */}
          {isSuccess && (
            <div className="text-center py-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-medium text-green-700">Email Sent Successfully!</div>
              <div className="text-sm text-muted-foreground">
                The assessment summary has been delivered to {learnerEmail}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Email Failed</span>
              </div>
              <div className="text-sm text-destructive/80 mb-3">{error}</div>
              <Button 
                onClick={handleRetry} 
                size="sm" 
                variant="outline"
                disabled={isSending}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          {!isSuccess && !error && (
            <div className="flex gap-2">
              <Button 
                onClick={handleSend} 
                disabled={isSending}
                className="flex-1"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={isSending}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}

          {/* Close button for success state */}
          {isSuccess && (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};