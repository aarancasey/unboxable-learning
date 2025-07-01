
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, PlayCircle, CheckCircle, FileText, Clock } from 'lucide-react';

interface ModuleViewerProps {
  module: any;
  onBack: () => void;
  onComplete: () => void;
}

const ModuleViewer = ({ module, onBack, onComplete }: ModuleViewerProps) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState(0);

  const mockModuleContent = {
    sections: [
      {
        id: 1,
        title: "Introduction",
        type: "video",
        content: "Welcome to this learning module. In this section, we'll cover the fundamental concepts and objectives.",
        duration: "3 min"
      },
      {
        id: 2,
        title: "Core Concepts",
        type: "text",
        content: "Let's dive into the main topics. This section covers the essential knowledge you need to understand before moving forward. We'll explore practical applications and real-world examples that will help you grasp these concepts better.",
        duration: "5 min"
      },
      {
        id: 3,
        title: "Interactive Exercise",
        type: "interactive",
        content: "Now it's time to put your knowledge into practice. Complete the following interactive exercises to reinforce your learning.",
        duration: "7 min"
      },
      {
        id: 4,
        title: "Summary & Next Steps",
        type: "text",
        content: "Congratulations on completing this module! Let's review the key takeaways and prepare for the next learning milestone.",
        duration: "2 min"
      }
    ]
  };

  const handleNext = () => {
    if (currentSection < mockModuleContent.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setProgress(((currentSection + 2) / mockModuleContent.sections.length) * 100);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setProgress(((currentSection) / mockModuleContent.sections.length) * 100);
    }
  };

  const currentSectionData = mockModuleContent.sections[currentSection];

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="h-5 w-5 text-blue-600" />;
      case 'interactive':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-purple-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{module.title}</h1>
                <p className="text-sm text-gray-600">{module.duration} • {module.type}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Module Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mb-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Section {currentSection + 1} of {mockModuleContent.sections.length}</span>
              <span>{currentSectionData.duration} remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Module Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getSectionIcon(currentSectionData.type)}
              <span>{currentSectionData.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {currentSectionData.type === 'video' && (
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-4">
                <div className="text-center text-white">
                  <PlayCircle className="h-16 w-16 mx-auto mb-2 opacity-80" />
                  <p className="text-sm opacity-80">Video Player Placeholder</p>
                  <p className="text-xs opacity-60">Duration: {currentSectionData.duration}</p>
                </div>
              </div>
            )}
            
            {currentSectionData.type === 'interactive' && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-8 text-center mb-4">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Exercise</h3>
                <p className="text-gray-600 mb-4">This would contain interactive elements like quizzes, drag-and-drop activities, or simulations.</p>
                <Button className="bg-green-600 hover:bg-green-700">
                  Start Exercise
                </Button>
              </div>
            )}

            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{currentSectionData.content}</p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentSection === 0}
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {mockModuleContent.sections.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentSection ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button 
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentSection === mockModuleContent.sections.length - 1 ? 'Complete Module' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModuleViewer;
