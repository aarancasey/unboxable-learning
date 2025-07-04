
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import UserManagementHeader from './UserManagementHeader';
import UserSearchBar from './UserSearchBar';
import UsersList from './UsersList';
import AddLearnerForm from './AddLearnerForm';
import SendInvitesModal from './SendInvitesModal';
import BulkUploadModal from './BulkUploadModal';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddLearnerOpen, setIsAddLearnerOpen] = useState(false);
  const [isSendInvitesOpen, setIsSendInvitesOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [learners, setLearners] = useState<any[]>([]);
  const { toast } = useToast();

  const handleAddLearner = (newLearner: any) => {
    setLearners(prev => [...prev, newLearner]);
    
    // Save to localStorage for persistence
    const existingLearners = JSON.parse(localStorage.getItem('learners') || '[]');
    const updatedLearners = [...existingLearners, newLearner];
    localStorage.setItem('learners', JSON.stringify(updatedLearners));
  };

  const handleActivateLearner = (learnerId: number) => {
    const updatedLearners = learners.map(learner => 
      learner.id === learnerId 
        ? { ...learner, status: 'active' }
        : learner
    );
    
    setLearners(updatedLearners);
    localStorage.setItem('learners', JSON.stringify(updatedLearners));
    
    const activatedLearner = updatedLearners.find(l => l.id === learnerId);
    toast({
      title: "Learner Activated",
      description: `${activatedLearner?.name} has been successfully activated and can now access the learning portal.`,
    });
  };

  const handleInvitesSent = (learnerIds: number[]) => {
    const updatedLearners = learners.map(learner => 
      learnerIds.includes(learner.id) 
        ? { ...learner, status: 'invited' }
        : learner
    );
    
    setLearners(updatedLearners);
    localStorage.setItem('learners', JSON.stringify(updatedLearners));
  };

  const handleBulkImport = (newLearners: any[]) => {
    const updatedLearners = [...learners, ...newLearners];
    setLearners(updatedLearners);
    
    // Save to localStorage for persistence
    const existingLearners = JSON.parse(localStorage.getItem('learners') || '[]');
    const allLearners = [...existingLearners, ...newLearners];
    localStorage.setItem('learners', JSON.stringify(allLearners));
  };

  const handleDeleteLearner = (learnerId: number) => {
    const learnerToDelete = learners.find(l => l.id === learnerId);
    const updatedLearners = learners.filter(learner => learner.id !== learnerId);
    
    setLearners(updatedLearners);
    localStorage.setItem('learners', JSON.stringify(updatedLearners));
    
    toast({
      title: "Learner Deleted",
      description: `${learnerToDelete?.name} has been removed from the system.`,
      variant: "destructive",
    });
  };

  const handleResendInvite = async (learnerId: number) => {
    const learner = learners.find(l => l.id === learnerId);
    
    if (!learner) return;

    try {
      const { error } = await supabase.functions.invoke('send-learner-invite', {
        body: {
          learnerName: learner.name,
          learnerEmail: learner.email,
          department: learner.department
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Invite Resent",
        description: `A new invitation has been sent to ${learner.email}.`,
      });
    } catch (error) {
      console.error('Error resending invite:', error);
      toast({
        title: "Error",
        description: "Failed to resend invite. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load learners from localStorage on component mount
  useEffect(() => {
    const savedLearners = JSON.parse(localStorage.getItem('learners') || '[]');
    setLearners(savedLearners);
  }, []);

  const filteredUsers = learners.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const existingEmails = learners.map(learner => learner.email.toLowerCase());

  return (
    <div className="space-y-6">
      <UserManagementHeader
        onAddLearner={() => setIsAddLearnerOpen(true)}
        onSendInvites={() => setIsSendInvitesOpen(true)}
        onBulkUpload={() => setIsBulkUploadOpen(true)}
      />

      <UserSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <UsersList
        learners={learners}
        filteredUsers={filteredUsers}
        onAddLearner={() => setIsAddLearnerOpen(true)}
        onActivateLearner={handleActivateLearner}
        onDeleteLearner={handleDeleteLearner}
        onResendInvite={handleResendInvite}
      />

      <AddLearnerForm
        isOpen={isAddLearnerOpen}
        onClose={() => setIsAddLearnerOpen(false)}
        onAddLearner={handleAddLearner}
      />

      <SendInvitesModal
        isOpen={isSendInvitesOpen}
        onClose={() => setIsSendInvitesOpen(false)}
        learners={learners}
        onInvitesSent={handleInvitesSent}
      />

      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onBulkImport={handleBulkImport}
        existingEmails={existingEmails}
      />
    </div>
  );
};

export default UserManagement;
