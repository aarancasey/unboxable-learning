
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface AddLearnerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLearner: (learner: any) => void;
}

const AddLearnerForm = ({ isOpen, onClose, onAddLearner }: AddLearnerFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
  });
  const { toast } = useToast();

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.mobile) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const generatedPassword = generatePassword();
    const newLearner = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      password: generatedPassword,
      status: 'pending',
      department: 'Customer Service',
      enrolledDate: new Date().toISOString().split('T')[0],
      requiresPasswordChange: true,
    };

    onAddLearner(newLearner);
    
    toast({
      title: "Learner Added Successfully",
      description: `${formData.name} has been added with temporary password: ${generatedPassword}`,
    });

    // Reset form and close modal
    setFormData({ name: '', email: '', mobile: '' });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Learner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter learner's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              placeholder="Enter mobile number"
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> A temporary password will be auto-generated. The learner will be prompted to change it on first login.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-unboxable-navy hover:bg-unboxable-navy/90">
              Add Learner
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLearnerForm;
