
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserCard from './UserCard';
import EmptyUsersState from './EmptyUsersState';

interface Learner {
  id: number;
  name: string;
  email: string;
  status: string;
  team: string;
  role: string;
  cohort?: string;
  survey_access_enabled?: boolean;
}

interface UsersListProps {
  learners: Learner[];
  filteredUsers: Learner[];
  onAddLearner: () => void;
  onActivateLearner: (learnerId: number) => void;
  onDeleteLearner: (learnerId: number) => void;
  onResendInvite: (learnerId: number) => void;
  onEditLearner: (learner: Learner) => void;
  onToggleSurveyAccess: (cohort: string, enabled: boolean) => void;
}

const UsersList = ({ learners, filteredUsers, onAddLearner, onActivateLearner, onDeleteLearner, onResendInvite, onEditLearner, onToggleSurveyAccess }: UsersListProps) => {
  const cohortALearners = filteredUsers.filter(learner => learner.cohort === 'A');
  const cohortBLearners = filteredUsers.filter(learner => learner.cohort === 'B');

  const renderCohortContent = (cohort: string, cohortLearners: Learner[], title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title} ({cohortLearners.length})</span>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {cohortLearners.filter(l => l.status === 'active').length} active users
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Survey Access:</span>
              <Button
                variant={cohortLearners.some(l => l.survey_access_enabled) ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleSurveyAccess(cohort, !cohortLearners.some(l => l.survey_access_enabled))}
              >
                {cohortLearners.some(l => l.survey_access_enabled) ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {cohortLearners.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No learners in {title} yet. 
            {cohort === 'A' && <button onClick={onAddLearner} className="text-primary hover:underline ml-1">Add learners</button>}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {cohortLearners.map((learner) => (
              <UserCard
                key={learner.id}
                learner={learner}
                onActivate={onActivateLearner}
                onDelete={onDeleteLearner}
                onResendInvite={onResendInvite}
                onEdit={onEditLearner}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (learners.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyUsersState onAddLearner={onAddLearner} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="A" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="A">Cohort A ({cohortALearners.length})</TabsTrigger>
        <TabsTrigger value="B">Cohort B ({cohortBLearners.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="A" className="mt-6">
        {renderCohortContent('A', cohortALearners, 'Cohort A')}
      </TabsContent>
      <TabsContent value="B" className="mt-6">
        {renderCohortContent('B', cohortBLearners, 'Cohort B')}
      </TabsContent>
    </Tabs>
  );
};

export default UsersList;
