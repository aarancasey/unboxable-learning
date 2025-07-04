
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, Upload } from 'lucide-react';

interface UserManagementHeaderProps {
  onAddLearner: () => void;
  onSendInvites: () => void;
  onBulkUpload: () => void;
}

const UserManagementHeader = ({ onAddLearner, onSendInvites, onBulkUpload }: UserManagementHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <p className="text-gray-600">Manage learners and track their progress</p>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
        <Button 
          variant="outline"
          onClick={onBulkUpload}
          className="w-full sm:w-auto text-sm"
          size="sm"
        >
          <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          <span className="hidden sm:inline">Bulk Upload</span>
          <span className="sm:hidden">Upload</span>
        </Button>
        <Button 
          className="bg-unboxable-navy hover:bg-unboxable-navy/90 w-full sm:w-auto text-sm"
          onClick={onAddLearner}
          size="sm"
        >
          <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          <span className="hidden sm:inline">Add Learner</span>
          <span className="sm:hidden">Add</span>
        </Button>
        <Button 
          variant="outline"
          onClick={onSendInvites}
          className="w-full sm:w-auto text-sm"
          size="sm"
        >
          <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          <span className="hidden sm:inline">Send Invites</span>
          <span className="sm:hidden">Invites</span>
        </Button>
      </div>
    </div>
  );
};

export default UserManagementHeader;
