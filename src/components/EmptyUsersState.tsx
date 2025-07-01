
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface EmptyUsersStateProps {
  onAddLearner: () => void;
}

const EmptyUsersState = ({ onAddLearner }: EmptyUsersStateProps) => {
  return (
    <div className="text-center py-12">
      <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No learners yet</h3>
      <p className="text-gray-600 mb-6">Get started by adding your first learner to the platform.</p>
      <Button 
        className="bg-unboxable-navy hover:bg-unboxable-navy/90"
        onClick={onAddLearner}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add First Learner
      </Button>
    </div>
  );
};

export default EmptyUsersState;
