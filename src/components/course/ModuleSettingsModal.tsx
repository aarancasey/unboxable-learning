
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Module {
  id: number;
  title: string;
  type: string;
  duration: string;
  status: string;
}

interface ModuleSettingsModalProps {
  module: Module | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (moduleData: Partial<Module>) => void;
}

export const ModuleSettingsModal = ({ module, open, onOpenChange, onSave }: ModuleSettingsModalProps) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (module) {
      setTitle(module.title);
      setType(module.type);
      setDuration(module.duration);
      setStatus(module.status);
      setDescription('');
    }
  }, [module]);

  const handleSave = () => {
    if (!module) return;
    
    const updatedModule = {
      id: module.id,
      title,
      type,
      duration,
      status,
    };
    
    onSave(updatedModule);
    onOpenChange(false);
  };

  const isValid = title.trim() && duration.trim() && type && status;

  if (!module) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Module: {module.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Select value={type} onValueChange={setType}>
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
                <Label htmlFor="moduleStatus">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
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
            </CardContent>
          </Card>

          {/* Content Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Content management for {type} modules can be configured through the advanced settings panel.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isValid}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
