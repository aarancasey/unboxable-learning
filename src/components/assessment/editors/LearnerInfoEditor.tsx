import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Building, 
  Calendar,
  Save,
  RotateCcw,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataService } from '@/services/dataService';

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
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [foundLearner, setFoundLearner] = useState<any>(null);

  useEffect(() => {
    setLocalData(learnerInfo);
    setHasChanges(false);
    
    // Auto-search for existing learner data on component mount
    if (learnerInfo.email || learnerInfo.name) {
      searchForExistingLearner();
    }
  }, [learnerInfo]);

  const searchForExistingLearner = async () => {
    if (!localData.email && !localData.name) return;
    
    setIsSearching(true);
    try {
      const learners = await DataService.getLearners();
      const matches = learners.filter(learner => {
        const emailMatch = localData.email && learner.email?.toLowerCase() === localData.email.toLowerCase();
        const nameMatch = localData.name && learner.name?.toLowerCase().includes(localData.name.toLowerCase());
        return emailMatch || nameMatch;
      });
      
      setSearchResults(matches);
      
      if (matches.length === 1) {
        const match = matches[0];
        setFoundLearner(match);
        toast({
          title: "Learner Found",
          description: `Found matching learner: ${match.name} (${match.email})`,
        });
      } else if (matches.length > 1) {
        toast({
          title: "Multiple Matches",
          description: `Found ${matches.length} potential matches. You can select one below.`,
        });
      }
    } catch (error) {
      console.error('Error searching for learner:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const applyLearnerData = (learner: any) => {
    const updatedData = {
      ...localData,
      name: learner.name,
      email: learner.email,
      team: learner.team,
    };
    setLocalData(updatedData);
    setFoundLearner(learner);
    setHasChanges(true);
    onChange(updatedData);
    
    toast({
      title: "Data Applied",
      description: `Applied data from ${learner.name}`,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    setHasChanges(true);
    onChange(updatedData);
    
    // If email or name changed, clear found learner and search again
    if (field === 'email' || field === 'name') {
      setFoundLearner(null);
      if (value.trim()) {
        setTimeout(() => searchForExistingLearner(), 500); // Debounce search
      }
    }
  };

  const handleReset = () => {
    setLocalData(learnerInfo);
    setHasChanges(false);
    setFoundLearner(null);
    setSearchResults([]);
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
          {foundLearner && (
            <span className="text-green-600 font-medium"> 
              Data automatically populated from learner database.
            </span>
          )}
        </p>
      </div>

      {/* Auto-populated data notice */}
      {foundLearner && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-900">
                  Learner Data Found
                </h4>
                <p className="text-sm text-green-700">
                  Information has been automatically populated from the learner database for <strong>{foundLearner.name}</strong>.
                  You can edit these values if needed.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Team: {foundLearner.team || 'Not specified'}
                  </Badge>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    Status: {foundLearner.status || 'Active'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multiple matches found */}
      {searchResults.length > 1 && !foundLearner && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Multiple Learners Found
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-blue-700 mb-3">
              Found {searchResults.length} potential matches. Select one to auto-populate the data:
            </p>
            <div className="space-y-2">
              {searchResults.slice(0, 5).map((learner) => (
                <div 
                  key={learner.id} 
                  className="flex items-center justify-between p-2 bg-white rounded border border-blue-200"
                >
                  <div>
                    <p className="text-sm font-medium">{learner.name}</p>
                    <p className="text-xs text-muted-foreground">{learner.email} • {learner.team || 'No team'}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => applyLearnerData(learner)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    Use This Data
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Details
              {isSearching && (
                <Badge variant="outline" className="ml-auto">
                  <Search className="h-3 w-3 mr-1" />
                  Searching...
                </Badge>
              )}
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
              
              <Button 
                variant="outline" 
                onClick={searchForExistingLearner}
                disabled={isSearching || (!localData.email && !localData.name)}
                className="flex-1"
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? 'Searching...' : 'Search Database'}
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