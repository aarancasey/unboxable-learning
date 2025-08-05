import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { RadioQuestion } from './types';

interface RadioQuestionComponentProps {
  question: RadioQuestion;
  value: string;
  onChange: (value: string) => void;
}

export const RadioQuestionComponent = ({ question, value, onChange }: RadioQuestionComponentProps) => {
  return (
    <RadioGroup
      value={value || ''}
      onValueChange={onChange}
      className="space-y-4"
    >
      {question.options?.map((option, index) => (
        <div key={index} className={`survey-option ${value === option ? 'selected' : ''}`}>
          <div className="flex items-start space-x-4">
            <RadioGroupItem 
              value={option} 
              id={`option-${index}`} 
              className="mt-1 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
            />
            <Label 
              htmlFor={`option-${index}`} 
              className="flex-1 cursor-pointer text-base leading-relaxed font-medium text-foreground"
            >
              {option}
            </Label>
          </div>
        </div>
      ))}
    </RadioGroup>
  );
};