import { Check, Clock, Save, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  saveComplete: boolean;
  hasUnsavedChanges: boolean;
  className?: string;
}

export const ProgressIndicator = ({ 
  isSaving, 
  lastSaved, 
  saveComplete, 
  hasUnsavedChanges,
  className 
}: ProgressIndicatorProps) => {
  const getStatusContent = () => {
    if (isSaving) {
      return {
        icon: Save,
        text: 'Saving...',
        variant: 'saving' as const
      };
    }
    
    if (saveComplete) {
      return {
        icon: Check,
        text: 'Saved',
        variant: 'saved' as const
      };
    }
    
    if (hasUnsavedChanges) {
      return {
        icon: Clock,
        text: 'Unsaved changes',
        variant: 'unsaved' as const
      };
    }
    
    if (lastSaved) {
      return {
        icon: Wifi,
        text: `Last saved: ${formatLastSaved(lastSaved)}`,
        variant: 'default' as const
      };
    }
    
    return {
      icon: WifiOff,
      text: 'Not saved',
      variant: 'error' as const
    };
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return date.toLocaleDateString();
  };

  const { icon: Icon, text, variant } = getStatusContent();

  const getVariantStyles = () => {
    switch (variant) {
      case 'saving':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'saved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unsaved':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-muted-foreground bg-muted/50 border-border';
    }
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors",
      getVariantStyles(),
      className
    )}>
      <Icon className={cn(
        "h-4 w-4",
        isSaving && "animate-spin"
      )} />
      <span>{text}</span>
    </div>
  );
};