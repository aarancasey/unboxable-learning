
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  UserPlus, 
  Mail, 
  Calendar,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import AddLearnerForm from './AddLearnerForm';
import SendInvitesModal from './SendInvitesModal';
import { useToast } from '@/hooks/use-toast';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddLearnerOpen, setIsAddLearnerOpen] = useState(false);
  const [isSendInvitesOpen, setIsSendInvitesOpen] = useState(false);
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

  // Load learners from localStorage on component mount
  useState(() => {
    const savedLearners = JSON.parse(localStorage.getItem('learners') || '[]');
    setLearners(savedLearners);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'invited':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Invited</Badge>;
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'invited':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredUsers = learners.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage learners and track their progress</p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            className="bg-unboxable-navy hover:bg-unboxable-navy/90"
            onClick={() => setIsAddLearnerOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Learner
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsSendInvitesOpen(true)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Send Invites
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Learners ({learners.length})</span>
            <div className="text-sm text-gray-600">
              {learners.filter(l => l.status === 'active').length} active users
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {learners.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No learners yet</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first learner to the platform.</p>
              <Button 
                className="bg-unboxable-navy hover:bg-unboxable-navy/90"
                onClick={() => setIsAddLearnerOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Learner
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((learner) => (
                <div key={learner.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-unboxable-navy rounded-full flex items-center justify-center text-white font-medium">
                          {learner.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{learner.name}</h4>
                        <p className="text-sm text-gray-500">{learner.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">{learner.mobile}</span>
                          <span className="text-xs text-gray-500">{learner.department}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(learner.status)}
                      {getStatusBadge(learner.status)}
                      {learner.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleActivateLearner(learner.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
};

export default UserManagement;
