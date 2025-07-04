
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserCard from './UserCard';
import EmptyUsersState from './EmptyUsersState';

interface Learner {
  id: number;
  name: string;
  email: string;
  status: string;
  department: string;
  mobile: string;
}

interface UsersListProps {
  learners: Learner[];
  filteredUsers: Learner[];
  onAddLearner: () => void;
  onActivateLearner: (learnerId: number) => void;
  onDeleteLearner: (learnerId: number) => void;
  onResendInvite: (learnerId: number) => void;
}

const UsersList = ({ learners, filteredUsers, onAddLearner, onActivateLearner, onDeleteLearner, onResendInvite }: UsersListProps) => {
  return (
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
          <EmptyUsersState onAddLearner={onAddLearner} />
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((learner) => (
              <UserCard
                key={learner.id}
                learner={learner}
                onActivate={onActivateLearner}
                onDelete={onDeleteLearner}
                onResendInvite={onResendInvite}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersList;
