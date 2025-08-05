import { ScaleGridQuestion } from './types';

interface ScaleGridQuestionComponentProps {
  question: ScaleGridQuestion;
  answers: Record<string, string>;
  onAnswerChange: (promptIndex: number, value: string) => void;
}

export const ScaleGridQuestionComponent = ({ question, answers, onAnswerChange }: ScaleGridQuestionComponentProps) => {
  return (
    <div className="space-y-4">
      {question.prompts?.map((prompt, promptIndex) => (
        <div key={promptIndex} className="flex items-center justify-between gap-6">
          {/* Statement */}
          <div className="text-base font-medium text-foreground flex-1">
            {prompt}
          </div>
          
          {/* Radio buttons row - aligned with text */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <label key={value} className="cursor-pointer flex items-center gap-1">
                <input
                  type="radio"
                  name={`${question.id}_${promptIndex}`}
                  value={value.toString()}
                  checked={answers[`${question.id}_${promptIndex}`] === value.toString()}
                  onChange={(e) => onAnswerChange(promptIndex, e.target.value)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  answers[`${question.id}_${promptIndex}`] === value.toString()
                    ? 'bg-unboxable-orange border-unboxable-orange'
                    : 'border-gray-400 hover:border-unboxable-orange'
                }`}>
                  {answers[`${question.id}_${promptIndex}`] === value.toString() && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-sm font-medium">{value}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      
      {/* Labels at the bottom */}
      <div className="flex justify-between text-sm text-muted-foreground pt-6 mt-6 border-t border-gray-200">
        <span>1 = Never/Not at all true</span>
        <span>6 = Always/Very true</span>
      </div>
    </div>
  );
};