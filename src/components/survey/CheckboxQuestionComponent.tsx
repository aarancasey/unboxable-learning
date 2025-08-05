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
    <div className="space-y-4">
      {maxSelections && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
          <p className="text-accent font-medium">
            Select up to {maxSelections} options
          </p>
        </div>
      )}
      {question.options?.map((option, index) => (
        <div key={index} className={`survey-option ${selectedOptions.includes(option) ? 'selected' : ''}`}>
          <div className="flex items-start space-x-4">
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
              className="mt-1 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label 
              htmlFor={`checkbox-${index}`} 
              className="flex-1 cursor-pointer text-base leading-relaxed font-medium text-foreground"
            >
              {option}
            </Label>
          </div>
        </div>
      ))}
    </div>
  );
};