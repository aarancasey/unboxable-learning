import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  X, 
  User, 
  FileText, 
  BarChart3, 
  Award, 
  Eye,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LearnerInfoEditor } from './editors/LearnerInfoEditor';
import { ContentEditor } from './editors/ContentEditor';
import { VisualizationConfigurator } from './editors/VisualizationConfigurator';
import { ScoringEditor } from './editors/ScoringEditor';
import { SummaryPreview } from './editors/SummaryPreview';

interface AISummaryEditorModalProps {
  survey: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSummary: any) => void;
}

export const AISummaryEditorModal = ({ 
  survey, 
  isOpen, 
  onClose, 
  onSave 
}: AISummaryEditorModalProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [editedData, setEditedData] = useState<any>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Default AI summary structure
  const defaultSummary = {
    currentLeadershipStyle: "Managing, but close to overload",
    confidenceRating: "Developing Confidence (2.5–3.4)",
    strongestArea: "Motivate and align your team",
    focusArea: "Lead through complexity and ambiguity",
    leadershipAspirations: ["Empowering and people-centred", "Strategic and future-focused", "Curious and adaptive"],
    purposeRating: 4,
    agilityLevel: "Achiever",
    topStrengths: ["Action Orientation & Delivery", "Decision-Making Agility", "Empowering Others & Collaboration"],
    developmentAreas: ["Navigating Change & Uncertainty", "Strategic Agility & Systems Thinking", "Learning Agility & Growth Mindset"],
    overallAssessment: "This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.",
    rubricAssessments: [
      {
        rubricId: 'leadership-assessment',
        rubricName: 'Leadership Assessment',
        overallScore: 2.8,
        maxScore: 4,
        criteriaScores: [
          { criterion: 'Communication Skills', score: 3.2, maxScore: 4, weight: 25 },
          { criterion: 'Decision Making', score: 2.8, maxScore: 4, weight: 25 },
          { criterion: 'Team Management', score: 3.1, maxScore: 4, weight: 25 },
          { criterion: 'Strategic Thinking', score: 2.1, maxScore: 4, weight: 25 }
        ]
      }
    ],
    visualizations: {
      charts: ['radar', 'strengths', 'purpose', 'confidence'],
      radarChart: { enabled: true, type: 'competency' },
      strengthsChart: { enabled: true, type: 'bar' },
      purposeGauge: { enabled: true, maxRating: 6 },
      confidenceBar: { enabled: true }
    },
    learnerInfo: {
      name: survey.learner_name || survey.learner || '',
      email: survey.email || '',
      team: survey.team || '',
      submittedDate: survey.submitted_at || survey.submittedDate || new Date().toISOString()
    }
  };

  // Initialize edited data when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialData = {
        ...defaultSummary,
        ...(survey.aiSummary || {}),
        learnerInfo: {
          ...defaultSummary.learnerInfo,
          name: survey.learner_name || survey.learner || '',
          email: survey.email || '',
          team: survey.team || '',
          submittedDate: survey.submitted_at || survey.submittedDate || new Date().toISOString()
        }
      };
      setEditedData(initialData);
      setHasUnsavedChanges(false);
    }
  }, [isOpen, survey]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges && isOpen) {
      const autoSaveTimer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, editedData, isOpen]);

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges) return;
    
    setIsAutoSaving(true);
    try {
      // Save to localStorage as draft
      const draftKey = `ai-summary-draft-${survey.id}`;
      localStorage.setItem(draftKey, JSON.stringify(editedData));
      
      toast({
        title: "Draft Saved",
        description: "Your changes have been automatically saved.",
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleDataChange = (section: string, data: any) => {
    setEditedData(prev => ({
      ...prev,
      [section]: data
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // Validate required fields
    if (!editedData.learnerInfo?.name) {
      toast({
        title: "Validation Error",
        description: "Learner name is required.",
        variant: "destructive"
      });
      setActiveTab('overview');
      return;
    }

    try {
      onSave(editedData);
      
      // Clear draft from localStorage
      const draftKey = `ai-summary-draft-${survey.id}`;
      localStorage.removeItem(draftKey);
      
      setHasUnsavedChanges(false);
      onClose();
      
      toast({
        title: "Summary Updated",
        description: "AI assessment summary has been successfully updated.",
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setHasUnsavedChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const tabConfig = [
    { 
      id: 'overview', 
      label: 'Learner Info', 
      icon: User,
      description: 'Edit learner details and metadata'
    },
    { 
      id: 'content', 
      label: 'Content', 
      icon: FileText,
      description: 'Edit summary text and descriptions'
    },
    { 
      id: 'visualizations', 
      label: 'Charts', 
      icon: BarChart3,
      description: 'Configure data visualizations'
    },
    { 
      id: 'scoring', 
      label: 'Scoring', 
      icon: Award,
      description: 'Adjust rubric scores and assessments'
    },
    { 
      id: 'preview', 
      label: 'Preview', 
      icon: Eye,
      description: 'Preview the final assessment'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Edit AI Assessment Summary
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Customize the AI-generated leadership assessment for {editedData.learnerInfo?.name || 'this learner'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Unsaved changes</span>
                </div>
              )}
              
              {isAutoSaving && (
                <Badge variant="outline" className="text-blue-600">
                  Auto-saving...
                </Badge>
              )}
              
              <Button variant="outline" onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="px-6 py-3 border-b bg-muted/30">
              <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                {tabConfig.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="flex flex-col items-center gap-1 p-3 h-auto"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-xs font-medium">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="overview" className="p-6 m-0">
                <LearnerInfoEditor
                  learnerInfo={editedData.learnerInfo || {}}
                  onChange={(data) => handleDataChange('learnerInfo', data)}
                />
              </TabsContent>

              <TabsContent value="content" className="p-6 m-0">
                <ContentEditor
                  content={editedData}
                  onChange={(data) => setEditedData(prev => ({ ...prev, ...data }))}
                />
              </TabsContent>

              <TabsContent value="visualizations" className="p-6 m-0">
                <VisualizationConfigurator
                  visualizations={editedData.visualizations || {}}
                  onChange={(data) => handleDataChange('visualizations', data)}
                />
              </TabsContent>

              <TabsContent value="scoring" className="p-6 m-0">
                <ScoringEditor
                  rubricAssessments={editedData.rubricAssessments || []}
                  purposeRating={editedData.purposeRating || 4}
                  agilityLevel={editedData.agilityLevel || 'Achiever'}
                  onChange={(data) => setEditedData(prev => ({ ...prev, ...data }))}
                />
              </TabsContent>

              <TabsContent value="preview" className="p-6 m-0">
                <SummaryPreview
                  summaryData={editedData}
                  survey={survey}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};