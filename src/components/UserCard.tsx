
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
  Send,
  Edit2
} from 'lucide-react';

interface Learner {
  id: number;
  name: string;
  email: string;
  status: string;
  team: string;
  role: string;
}

interface UserCardProps {
  learner: Learner;
  onActivate: (learnerId: number) => void;
  onDelete: (learnerId: number) => void;
  onResendInvite: (learnerId: number) => void;
  onEdit: (learner: Learner) => void;
}

const UserCard = ({ learner, onActivate, onDelete, onResendInvite, onEdit }: UserCardProps) => {
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

  // Generate a consistent color based on email hash
  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-red-500',
      'bg-orange-500', 
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getInitial = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="p-4 sm:p-6 hover:bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${getAvatarColor(learner.email)} rounded-full flex items-center justify-center text-white font-medium text-sm`}>
              {getInitial(learner.email)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">{learner.name}</h4>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{learner.email}</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 space-y-1 sm:space-y-0">
              <span className="text-xs text-gray-500">{learner.role}</span>
              <span className="text-xs text-gray-500">{learner.team}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
          <div className="flex items-center space-x-2">
            <div className="hidden sm:block">{getStatusIcon(learner.status)}</div>
            {getStatusBadge(learner.status)}
          </div>
          <div className="flex items-center space-x-2">
            {learner.status === 'pending' && (
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                onClick={() => onActivate(learner.id)}
              >
                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Activate</span>
                <span className="sm:hidden">✓</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 sm:w-48 bg-white border shadow-lg z-50">
                <DropdownMenuItem onClick={() => onEdit(learner)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
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
    </div>
  );
};

export default UserCard;
