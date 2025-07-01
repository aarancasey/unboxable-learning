
import { Button } from '@/components/ui/button';

interface ModuleFormActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isEditMode: boolean;
  isValid: boolean;
}

export const ModuleFormActions = ({ onCancel, onSave, isEditMode, isValid }: ModuleFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-3">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSave} disabled={!isValid}>
        {isEditMode ? 'Update Module' : 'Add Module'}
      </Button>
    </div>
  );
};
