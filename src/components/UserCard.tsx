
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CheckCircle,
  Clock,
  Mail,
  AlertCircle,
  UserCheck,
  MoreHorizontal,
  Trash2,
  Send
} from 'lucide-react';

interface Learner {
  id: number;
  name: string;
  email: string;
  status: string;
  department: string;
  mobile: string;
}

interface UserCardProps {
  learner: Learner;
  onActivate: (learnerId: number) => void;
  onDelete: (learnerId: number) => void;
  onResendInvite: (learnerId: number) => void;
}

const UserCard = ({ learner, onActivate, onDelete, onResendInvite }: UserCardProps) => {
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

  return (
    <div className="p-6 hover:bg-gray-50">
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
              onClick={() => onActivate(learner.id)}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Activate
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {learner.status === 'invited' && (
                <DropdownMenuItem onClick={() => onResendInvite(learner.id)}>
                  <Send className="h-4 w-4 mr-2" />
                  Resend Invite
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(learner.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Learner
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
