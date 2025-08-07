import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Mail, 
  Building, 
  Calendar,
  Save,
  RotateCcw 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LearnerInfoEditorProps {
  learnerInfo: {
    name?: string;
    email?: string;
    team?: string;
    submittedDate?: string;
    notes?: string;
  };
  onChange: (learnerInfo: any) => void;
}

export const LearnerInfoEditor = ({ learnerInfo, onChange }: LearnerInfoEditorProps) => {
  const { toast } = useToast();
  const [localData, setLocalData] = useState(learnerInfo);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalData(learnerInfo);
    setHasChanges(false);
  }, [learnerInfo]);

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    setHasChanges(true);
    onChange(updatedData);
  };

  const handleReset = () => {
    setLocalData(learnerInfo);
    setHasChanges(false);
    onChange(learnerInfo);
    toast({
      title: "Changes Reset",
      description: "Learner information has been reset to original values.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Learner Information</h3>
        <p className="text-sm text-muted-foreground">
          Edit the learner's personal details and metadata for this assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="learner-name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="learner-name"
                value={localData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter learner's full name"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learner-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="learner-email"
                type="email"
                value={localData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="learner-team" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Team
              </Label>
              <Input
                id="learner-team"
                value={localData.team || ''}
                onChange={(e) => handleInputChange('team', e.target.value)}
                placeholder="Enter team"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submitted-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Submission Date
              </Label>
              <Input
                id="submitted-date"
                type="datetime-local"
                value={localData.submittedDate ? new Date(localData.submittedDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('submittedDate', e.target.value)}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="learner-notes">
                Assessment Notes
              </Label>
              <Textarea
                id="learner-notes"
                value={localData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes about this learner or assessment..."
                className="w-full h-32 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                These notes will be included in the exported assessment report.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={!hasChanges}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-blue-900">
                Required Information
              </h4>
              <p className="text-sm text-blue-700">
                The learner's full name is required for generating the assessment report. 
                All other fields are optional but recommended for complete documentation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};