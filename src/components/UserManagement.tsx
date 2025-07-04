
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DataService } from '@/services/dataService';
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

  const handleAddLearner = async (newLearner: any) => {
    const addedLearner = await DataService.addLearner(newLearner);
    setLearners(prev => [...prev, addedLearner]);
  };

  const handleActivateLearner = async (learnerId: number) => {
    const updatedLearner = await DataService.updateLearner(learnerId, { status: 'active' });
    
    setLearners(prev => prev.map(learner => 
      learner.id === learnerId 
        ? { ...learner, status: 'active' }
        : learner
    ));
    
    toast({
      title: "Learner Activated",
      description: `${updatedLearner?.name} has been successfully activated and can now access the learning portal.`,
    });
  };

  const handleInvitesSent = async (learnerIds: number[]) => {
    // Update multiple learners
    for (const id of learnerIds) {
      await DataService.updateLearner(id, { status: 'invited' });
    }
    
    setLearners(prev => prev.map(learner => 
      learnerIds.includes(learner.id) 
        ? { ...learner, status: 'invited' }
        : learner
    ));
  };

  const handleBulkImport = async (newLearners: any[]) => {
    // Add each learner to Supabase
    for (const learner of newLearners) {
      await DataService.addLearner(learner);
    }
    
    setLearners(prev => [...prev, ...newLearners]);
  };

  const handleDeleteLearner = async (learnerId: number) => {
    const learnerToDelete = learners.find(l => l.id === learnerId);
    await DataService.deleteLearner(learnerId);
    
    setLearners(prev => prev.filter(learner => learner.id !== learnerId));
    
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

  // Load learners from Supabase on component mount
  useEffect(() => {
    const loadLearners = async () => {
      const data = await DataService.getLearners();
      setLearners(data);
    };
    loadLearners();
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
