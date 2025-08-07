
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface StrengthsComparisonChartProps {
  strengths: string[];
  developmentAreas: string[];
}

export const StrengthsComparisonChart = ({ strengths, developmentAreas }: StrengthsComparisonChartProps) => {
  // If no data, return empty state
  if (!strengths.length && !developmentAreas.length) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        <p className="text-sm">No strengths or development areas data available</p>
      </div>
    );
  }

  // Create data combining both strengths and development areas
  const allItems = [
    ...strengths.map((item, index) => ({
      name: item.length > 25 ? item.substring(0, 25) + '...' : item,
      fullName: item,
      value: 5, // Strengths get higher value
      type: 'Strength',
      fill: 'hsl(142 71% 45%)'
    })),
    ...developmentAreas.map((item, index) => ({
      name: item.length > 25 ? item.substring(0, 25) + '...' : item,
      fullName: item,
      value: 3, // Development areas get lower value
      type: 'Development Area',
      fill: 'hsl(16 100% 50%)'
    }))
  ];

  // Sort by type to group strengths and development areas
  const sortedData = allItems.sort((a, b) => a.type.localeCompare(b.type));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={Math.max(200, allItems.length * 30)}>
        <BarChart data={sortedData} layout="horizontal" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
          <XAxis type="number" stroke="hsl(215.4 16.3% 46.9%)" />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke="hsl(215.4 16.3% 46.9%)" 
            width={90}
            fontSize={11}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(0 0% 100%)', 
              border: '1px solid hsl(214.3 31.8% 91.4%)',
              borderRadius: '6px',
              fontSize: '12px'
            }}
            formatter={(value, name, props) => [
              `${props.payload.type}: ${props.payload.fullName}`,
              ''
            ]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
