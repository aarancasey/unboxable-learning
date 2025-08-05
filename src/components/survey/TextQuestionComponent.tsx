import { Textarea } from '@/components/ui/textarea';
import { TextQuestion } from './types';

interface TextQuestionComponentProps {
  question: TextQuestion;
  value: string;
  onChange: (value: string) => void;
}

export const TextQuestionComponent = ({ question, value, onChange }: TextQuestionComponentProps) => {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Please share your thoughts and experiences in detail..."
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[160px] text-base leading-relaxed border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none rounded-xl"
      />
      <div className="text-xs text-muted-foreground">
        Take your time to provide thoughtful, detailed responses that will help create a comprehensive assessment.
      </div>
    </div>
  );
};