import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScaleQuestion } from './types';

interface ScaleQuestionComponentProps {
  question: ScaleQuestion;
  value: string;
  onChange: (value: string) => void;
}

export const ScaleQuestionComponent = ({ question, value, onChange }: ScaleQuestionComponentProps) => {
  return (
    <RadioGroup
      value={value || ''}
      onValueChange={onChange}
    >
      {question.scaleLabels?.map((label, index) => (
        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
          <RadioGroupItem value={(index + 1).toString()} id={`scale-${index}`} className="mt-1" />
          <Label htmlFor={`scale-${index}`} className="flex-1 cursor-pointer leading-relaxed">
            <span className="font-medium mr-2">{index + 1}.</span>
            {label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};