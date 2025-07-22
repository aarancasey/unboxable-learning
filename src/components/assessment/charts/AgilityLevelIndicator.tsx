
import { Badge } from '@/components/ui/badge';

interface AgilityLevelIndicatorProps {
  agilityLevel: string;
}

const AGILITY_LEVELS = [
  { name: 'Opportunist', color: 'bg-red-100 text-red-800', value: 1 },
  { name: 'Diplomat', color: 'bg-yellow-100 text-yellow-800', value: 2 },
  { name: 'Expert', color: 'bg-blue-100 text-blue-800', value: 3 },
  { name: 'Achiever', color: 'bg-green-100 text-green-800', value: 4 },
  { name: 'Individualist', color: 'bg-purple-100 text-purple-800', value: 5 },
  { name: 'Strategist', color: 'bg-indigo-100 text-indigo-800', value: 6 },
  { name: 'Alchemist', color: 'bg-pink-100 text-pink-800', value: 7 }
];

export const AgilityLevelIndicator = ({ agilityLevel }: AgilityLevelIndicatorProps) => {
  const currentLevel = AGILITY_LEVELS.find(level => level.name === agilityLevel) || AGILITY_LEVELS[3];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Badge className={`${currentLevel.color} hover:${currentLevel.color} text-base px-4 py-2`}>
          {currentLevel.name}
        </Badge>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-unboxable-navy to-unboxable-orange h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentLevel.value / 7) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>Basic</span>
          <span>Advanced</span>
          <span>Expert</span>
        </div>
      </div>
    </div>
  );
};
