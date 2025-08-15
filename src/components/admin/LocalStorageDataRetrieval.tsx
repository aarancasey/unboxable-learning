import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export const LocalStorageDataRetrieval = () => {
  const [surveyData, setSurveyData] = useState<string>('');
  const [progressData, setProgressData] = useState<string>('');

  const retrieveLocalStorageData = () => {
    try {
      // Check for survey submissions
      const submissions = localStorage.getItem('surveySubmissions');
      const progress = localStorage.getItem('surveyProgress');
      const participantInfo = localStorage.getItem('participantInfo');
      
      let foundData = false;
      
      if (submissions) {
        setSurveyData(JSON.stringify(JSON.parse(submissions), null, 2));
        foundData = true;
      } else {
        setSurveyData('No survey submissions found in localStorage');
      }
      
      if (progress || participantInfo) {
        const progressObj: any = {};
        if (progress) progressObj.surveyProgress = JSON.parse(progress);
        if (participantInfo) progressObj.participantInfo = JSON.parse(participantInfo);
        
        setProgressData(JSON.stringify(progressObj, null, 2));
        foundData = true;
      } else {
        setProgressData('No survey progress found in localStorage');
      }

      if (foundData) {
        toast({
          title: "Data Retrieved",
          description: "Found survey data in localStorage"
        });
      } else {
        toast({
          title: "No Data Found",
          description: "No survey data found in localStorage",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error retrieving localStorage data:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve localStorage data",
        variant: "destructive"
      });
    }
  };

  const clearLocalStorageData = () => {
    localStorage.removeItem('surveySubmissions');
    localStorage.removeItem('surveyProgress');
    localStorage.removeItem('participantInfo');
    setSurveyData('');
    setProgressData('');
    
    toast({
      title: "Cleared",
      description: "Cleared survey data from localStorage"
    });
  };

  const copyToClipboard = (data: string) => {
    navigator.clipboard.writeText(data);
    toast({
      title: "Copied",
      description: "Data copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Local Storage Survey Data Retrieval</CardTitle>
          <CardDescription>
            Check for survey data that may have been stored locally due to authentication issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={retrieveLocalStorageData} className="mr-2">
            Retrieve Survey Data
          </Button>
          <Button onClick={clearLocalStorageData} variant="outline">
            Clear Local Data
          </Button>
        </CardContent>
      </Card>

      {surveyData && (
        <Card>
          <CardHeader>
            <CardTitle>Survey Submissions</CardTitle>
            <CardDescription>
              Completed survey submissions found in localStorage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => copyToClipboard(surveyData)}
              >
                Copy Survey Data
              </Button>
              <Textarea
                value={surveyData}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {progressData && (
        <Card>
          <CardHeader>
            <CardTitle>Survey Progress & Participant Info</CardTitle>
            <CardDescription>
              In-progress survey data and participant information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => copyToClipboard(progressData)}
              >
                Copy Progress Data
              </Button>
              <Textarea
                value={progressData}
                readOnly
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};