import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

interface CalendarHeaderProps {
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
  onScheduleDialog: () => void;
  onMultiWeekDialog: () => void;
}

export const CalendarHeader = ({
  view,
  onViewChange,
  onScheduleDialog,
  onMultiWeekDialog
}: CalendarHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Course Calendar</h2>
        <p className="text-gray-600">Schedule courses and manage email reminders</p>
      </div>
      
      <div className="flex items-center space-x-3">
        <Tabs value={view} onValueChange={(v) => onViewChange(v as 'week' | 'month')}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex space-x-2">
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={onMultiWeekDialog}
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Course
          </Button>
        </div>
      </div>
    </div>
  );
};