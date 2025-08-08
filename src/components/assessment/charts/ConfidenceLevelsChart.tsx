import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

interface ConfidenceLevelsChartProps {
  confidenceLevels: {
    strategicVision: number;
    teamLeadership: number;
    decisionMaking: number;
    changeManagement: number;
    communication: number;
    leadershipPresence: number;
    relationships: number;
  };
}

export const ConfidenceLevelsChart = ({ confidenceLevels }: ConfidenceLevelsChartProps) => {
  const data = [
    { name: 'Strategic Vision & Direction', value: confidenceLevels.strategicVision, label: 'Strategic Vision' },
    { name: 'Team Leadership & Motivation', value: confidenceLevels.teamLeadership, label: 'Team Leadership' },
    { name: 'Decision Making Under Pressure', value: confidenceLevels.decisionMaking, label: 'Decision Making' },
    { name: 'Managing Change & Uncertainty', value: confidenceLevels.changeManagement, label: 'Change Management' },
    { name: 'Communication & Influence', value: confidenceLevels.communication, label: 'Communication' },
    { name: 'Personal Leadership Presence', value: confidenceLevels.leadershipPresence, label: 'Leadership Presence' },
    { name: 'Building & Maintaining Relationships', value: confidenceLevels.relationships, label: 'Relationships' },
  ];

  const getBarColor = (value: number) => {
    if (value >= 4.5) return 'hsl(142 76% 36%)'; // Green for strong confidence
    if (value >= 3.5) return 'hsl(47 96% 53%)'; // Yellow for solid foundations
    if (value >= 2.5) return 'hsl(25 95% 53%)'; // Orange for developing
    return 'hsl(0 84% 60%)'; // Red for early stages
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 5]} />
          <YAxis 
            type="category" 
            dataKey="label" 
            width={120}
            tick={{ fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(0 84% 60%)' }}></div>
          <span>1.0-2.4: Early stages</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(25 95% 53%)' }}></div>
          <span>2.5-3.4: Developing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(47 96% 53%)' }}></div>
          <span>3.5-4.4: Solid foundations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(142 76% 36%)' }}></div>
          <span>4.5-5.0: Strong confidence</span>
        </div>
      </div>
    </div>
  );
};