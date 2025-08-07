import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { dateHelpers } from '@/lib/dateUtils';

interface CalendarNavigationProps {
  currentDate: Date;
  view: 'week' | 'month';
  onNavigate: (direction: 'prev' | 'next') => void;
}

export const CalendarNavigation = ({
  currentDate,
  view,
  onNavigate
}: CalendarNavigationProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" size="sm" onClick={() => onNavigate('prev')}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <CardTitle className="text-xl">
        {format(currentDate, view === 'week' ? 'd MMM yyyy' : 'MMMM yyyy')}
      </CardTitle>
      
      <Button variant="outline" size="sm" onClick={() => onNavigate('next')}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};