
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModuleBasicFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  type: 'survey' | 'video' | 'document' | 'interactive';
  setType: (type: 'survey' | 'video' | 'document' | 'interactive') => void;
  duration: string;
  setDuration: (duration: string) => void;
  description: string;
  setDescription: (description: string) => void;
}

export const ModuleBasicFields = ({
  title,
  setTitle,
  type,
  setType,
  duration,
  setDuration,
  description,
  setDescription,
}: ModuleBasicFieldsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="moduleTitle">Module Title</Label>
        <Input
          id="moduleTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter module title"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="moduleType">Module Type</Label>
          <Select value={type} onValueChange={(value: any) => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select module type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="survey">Survey</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="interactive">Interactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="moduleDuration">Duration</Label>
          <Input
            id="moduleDuration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 30 min"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="moduleDescription">Description</Label>
        <Textarea
          id="moduleDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what learners will gain from this module..."
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
};
