
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Award, FileText } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-unboxable-navy">{progress}%</span>
            <Award className="h-6 w-6 text-unboxable-orange" />
          </div>
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-gray-600">
            {completedModules} of {totalModules} modules completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Next Survey Due</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <FileText className="h-6 w-6 text-unboxable-orange" />
          </div>
          <p className="text-sm font-medium text-unboxable-navy mb-1">{nextSurvey || 'No surveys available'}</p>
          <Button 
            size="sm" 
            className="w-full bg-unboxable-orange hover:bg-unboxable-orange/90 text-white"
            onClick={onStartSurvey}
            disabled={!nextSurvey}
          >
            Start Survey
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium text-green-600">{completedModules}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">In Progress</span>
              <span className="font-medium text-unboxable-orange">0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Upcoming</span>
              <span className="font-medium text-gray-600">0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressOverview;
