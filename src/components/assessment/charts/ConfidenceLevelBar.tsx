
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';

interface ConfidenceLevelBarProps {
  confidenceRating: string;
}

export const ConfidenceLevelBar = ({ confidenceRating }: ConfidenceLevelBarProps) => {
  // Extract numeric value from rating string
  const getConfidenceScore = (rating: string): number => {
    if (rating.includes('2.5–3.4')) return 3;
    if (rating.includes('3.5–4.4')) return 4;
    if (rating.includes('4.5–5.0')) return 5;
    if (rating.includes('1.0–2.4')) return 2;
    return 3; // default
  };

  const score = getConfidenceScore(confidenceRating);
  
  const data = Array.from({ length: 5 }, (_, i) => ({
    level: i + 1,
    value: 1,
    active: i + 1 <= score
  }));

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={data} layout="horizontal">
          <XAxis type="number" hide />
          <YAxis dataKey="level" type="category" hide />
          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.active ? 'hsl(16 100% 50%)' : 'hsl(210 40% 96.1%)'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-gray-600">
        <span>Low</span>
        <span>Developing</span>
        <span>Strong</span>
        <span>Expert</span>
        <span>Mastery</span>
      </div>
    </div>
  );
};
