import { Textarea } from '@/components/ui/textarea';
import { TextQuestion } from './types';

interface TextQuestionComponentProps {
  question: TextQuestion;
  value: string;
  onChange: (value: string) => void;
}

export const TextQuestionComponent = ({ question, value, onChange }: TextQuestionComponentProps) => {
  return (
    <Textarea
      placeholder="Please share your thoughts..."
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-[120px]"
    />
  );
};