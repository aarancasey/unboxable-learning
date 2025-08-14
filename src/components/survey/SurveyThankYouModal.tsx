import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, FileText, Users, BarChart3 } from 'lucide-react';

interface SurveyThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SurveyThankYouModal = ({ isOpen, onClose }: SurveyThankYouModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-primary">
            Thank you for completing your LEADForward pre-assessment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-foreground">
          <div className="bg-muted/50 rounded-lg p-6">
            <p className="text-lg leading-relaxed mb-4">
              You will receive a personalised summary of your responses before the LEADForward programme begins. This summary provides you an overview of your self-assessed leadership mindset, behaviours, and areas of confidence - designed to support your growth throughout the programme.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-primary">Here's what happens next:</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="bg-primary/10 rounded-full p-2 mt-1">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Analysis & Report Generation</h4>
                    <p className="text-muted-foreground">
                      Your responses will be collated and analysed confidentially, generating a personal report that highlights your current leadership strengths and development areas. This will be sent directly to you from Unboxable.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="bg-primary/10 rounded-full p-2 mt-1">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Personal Summary Delivery</h4>
                    <p className="text-muted-foreground">
                      You will receive your personal summary via email, please review this prior and bring to both your leadership and coaching sessions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="bg-primary/10 rounded-full p-2 mt-1">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Privacy & Confidentiality</h4>
                    <p className="text-muted-foreground">
                      Your individual insights will remain private. Only broad, aggregated anonymised themes will be shared with the executive team to help them better understand where you are as a collective senior leadership team and how they can better support your development both during the programme and beyond.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="bg-primary/10 rounded-full p-2 mt-1">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Follow-up Assessment</h4>
                    <p className="text-muted-foreground">
                      You will complete a follow up assessment at the end of the program to reflect on shifts in your thinking, confidence and capability overtime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Button onClick={onClose} size="lg" className="px-8">
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};