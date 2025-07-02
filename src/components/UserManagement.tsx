
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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

  // Load learners from localStorage on component mount
  useState(() => {
    const savedLearners = JSON.parse(localStorage.getItem('learners') || '[]');
    setLearners(savedLearners);
  });

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
