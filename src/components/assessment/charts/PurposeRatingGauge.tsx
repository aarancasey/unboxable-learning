
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PurposeRatingGaugeProps {
  rating: number;
  maxRating?: number;
}

export const PurposeRatingGauge = ({ rating, maxRating = 6 }: PurposeRatingGaugeProps) => {
  const percentage = (rating / maxRating) * 100;
  
  const data = [
    { name: 'completed', value: percentage },
    { name: 'remaining', value: 100 - percentage }
  ];

  const COLORS = {
    completed: 'hsl(16 100% 50%)', // Unboxable Orange
    remaining: 'hsl(210 40% 96.1%)', // Light gray
  };

  return (
    <div className="relative w-32 h-32 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={450}
            innerRadius={35}
            outerRadius={60}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-unboxable-navy">{rating}</div>
        <div className="text-xs text-gray-600">/ {maxRating}</div>
      </div>
    </div>
  );
};
