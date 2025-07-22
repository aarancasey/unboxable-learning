
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface RubricScoresRadarProps {
  data: Array<{
    criterion: string;
    score: number;
    fullMark: number;
  }>;
}

export const RubricScoresRadar = ({ data }: RubricScoresRadarProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(214.3 31.8% 91.4%)" />
        <PolarAngleAxis 
          dataKey="criterion" 
          tick={{ fontSize: 11, fill: 'hsl(235 73% 21%)' }}
          className="text-xs"
        />
        <PolarRadiusAxis 
          angle={0} 
          domain={[0, 5]} 
          tick={{ fontSize: 10, fill: 'hsl(215.4 16.3% 46.9%)' }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="hsl(235 73% 21%)"
          fill="hsl(235 73% 21%)"
          fillOpacity={0.1}
          strokeWidth={2}
          dot={{ fill: 'hsl(16 100% 50%)', strokeWidth: 2, r: 4 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};
