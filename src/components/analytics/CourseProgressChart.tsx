import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface CourseProgressChartProps {
  data: Array<{ name: string; completed: number; inProgress: number; notStarted: number }>;
}

export const CourseProgressChart = ({ data }: CourseProgressChartProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>Course Progress Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" />
            <Bar dataKey="inProgress" stackId="a" fill="hsl(var(--accent))" />
            <Bar dataKey="notStarted" stackId="a" fill="hsl(var(--muted))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};