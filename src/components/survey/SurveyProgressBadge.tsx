import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface SurveyProgressBadgeProps {
  status: 'not_started' | 'in_progress' | 'completed';
  className?: string;
}

const SurveyProgressBadge = ({ status, className }: SurveyProgressBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          variant: 'default' as const,
          text: 'Completed',
          icon: CheckCircle,
          className: 'bg-success-background text-success-foreground hover:bg-success-background/80'
        };
      case 'in_progress':
        return {
          variant: 'secondary' as const,
          text: 'In Progress',
          icon: Clock,
          className: 'bg-warning-background text-warning-foreground hover:bg-warning-background/80'
        };
      case 'not_started':
        return {
          variant: 'outline' as const,
          text: 'Not Started',
          icon: XCircle,
          className: 'bg-muted text-muted-foreground hover:bg-muted/80'
        };
      default:
        return {
          variant: 'outline' as const,
          text: 'Unknown',
          icon: XCircle,
          className: 'bg-muted text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
};

export default SurveyProgressBadge;