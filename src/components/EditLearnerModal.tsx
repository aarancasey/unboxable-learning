import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Learner {
  id: number;
  name: string;
  email: string;
  status: string;
  team: string;
  role: string;
}

interface EditLearnerModalProps {
  learner: Learner | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLearner: Learner) => Promise<void>;
}

const EditLearnerModal = ({ learner, isOpen, onClose, onSave }: EditLearnerModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Learner>({
    id: 0,
    name: '',
    email: '',
    status: '',
    team: '',
    role: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when learner changes
  useEffect(() => {
    if (learner) {
      setFormData(learner);
    }
  }, [learner]);

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.team || !formData.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      toast({
        title: "Success",
        description: "Learner details updated successfully.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update learner details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Learner, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!learner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Learner Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter learner name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="team">Team *</Label>
            <Input
              id="team"
              value={formData.team}
              onChange={(e) => handleInputChange('team', e.target.value)}
              placeholder="Enter team"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role *</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              placeholder="Enter role"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLearnerModal;