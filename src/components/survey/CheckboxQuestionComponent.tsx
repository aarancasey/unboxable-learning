import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CheckboxQuestion } from './types';

interface CheckboxQuestionComponentProps {
  question: CheckboxQuestion;
  value: string[];
  onChange: (value: string[]) => void;
}

export const CheckboxQuestionComponent = ({ question, value, onChange }: CheckboxQuestionComponentProps) => {
  const selectedOptions = value || [];
  const maxSelections = question.maxSelections;

  return (
    <div className="space-y-3">
      {maxSelections && (
        <p className="text-sm text-gray-600 mb-4">
          Select up to {maxSelections} options
        </p>
      )}
      {question.options?.map((option, index) => (
        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
          <Checkbox
            id={`checkbox-${index}`}
            checked={selectedOptions.includes(option)}
            onCheckedChange={(checked) => {
              let newSelection = [...selectedOptions];
              if (checked) {
                if (!maxSelections || newSelection.length < maxSelections) {
                  newSelection.push(option);
                }
              } else {
                newSelection = newSelection.filter(item => item !== option);
              }
              onChange(newSelection);
            }}
            disabled={maxSelections && selectedOptions.length >= maxSelections && !selectedOptions.includes(option)}
            className="mt-1"
          />
          <Label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer leading-relaxed">
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
};