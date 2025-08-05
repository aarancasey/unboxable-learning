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
      className="space-y-4"
    >
      {question.scaleLabels?.map((label, index) => (
        <div key={index} className={`survey-option ${value === (index + 1).toString() ? 'selected' : ''}`}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <RadioGroupItem 
                value={(index + 1).toString()} 
                id={`scale-${index}`}
                className="border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>
            <Label 
              htmlFor={`scale-${index}`} 
              className="flex-1 cursor-pointer leading-relaxed"
            >
              <div className="flex items-start space-x-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {index + 1}
                </span>
                <span className="text-base font-medium text-foreground">{label}</span>
              </div>
            </Label>
          </div>
        </div>
      ))}
    </RadioGroup>
  );
};