import { Mail } from 'lucide-react';
import { EmailEvent as EmailEventType } from '../types';

interface EmailEventProps {
  emailEvent: EmailEventType;
}

export const EmailEvent = ({ emailEvent }: EmailEventProps) => {
  return (
    <div
      className="text-xs p-1 rounded border-l-2"
      style={{
        backgroundColor: `${emailEvent.color}10`,
        borderLeftColor: emailEvent.color,
        color: emailEvent.color
      }}
    >
      <div className="font-medium truncate flex items-center">
        <Mail className="h-3 w-3 mr-1" />
        {emailEvent.title}
      </div>
    </div>
  );
};