import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Edit3,
  Save,
  X,
  Download,
  Mail,
  FileText,
  TrendingUp,
  Target,
  Award,
  BarChart3,
  Crown,
  Star,
  Zap,
  Circle,
  Users,
  Lightbulb,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToPDF } from '@/lib/pdfExport';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { PDFPreviewModal } from './PDFPreviewModal';
import { PDFPreviewContent } from './PDFPreviewContent';
import { PurposeRatingGauge } from './charts/PurposeRatingGauge';
import { RubricScoresRadar } from './charts/RubricScoresRadar';
import { StrengthsComparisonChart } from './charts/StrengthsComparisonChart';
import { ConfidenceLevelBar } from './charts/ConfidenceLevelBar';
import { AgilityLevelIndicator } from './charts/AgilityLevelIndicator';
import { getRubricTemplates } from '@/hooks/useRubrics';
import { AISummaryEditorModal } from './AISummaryEditorModal';
import { EmailSendModal } from './EmailSendModal';

interface EditableAISummaryProps {
  survey: any;
  onSummaryUpdate?: (updatedSummary: any) => void;
}

export const EditableAISummary = ({ survey, onSummaryUpdate }: EditableAISummaryProps) => {
  // Get rubric templates for enhanced assessment
  const rubricTemplates = getRubricTemplates();

  // Provide default AI summary structure with enhanced rubrics assessment
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
    ]
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(survey.aiSummary || defaultSummary);
  const [isExporting, setIsExporting] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const { toast } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
    setEditedSummary({ ...(survey.aiSummary || defaultSummary) });
  };

  const handleSave = () => {
    // Update the survey data
    const updatedSurvey = {
      ...survey,
      aiSummary: editedSummary
    };

    // Update in localStorage
    const savedSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
    const updatedSurveys = savedSurveys.map((s: any) => 
      s.id === survey.id ? updatedSurvey : s
    );
    localStorage.setItem('surveySubmissions', JSON.stringify(updatedSurveys));

    if (onSummaryUpdate) {
      onSummaryUpdate(editedSummary);
    }

    setIsEditing(false);
    toast({
      title: "Summary Updated",
      description: "AI assessment summary has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setEditedSummary({ ...(survey.aiSummary || defaultSummary) });
    setIsEditing(false);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(survey, 'leadership-assessment');
      toast({
        title: "Export Successful",
        description: "Leadership assessment has been exported to PDF.",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      console.log('Setting isExporting to false');
      setIsExporting(false);
    }
  };

  const handleSendEmail = () => {
    setShowEmailModal(true);
  };

  const handleExportCSV = () => {
    try {
      const csvData = survey.responses.map((response: any) => ({
        Question: response.question,
        Answer: response.answer
      }));

      const ws = XLSX.utils.json_to_sheet(csvData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Survey Responses');
      
      const learnerName = survey.learner || survey.learner_name || 'unknown';
      const filename = `survey-responses-${learnerName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
      XLSX.writeFile(wb, filename, { bookType: 'csv' });

      toast({
        title: "Export Successful",
        description: "Survey responses exported to CSV.",
      });
    } catch (error) {
      console.error('CSV export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export CSV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportXLS = () => {
    try {
      const xlsData = survey.responses.map((response: any) => ({
        Question: response.question,
        Answer: response.answer
      }));

      const ws = XLSX.utils.json_to_sheet(xlsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Survey Responses');
      
      const learnerName = survey.learner || survey.learner_name || 'unknown';
      const filename = `survey-responses-${learnerName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename, { bookType: 'xlsx' });

      toast({
        title: "Export Successful",
        description: "Survey responses exported to Excel.",
      });
    } catch (error) {
      console.error('Excel export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export Excel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentSummary = isEditing ? editedSummary : (survey.aiSummary || defaultSummary);

  // Prepare radar chart data for rubrics
  const radarData = currentSummary.rubricAssessments?.length > 0 
    ? currentSummary.rubricAssessments[0]?.criteriaScores?.map((criteria: any) => ({
        criterion: criteria.criterion.length > 20 ? criteria.criterion.substring(0, 20) + '...' : criteria.criterion,
        score: criteria.score,
        fullMark: criteria.maxScore || 5
      })) || []
    : [];

  // Get agility level badge properties
  const getAgilityLevelBadge = (level: string) => {
    const levels = {
      'Opportunist': { icon: Circle, color: 'bg-red-100 text-red-800', description: 'Basic level' },
      'Diplomat': { icon: Users, color: 'bg-yellow-100 text-yellow-800', description: 'Relationship focused' },
      'Expert': { icon: Star, color: 'bg-blue-100 text-blue-800', description: 'Technical mastery' },
      'Achiever': { icon: Target, color: 'bg-green-100 text-green-800', description: 'Results oriented' },
      'Individualist': { icon: Lightbulb, color: 'bg-purple-100 text-purple-800', description: 'Creative & independent' },
      'Strategist': { icon: Brain, color: 'bg-indigo-100 text-indigo-800', description: 'Systems thinking' },
      'Alchemist': { icon: Crown, color: 'bg-pink-100 text-pink-800', description: 'Transformational leader' }
    };
    return levels[level as keyof typeof levels] || levels['Achiever'];
  };

  return (
    <div className="max-w-5xl mx-auto bg-background p-6" data-pdf-export>
      {/* Header with Logo */}
      <div className="mb-6">
        <div className="text-center mb-6">
          <img 
            src="/lovable-uploads/c8eb7e6b-35a2-4f41-a9d7-c1dd08c9b30b.png" 
            alt="Unboxable Logo" 
            className="h-4 w-auto mx-auto mb-2"
          />
          <h1 className="text-lg font-bold text-primary mb-1">AI Leadership Assessment Summary</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis of leadership capabilities, sentiment, and development opportunities
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Leadership Assessment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Leadership Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Purpose Connection */}
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Purpose Connection</div>
                <div className="bg-primary text-xs text-primary-foreground px-2 py-1 rounded inline-flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  4
                </div>
                <div className="text-xs text-muted-foreground mt-1">Connected & gaining clarity</div>
              </div>
              
              {/* Confidence Level */}
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Confidence Level</div>
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Developing Confidence (2.5-3.4)
                </div>
              </div>
              
              {/* Leadership Agility */}
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Leadership Agility</div>
                {(() => {
                  const agilityBadge = getAgilityLevelBadge(currentSummary.agilityLevel || 'Achiever');
                  const IconComponent = agilityBadge.icon;
                  return (
                    <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      <IconComponent className="h-3 w-3" />
                      {currentSummary.agilityLevel || 'Achiever'}
                    </div>
                  );
                })()}
                <div className="text-xs text-muted-foreground mt-1">Results oriented</div>
              </div>
              
              {/* Focus Areas */}
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Focus Areas Overview</div>
                <div className="text-xs text-primary">Strengths vs Development</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leadership Competency Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Leadership Competency Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Communication Skills</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary h-2 rounded">
                    <div className="bg-orange-500 h-2 rounded" style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-sm font-medium">3.2/4</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Decision Making</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary h-2 rounded">
                    <div className="bg-orange-500 h-2 rounded" style={{ width: '70%' }}></div>
                  </div>
                  <span className="text-sm font-medium">2.8/4</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Team Management</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary h-2 rounded">
                    <div className="bg-orange-500 h-2 rounded" style={{ width: '77.5%' }}></div>
                  </div>
                  <span className="text-sm font-medium">3.1/4</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Strategic Thinking</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary h-2 rounded">
                    <div className="bg-orange-500 h-2 rounded" style={{ width: '52.5%' }}></div>
                  </div>
                  <span className="text-sm font-medium">2.1/4</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Leadership Sentiment Snapshot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-orange-600 flex items-center gap-2">
              <div className="w-5 h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              Leadership Sentiment Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Current Leadership Style</h4>
                {isEditing ? (
                  <Input
                    value={currentSummary.currentLeadershipStyle || ''}
                    onChange={(e) => setEditedSummary({
                      ...editedSummary,
                      currentLeadershipStyle: e.target.value
                    })}
                  />
                ) : (
                  <div className="text-sm font-medium">Managing, but close to overload</div>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Confidence Rating</h4>
                {isEditing ? (
                  <Input
                    value={currentSummary.confidenceRating || ''}
                    onChange={(e) => setEditedSummary({
                      ...editedSummary,
                      confidenceRating: e.target.value
                    })}
                  />
                ) : (
                  <div className="text-sm text-green-700">Developing Confidence (2.5-3.4)</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-green-800 mb-2">Strongest Area</h4>
                {isEditing ? (
                  <Textarea
                    value={currentSummary.strongestArea || ''}
                    onChange={(e) => setEditedSummary({
                      ...editedSummary,
                      strongestArea: e.target.value
                    })}
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-green-700">Motivate and align your team</p>
                )}
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-orange-800 mb-2">Area to Focus On</h4>
                {isEditing ? (
                  <Textarea
                    value={currentSummary.focusArea || ''}
                    onChange={(e) => setEditedSummary({
                      ...editedSummary,
                      focusArea: e.target.value
                    })}
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-orange-700">Lead through complexity and ambiguity</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leadership Intent & Purpose */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-blue-600 flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              Leadership Intent & Purpose
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Leadership Aspirations</h4>
              {isEditing ? (
                <Textarea
                  value={Array.isArray(currentSummary.leadershipAspirations) 
                    ? currentSummary.leadershipAspirations.join(', ')
                    : currentSummary.leadershipAspirations || ''
                  }
                  onChange={(e) => setEditedSummary({
                    ...editedSummary,
                    leadershipAspirations: e.target.value.split(', ').filter(item => item.trim())
                  })}
                  rows={3}
                  placeholder="Enter aspirations separated by commas"
                />
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Empowering and people-centred</div>
                  <div className="text-xs text-muted-foreground">Strategic and future-focused</div>
                  <div className="text-xs text-muted-foreground">Curious and adaptive</div>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Connection to Purpose Rating</h4>
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    value={currentSummary.purposeRating || ''}
                    onChange={(e) => setEditedSummary({
                      ...editedSummary,
                      purposeRating: parseInt(e.target.value) || 0
                    })}
                    className="w-20"
                  />
                ) : (
                  <div className="text-lg font-bold">4</div>
                )}
                <div className="text-sm text-muted-foreground">
                  /6 - Connected & gaining clarity
                  <div className="text-xs">Strong alignment with personal values and organisational mission</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adaptive & Agile Leadership */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-orange-600 flex items-center gap-2">
              <div className="w-5 h-5 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              Adaptive & Agile Leadership
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Current Agility Level</h4>
              {isEditing ? (
                <Input
                  value={currentSummary.agilityLevel || ''}
                  onChange={(e) => setEditedSummary({
                    ...editedSummary,
                    agilityLevel: e.target.value
                  })}
                  placeholder="e.g., Achiever, Strategist, etc."
                />
              ) : (
                <div className="text-center py-2">
                  {(() => {
                    const agilityBadge = getAgilityLevelBadge(currentSummary.agilityLevel || 'Achiever');
                    const IconComponent = agilityBadge.icon;
                    return (
                      <>
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded">
                          <IconComponent className="h-4 w-4" />
                          {currentSummary.agilityLevel || 'Achiever'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Results oriented</p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-green-800 mb-3">Top Strengths</h4>
                {isEditing ? (
                  <Textarea
                    value={Array.isArray(currentSummary.topStrengths) 
                      ? currentSummary.topStrengths.join('\n')
                      : currentSummary.topStrengths || ''
                    }
                    onChange={(e) => setEditedSummary({
                      ...editedSummary,
                      topStrengths: e.target.value.split('\n').filter(item => item.trim())
                    })}
                    rows={4}
                    placeholder="Enter strengths, one per line"
                  />
                ) : (
                  <ul className="space-y-1 text-sm">
                    <li>• Action Orientation & Delivery</li>
                    <li>• Decision-Making Agility</li>
                    <li>• Empowering Others & Collaboration</li>
                  </ul>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-orange-800 mb-3">Development Areas</h4>
                {isEditing ? (
                  <Textarea
                    value={Array.isArray(currentSummary.developmentAreas) 
                      ? currentSummary.developmentAreas.join('\n')
                      : currentSummary.developmentAreas || ''
                    }
                    onChange={(e) => setEditedSummary({
                      ...editedSummary,
                      developmentAreas: e.target.value.split('\n').filter(item => item.trim())
                    })}
                    rows={4}
                    placeholder="Enter development areas, one per line"
                  />
                ) : (
                  <ul className="space-y-1 text-sm">
                    <li>• Navigating Change & Uncertainty</li>
                    <li>• Strategic Agility & Systems Thinking</li>
                    <li>• Learning Agility & Growth Mindset</li>
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comprehensive Assessment & Rubrics Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-blue-600 flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              Comprehensive Assessment & Rubrics Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Executive Summary */}
            <div>
              <h4 className="text-sm font-medium mb-3">Executive Summary & Development Pathway</h4>
              {isEditing ? (
                <Textarea
                  value={currentSummary.overallAssessment || ''}
                  onChange={(e) => setEditedSummary({
                    ...editedSummary,
                    overallAssessment: e.target.value
                  })}
                  rows={4}
                  placeholder="Enter overall assessment and recommendations"
                />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.
                </p>
              )}
            </div>
            
            {/* Enhanced Recommendations based on Rubrics */}
            {currentSummary.rubricAssessments && currentSummary.rubricAssessments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-green-800 mb-2">Leverage These Strengths</h5>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Communication Skills</li>
                    <li>• Team Management</li>
                  </ul>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-orange-800 mb-2">Priority Development Areas</h5>
                  <ul className="text-xs text-orange-700 space-y-1">
                    <li>• Decision Making</li>
                    <li>• Strategic Thinking</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
      
      {/* Action Buttons at Bottom */}
      <div className="mt-8 pt-4 border-t border-border">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {!isEditing ? (
            <>
              {/* Main Actions - Always Visible */}
              <Button onClick={() => setShowEditorModal(true)} variant="default" size="sm">
                <Brain className="h-4 w-4 mr-1" />
                Edit AI Summary
              </Button>
              <Button onClick={handleExportPDF} disabled={isExporting} size="sm">
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button onClick={handleExportCSV} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                CSV
              </Button>
              <Button onClick={handleExportXLS} variant="outline" size="sm">
                Excel
              </Button>
              
              {/* Additional Actions - Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Quick Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSendEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* AI Summary Editor Modal */}
      <AISummaryEditorModal
        survey={survey}
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        onSave={(updatedSummary) => {
          const updatedSurvey = { ...survey, aiSummary: updatedSummary };
          
          // Update in localStorage
          const savedSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
          const updatedSurveys = savedSurveys.map((s: any) => 
            s.id === survey.id ? updatedSurvey : s
          );
          localStorage.setItem('surveySubmissions', JSON.stringify(updatedSurveys));
          
          if (onSummaryUpdate) {
            onSummaryUpdate(updatedSummary);
          }
          
          setShowEditorModal(false);
        }}
      />

      {/* Email Send Modal */}
      <EmailSendModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        survey={survey}
      />
    </div>
  );
};