import { Question, ScaleGridQuestion } from './types';
import { RadioQuestionComponent } from './RadioQuestionComponent';
import { CheckboxQuestionComponent } from './CheckboxQuestionComponent';
import { ScaleQuestionComponent } from './ScaleQuestionComponent';
import { ScaleGridQuestionComponent } from './ScaleGridQuestionComponent';
import { TextQuestionComponent } from './TextQuestionComponent';

interface QuestionRendererProps {
  question: Question;
  answers: Record<string, string | string[]>;
  onAnswerChange: (value: string | string[]) => void;
  onScaleGridChange: (promptIndex: number, value: string) => void;
}

export const QuestionRenderer = ({ question, answers, onAnswerChange, onScaleGridChange }: QuestionRendererProps) => {
  switch (question.type) {
    case 'radio':
      return (
        <RadioQuestionComponent
          question={question}
          value={answers[question.id] as string}
          onChange={onAnswerChange}
        />
      );

    case 'checkbox':
      return (
        <CheckboxQuestionComponent
          question={question}
          value={answers[question.id] as string[]}
          onChange={onAnswerChange}
        />
      );

    case 'scale':
      return (
        <ScaleQuestionComponent
          question={question}
          value={answers[question.id] as string}
          onChange={onAnswerChange}
        />
      );

    case 'scale-grid':
      return (
        <ScaleGridQuestionComponent
          question={question as ScaleGridQuestion}
          answers={answers as Record<string, string>}
          onAnswerChange={onScaleGridChange}
        />
      );

    case 'text':
      return (
        <TextQuestionComponent
          question={question}
          value={answers[question.id] as string}
          onChange={onAnswerChange}
        />
      );

    default:
      return null;
  }
};