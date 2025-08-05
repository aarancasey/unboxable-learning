import { ScaleGridQuestion } from './types';

interface ScaleGridQuestionComponentProps {
  question: ScaleGridQuestion;
  answers: Record<string, string>;
  onAnswerChange: (promptIndex: number, value: string) => void;
}

export const ScaleGridQuestionComponent = ({ question, answers, onAnswerChange }: ScaleGridQuestionComponentProps) => {
  return (
    <div className="survey-scale-grid">
      {/* Scale Header */}
      <div className="grid grid-cols-8 gap-3 mb-6 pb-4 border-b border-border">
        <div className="text-sm font-semibold text-primary">Statement</div>
        <div className="text-center">
          <div className="text-xs font-medium text-primary mb-1">1</div>
          <div className="text-xs text-muted-foreground">Never</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-primary mb-1">2</div>
          <div className="text-xs text-muted-foreground">Rarely</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-primary mb-1">3</div>
          <div className="text-xs text-muted-foreground">Sometimes</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-primary mb-1">4</div>
          <div className="text-xs text-muted-foreground">Often</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-primary mb-1">5</div>
          <div className="text-xs text-muted-foreground">Usually</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-primary mb-1">6</div>
          <div className="text-xs text-muted-foreground">Always</div>
        </div>
      </div>

      {/* Scale Grid Items */}
      <div className="space-y-4">
        {question.prompts?.map((prompt, promptIndex) => (
          <div key={promptIndex} className="grid grid-cols-8 gap-3 items-center py-4 px-2 rounded-lg hover:bg-background/50 transition-colors">
            <div className="text-sm font-medium text-foreground pr-2">{prompt}</div>
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <div key={value} className="flex justify-center">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name={`${question.id}_${promptIndex}`}
                    value={value.toString()}
                    checked={answers[`${question.id}_${promptIndex}`] === value.toString()}
                    onChange={(e) => onAnswerChange(promptIndex, e.target.value)}
                    className="sr-only"
                  />
                  <div className={`survey-scale-option ${answers[`${question.id}_${promptIndex}`] === value.toString() ? 'selected' : ''}`}>
                    {value}
                  </div>
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};