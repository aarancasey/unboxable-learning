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
    >
      {question.options?.map((option, index) => (
        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value={option} id={`option-${index}`} className="mt-1" />
          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer leading-relaxed">
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};