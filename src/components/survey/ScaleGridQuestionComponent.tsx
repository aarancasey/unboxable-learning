import { ScaleGridQuestion } from './types';

interface ScaleGridQuestionComponentProps {
  question: ScaleGridQuestion;
  answers: Record<string, string>;
  onAnswerChange: (promptIndex: number, value: string) => void;
}

export const ScaleGridQuestionComponent = ({ question, answers, onAnswerChange }: ScaleGridQuestionComponentProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2 text-xs text-gray-600 mb-4">
        <div></div>
        <div className="text-center">1<br/>Never</div>
        <div className="text-center">2</div>
        <div className="text-center">3</div>
        <div className="text-center">4</div>
        <div className="text-center">5</div>
        <div className="text-center">6<br/>Always</div>
      </div>
      {question.prompts?.map((prompt, promptIndex) => (
        <div key={promptIndex} className="grid grid-cols-7 gap-2 items-center py-2 border-b border-gray-100">
          <div className="text-sm pr-4">{prompt}</div>
          {[1, 2, 3, 4, 5, 6].map((value) => (
            <div key={value} className="flex justify-center">
              <input
                type="radio"
                name={`${question.id}_${promptIndex}`}
                value={value.toString()}
                checked={answers[`${question.id}_${promptIndex}`] === value.toString()}
                onChange={(e) => onAnswerChange(promptIndex, e.target.value)}
                className="w-4 h-4 text-orange-600"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};