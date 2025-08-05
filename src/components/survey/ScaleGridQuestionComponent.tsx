import { ScaleGridQuestion } from './types';

interface ScaleGridQuestionComponentProps {
  question: ScaleGridQuestion;
  answers: Record<string, string>;
  onAnswerChange: (promptIndex: number, value: string) => void;
}

export const ScaleGridQuestionComponent = ({ question, answers, onAnswerChange }: ScaleGridQuestionComponentProps) => {
  return (
    <div className="space-y-8">
      {question.prompts?.map((prompt, promptIndex) => (
        <div key={promptIndex} className="space-y-4">
          {/* Statement */}
          <div className="text-base font-medium text-foreground">
            {prompt}
          </div>
          
          {/* Scale Options */}
          <div className="space-y-3">
            {/* Radio buttons row */}
            <div className="flex items-center justify-between max-w-md">
              {[1, 2, 3, 4, 5, 6].map((value) => (
                <label key={value} className="cursor-pointer">
                  <input
                    type="radio"
                    name={`${question.id}_${promptIndex}`}
                    value={value.toString()}
                    checked={answers[`${question.id}_${promptIndex}`] === value.toString()}
                    onChange={(e) => onAnswerChange(promptIndex, e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                    answers[`${question.id}_${promptIndex}`] === value.toString()
                      ? 'bg-unboxable-orange border-unboxable-orange text-white'
                      : 'border-gray-300 hover:border-unboxable-orange'
                  }`}>
                    {value}
                  </div>
                </label>
              ))}
            </div>
            
            {/* Labels */}
            <div className="flex justify-between text-sm text-muted-foreground max-w-md">
              <span>1 = Never/Not at all true</span>
              <span>6 = Always/Very true</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};