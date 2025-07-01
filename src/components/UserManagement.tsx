
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
  AlertCircle
} from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Empty data structure - no mock data
  const mockUsers: any[] = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
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
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredUsers = mockUsers.filter(user =>
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
          <Button className="bg-unboxable-navy hover:bg-unboxable-navy/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Learner
          </Button>
          <Button variant="outline">
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
            <span>Learners (0)</span>
            <div className="text-sm text-gray-600">
              0 active users
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center py-12">
            <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No learners yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first learner to the platform.</p>
            <Button className="bg-unboxable-navy hover:bg-unboxable-navy/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Learner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
