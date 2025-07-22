
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface StrengthsComparisonChartProps {
  strengths: string[];
  developmentAreas: string[];
}

export const StrengthsComparisonChart = ({ strengths, developmentAreas }: StrengthsComparisonChartProps) => {
  const data = [
    {
      category: 'Strengths',
      count: strengths.length,
      fill: 'hsl(142 71% 45%)'
    },
    {
      category: 'Development Areas',
      count: developmentAreas.length,
      fill: 'hsl(16 100% 50%)'
    }
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
        <XAxis type="number" stroke="hsl(215.4 16.3% 46.9%)" />
        <YAxis dataKey="category" type="category" stroke="hsl(215.4 16.3% 46.9%)" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(0 0% 100%)', 
            border: '1px solid hsl(214.3 31.8% 91.4%)',
            borderRadius: '6px',
            fontSize: '12px'
          }}
        />
        <Bar dataKey="count" fill="hsl(235 73% 21%)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
