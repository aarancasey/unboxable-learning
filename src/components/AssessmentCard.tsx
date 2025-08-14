import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, BookOpen, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface AssessmentCardProps {
  surveyStatus: 'not_started' | 'completed' | 'approved';
  onStartSurvey: () => void;
  onStartPostSurvey?: () => void;
  hasCompletedModules?: boolean;
  courseName?: string;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  surveyStatus,
  onStartSurvey,
  onStartPostSurvey,
  hasCompletedModules = false,
  courseName = "Leadership Development Course"
}) => {
  const getStatusConfig = () => {
    switch (surveyStatus) {
      case 'not_started':
        return {
          title: 'Leadership Assessment',
          description: '',
          status: 'Required',
          statusVariant: 'destructive' as const,
          icon: AlertCircle,
          action: 'Start Assessment',
          onClick: onStartSurvey,
          progress: 0,
          disabled: false
        };
      case 'completed':
        return {
          title: 'Leadership Assessment',
          description: '',
          status: 'Pending Review',
          statusVariant: 'secondary' as const,
          icon: Clock,
          action: 'Waiting for Approval',
          onClick: () => {},
          progress: 50,
          disabled: true
        };
      case 'approved':
        return {
          title: hasCompletedModules ? 'Post-Course Assessment' : 'Leadership Assessment',
          description: '',
          status: hasCompletedModules ? 'Available' : 'Approved',
          statusVariant: 'default' as const,
          icon: CheckCircle,
          action: hasCompletedModules ? 'Start Final Assessment' : 'Assessment Complete',
          onClick: hasCompletedModules ? onStartPostSurvey || (() => {}) : () => {},
          progress: hasCompletedModules ? 75 : 100,
          disabled: !hasCompletedModules && surveyStatus === 'approved'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{config.title}</CardTitle>
            {config.description && (
              <CardDescription className="text-base">
                {config.description}
              </CardDescription>
            )}
          </div>
          <Badge variant={config.statusVariant} className="ml-4">
            {config.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Assessment Progress</span>
            <span className="font-medium">{config.progress}%</span>
          </div>
          <Progress value={config.progress} className="h-2" />
        </div>

        {/* Course Info */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Survey</p>
              <p className="text-xs text-muted-foreground">LeadForward Survey</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Duration</p>
              <p className="text-xs text-muted-foreground">~20 minutes</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={config.onClick}
          disabled={config.disabled}
          className="w-full"
          size="lg"
        >
          <StatusIcon className="h-4 w-4 mr-2" />
          {config.action}
          {!config.disabled && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>

        {/* Status Message */}
        {surveyStatus === 'completed' && (
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your assessment responses are being reviewed. You'll be notified when modules are available.
            </p>
          </div>
        )}

        {surveyStatus === 'approved' && !hasCompletedModules && (
          <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
            <p className="text-sm text-green-700">
              🎉 Great! Your assessment is complete. You can now access all course modules.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};