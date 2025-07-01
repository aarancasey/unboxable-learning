
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Learner {
  id: number;
  name: string;
  email: string;
  status: string;
  department: string;
  mobile: string;
}

interface SendInvitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  learners: Learner[];
  onInvitesSent: (learnerIds: number[]) => void;
}

const SendInvitesModal = ({ isOpen, onClose, learners, onInvitesSent }: SendInvitesModalProps) => {
  const [selectedLearners, setSelectedLearners] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Filter learners who can receive invites (pending status)
  const eligibleLearners = learners.filter(learner => learner.status === 'pending');

  const handleLearnerToggle = (learnerId: number) => {
    setSelectedLearners(prev => 
      prev.includes(learnerId) 
        ? prev.filter(id => id !== learnerId)
        : [...prev, learnerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLearners.length === eligibleLearners.length) {
      setSelectedLearners([]);
    } else {
      setSelectedLearners(eligibleLearners.map(learner => learner.id));
    }
  };

  const handleSendInvites = async () => {
    if (selectedLearners.length === 0) {
      toast({
        title: "No learners selected",
        description: "Please select at least one learner to send invites to.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to send emails
      await new Promise(resolve => setTimeout(resolve, 2000));

      onInvitesSent(selectedLearners);
      
      toast({
        title: "Invites Sent Successfully",
        description: `Email invitations have been sent to ${selectedLearners.length} learner(s).`,
      });

      setSelectedLearners([]);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invites. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Learning Portal Invites
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {eligibleLearners.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending learners</h3>
              <p className="text-gray-600">All learners have already been invited or activated.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Select learners to send learning portal invitations to:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedLearners.length === eligibleLearners.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {eligibleLearners.map((learner) => (
                  <Card key={learner.id} className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedLearners.includes(learner.id)}
                          onCheckedChange={() => handleLearnerToggle(learner.id)}
                        />
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-unboxable-navy rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {learner.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{learner.name}</h4>
                          <p className="text-sm text-gray-500">{learner.email}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-500">{learner.department}</span>
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              Pending
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  {selectedLearners.length} of {eligibleLearners.length} learners selected
                </p>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-unboxable-navy hover:bg-unboxable-navy/90"
                    onClick={handleSendInvites}
                    disabled={isLoading || selectedLearners.length === 0}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invites ({selectedLearners.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvitesModal;
