
import { Button } from '@/components/ui/button';

interface CourseFormActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isValid: boolean;
}

export const CourseFormActions = ({ onCancel, onSave, isValid }: CourseFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-3">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSave} disabled={!isValid}>
        Create Course
      </Button>
    </div>
  );
};
