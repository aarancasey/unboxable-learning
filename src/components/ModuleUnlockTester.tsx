import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, CheckCircle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ModuleUnlockTester = () => {
  const { toast } = useToast();

  const clearSurveyData = () => {
    localStorage.removeItem('surveySubmissions');
    toast({
      title: "Survey data cleared",
      description: "Modules should now be locked. Refresh to see changes.",
    });
    window.location.reload();
  };

  const addMockSurvey = () => {
    const mockSurvey = {
      id: Date.now(),
      title: "Leadership Sentiment, Adaptive and Agile Self-Assessment",
      submittedAt: new Date().toISOString(),
      status: "completed",
      responses: { mock: "data" }
    };
    
    const existingSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
    existingSurveys.push(mockSurvey);
    localStorage.setItem('surveySubmissions', JSON.stringify(existingSurveys));
    
    toast({
      title: "Mock survey added",
      description: "Modules should now be unlocked. Refresh to see changes.",
    });
    window.location.reload();
  };

  const checkCurrentState = () => {
    const surveySubmissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    
    toast({
      title: "Current State",
      description: `Surveys: ${surveySubmissions.length}, Courses: ${courses.length}`,
    });
    
    console.log('=== MODULE UNLOCK TEST STATE ===');
    console.log('Survey submissions:', surveySubmissions.length);
    console.log('Courses:', courses.length);
    console.log('Survey data:', surveySubmissions);
    console.log('Course data:', courses);
  };

  return (
    <Card className="max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Module Unlock Tester</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Use these buttons to test the module unlock functionality
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Button 
            onClick={checkCurrentState} 
            variant="outline" 
            className="w-full"
          >
            Check Current State
          </Button>
          
          <Button 
            onClick={clearSurveyData} 
            variant="destructive" 
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Survey Data (Lock Modules)
          </Button>
          
          <Button 
            onClick={addMockSurvey} 
            variant="default" 
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Add Mock Survey (Unlock Modules)
          </Button>
        </div>
        
        <Alert>
          <AlertDescription className="text-xs">
            After each action, the page will refresh to show the updated state
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ModuleUnlockTester;