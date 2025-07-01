
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Award, ArrowRight } from 'lucide-react';

interface ProgressOverviewProps {
  progress: number;
  completedModules: number;
  totalModules: number;
  nextSurvey: string;
  onStartSurvey: () => void;
}

const ProgressOverview = ({ 
  progress, 
  completedModules, 
  totalModules, 
  nextSurvey, 
  onStartSurvey 
}: ProgressOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(progress)}%</div>
          <Progress value={progress} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedModules}</div>
          <p className="text-xs text-muted-foreground">
            of {totalModules} modules
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Investment</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2.5h</div>
          <p className="text-xs text-muted-foreground">
            total learning time
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Assessment</CardTitle>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium mb-2">{nextSurvey}</div>
          <Button 
            size="sm" 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            onClick={onStartSurvey}
          >
            Start Assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressOverview;
