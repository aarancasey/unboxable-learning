
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, Clock } from 'lucide-react';

interface CourseStatsProps {
  modules: number;
  enrolledUsers: number;
  maxEnrollment: number;
  completionRate: number;
  estimatedDuration: string;
}

export const CourseStats = ({ 
  modules, 
  enrolledUsers, 
  maxEnrollment, 
  completionRate, 
  estimatedDuration 
}: CourseStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Modules</p>
              <p className="text-2xl font-bold text-gray-900">{modules}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enrolled Users</p>
              <p className="text-2xl font-bold text-gray-900">{enrolledUsers}/{maxEnrollment}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
            <div className="w-12 h-12 relative">
              <Progress value={completionRate} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Duration</p>
              <p className="text-2xl font-bold text-gray-900">{estimatedDuration}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
