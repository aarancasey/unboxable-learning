import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Send, RotateCcw, FileText } from 'lucide-react';

interface SurveyActionButtonProps {
  surveyStatus: 'not_started' | 'in_progress' | 'completed';
  learnerName: string;
  learnerEmail: string;
  onViewSurvey?: () => void;
  onSendReminder?: () => void;
  onResetSurvey?: () => void;
  onViewResults?: () => void;
}

const SurveyActionButton = ({ 
  surveyStatus, 
  learnerName, 
  learnerEmail,
  onViewSurvey, 
  onSendReminder, 
  onResetSurvey,
  onViewResults 
}: SurveyActionButtonProps) => {
  const getAvailableActions = () => {
    const actions = [
      {
        key: 'view',
        label: 'View Survey',
        icon: Eye,
        action: onViewSurvey,
        available: true
      },
      {
        key: 'results',
        label: 'View Results',
        icon: FileText,
        action: onViewResults,
        available: surveyStatus === 'completed'
      },
      {
        key: 'reminder',
        label: 'Send Reminder',
        icon: Send,
        action: onSendReminder,
        available: surveyStatus !== 'completed'
      },
      {
        key: 'reset',
        label: 'Reset Survey',
        icon: RotateCcw,
        action: onResetSurvey,
        available: surveyStatus !== 'not_started'
      }
    ];

    return actions.filter(action => action.available && action.action);
  };

  const availableActions = getAvailableActions();

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Survey actions for {learnerName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {availableActions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.key}
              onClick={action.action}
              className="cursor-pointer"
            >
              <Icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SurveyActionButton;