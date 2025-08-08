
import { Badge } from '@/components/ui/badge';

interface AgilityLevelIndicatorProps {
  agilityLevel: string;
}

const AGILITY_LEVELS = [
  { name: 'Opportunist', color: 'bg-red-100 text-red-800', value: 1, description: 'Self-focused, manipulative, opportunistic' },
  { name: 'Diplomat', color: 'bg-yellow-100 text-yellow-800', value: 2, description: 'Seeks approval, avoids conflict, wants to belong' },
  { name: 'Expert', color: 'bg-blue-100 text-blue-800', value: 3, description: 'Seeks efficiency and excellence, values expertise' },
  { name: 'Achiever', color: 'bg-green-100 text-green-800', value: 4, description: 'Results-oriented, strategic, effective manager' },
  { name: 'Individualist', color: 'bg-purple-100 text-purple-800', value: 5, description: 'Creative, authentic, values uniqueness and depth' },
  { name: 'Strategist', color: 'bg-indigo-100 text-indigo-800', value: 6, description: 'Systems thinker, integrative, transformational' },
  { name: 'Alchemist', color: 'bg-pink-100 text-pink-800', value: 7, description: 'Generative, visionary, capable of profound transformation' }
];

export const AgilityLevelIndicator = ({ agilityLevel }: AgilityLevelIndicatorProps) => {
  const currentLevel = AGILITY_LEVELS.find(level => level.name === agilityLevel) || AGILITY_LEVELS[3];
  
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Badge className={`${currentLevel.color} hover:${currentLevel.color} text-base px-4 py-2 mb-2`}>
          {currentLevel.name}
        </Badge>
        <p className="text-sm text-muted-foreground">
          {currentLevel.description}
        </p>
      </div>
      
      <div className="relative">
        <div className="w-full bg-secondary rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-primary to-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(currentLevel.value / 7) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Opportunist</span>
          <span>Achiever</span>
          <span>Alchemist</span>
        </div>
      </div>
      
      <div className="text-center text-sm">
        <span className="font-medium">Level {currentLevel.value}</span> of 7
      </div>
    </div>
  );
};
