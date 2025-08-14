
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DataService } from '@/services/dataService';
import UserManagementHeader from './UserManagementHeader';
import UserSearchBar from './UserSearchBar';
import UsersList from './UsersList';
import AddLearnerForm from './AddLearnerForm';
import SendInvitesModal from './SendInvitesModal';
import BulkUploadModal from './bulk-upload/BulkUploadModal';
import EditLearnerModal from './EditLearnerModal';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddLearnerOpen, setIsAddLearnerOpen] = useState(false);
  const [isSendInvitesOpen, setIsSendInvitesOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isEditLearnerOpen, setIsEditLearnerOpen] = useState(false);
  const [editingLearner, setEditingLearner] = useState<any>(null);
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
    console.log('Bulk importing learners via edge function:', newLearners);
    
    try {
      const { data, error } = await supabase.functions.invoke('bulk-upload-learners', {
        body: { learners: newLearners }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to upload learners');
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }
      
      console.log('Bulk upload successful:', data);
      
      // Refresh the learners list
      await refreshLearners();
      
      toast({
        title: "Bulk import successful",
        description: `Successfully imported ${data.count} learners.`,
      });
      
      return data.learners;
    } catch (error) {
      console.error('Bulk import failed:', error);
      toast({
        title: "Bulk import failed", 
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
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
          team: learner.team
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

  const handleEditLearner = (learner: any) => {
    setEditingLearner(learner);
    setIsEditLearnerOpen(true);
  };

  const handleSaveEditedLearner = async (updatedLearner: any) => {
    await DataService.updateLearner(updatedLearner.id, {
      name: updatedLearner.name,
      email: updatedLearner.email,
      team: updatedLearner.team,
      role: updatedLearner.role
    });
    
    setLearners(prev => prev.map(learner => 
      learner.id === updatedLearner.id 
        ? { ...learner, ...updatedLearner }
        : learner
    ));
  };

  // Load learners from Supabase on component mount
  useEffect(() => {
    const loadLearners = async () => {
      try {
        console.log('Loading learners from Supabase...');
        const data = await DataService.getLearners();
        console.log('Loaded learners:', data);
        setLearners(data);
      } catch (error) {
        console.error('Error loading learners:', error);
        // Set empty array on error instead of crashing
        setLearners([]);
      }
    };
    loadLearners();
  }, []);

  // Force refresh learners data
  const refreshLearners = async () => {
    try {
      const data = await DataService.getLearners();
      console.log('Refreshed learners from Supabase:', data);
      setLearners(data);
    } catch (error) {
      console.error('Error refreshing learners:', error);
    }
  };

  const filteredUsers = learners.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.team.toLowerCase().includes(searchTerm.toLowerCase())
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
        onEditLearner={handleEditLearner}
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

      <EditLearnerModal
        learner={editingLearner}
        isOpen={isEditLearnerOpen}
        onClose={() => {
          setIsEditLearnerOpen(false);
          setEditingLearner(null);
        }}
        onSave={handleSaveEditedLearner}
      />
    </div>
  );
};

export default UserManagement;
