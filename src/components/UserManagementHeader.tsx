
import { Button } from '@/components/ui/button';
import { UserPlus, Mail } from 'lucide-react';

interface UserManagementHeaderProps {
  onAddLearner: () => void;
  onSendInvites: () => void;
}

const UserManagementHeader = ({ onAddLearner, onSendInvites }: UserManagementHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600">Manage learners and track their progress</p>
      </div>
      
      <div className="flex space-x-3">
        <Button 
          className="bg-unboxable-navy hover:bg-unboxable-navy/90"
          onClick={onAddLearner}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Learner
        </Button>
        <Button 
          variant="outline"
          onClick={onSendInvites}
        >
          <Mail className="h-4 w-4 mr-2" />
          Send Invites
        </Button>
      </div>
    </div>
  );
};

export default UserManagementHeader;
