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
  // Debug survey structure
  console.log('Survey data structure:', survey);
  
  // Get rubric templates for enhanced assessment
  const rubricTemplates = getRubricTemplates();

  // Provide default summary structure following LEADForward document format
  const defaultSummary = {
    currentLeadershipStyle: "Managing, but close to overload",
    confidenceLevels: {
      complexityAmbiguity: 3.2,
      motivateAlign: 3.8,
      decisionMaking: 3.5,
      empowerOthers: 2.9,
      strategicOperational: 3.6,
      learningExperimentation: 3.1,
      resilientEnergy: 3.7
    },
    overallConfidenceScore: 3.4,
    confidenceInterpretation: "you're generally confident and capable in most areas, though certain challenges or contexts may still affect your consistency. You have a solid foundation to build from—targeted growth could lift you into greater impact.",
    currentLeadershipMindset: ["I'm feeling stretched but staying afloat", "I'm navigating change and finding my rhythm"],
    currentLeadershipChallenges: "Navigating increased complexity and ambiguity in the business environment",
    energisingFactors: "Seeing team members grow and develop their capabilities",
    whatMattersNow: "Building resilient and adaptive teams that can thrive in uncertainty",
    leadershipAspirations: ["Empowering and people-centred", "Strategic and future-focused", "Curious and adaptive"],
    desiredImpact: "Creating an environment where people feel valued, challenged, and empowered to do their best work",
    stretchGoal: "Develop more confidence in leading through complex, ambiguous situations",
    connectionToPurpose: 4,
    connectionToPurposeDescription: "I feel connected and gaining clarity",
    agilityLevel: "Achiever",
    agilityLevelDescription: "operates with confidence and clarity, sets goals and delivers outcomes",
    notableStrength: "Empowering Others & Collaboration",
    developmentAreas: "Navigating Change & Uncertainty",
    overallAssessment: "This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.",
    rubricAssessments: [
      {
        rubricName: "Leadership Assessment",
        overallScore: 3,
        criteriaScores: [
          {
            criterion: "Communication Skills",
            score: 3,
            justification: "Shows solid understanding of communication with room for enhancement"
          }
        ],
        recommendations: ["Develop more structured communication processes", "Practice active listening techniques"]
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
          <h1 className="text-lg font-bold text-primary mb-1">LEADForward Leadership Self-Assessment</h1>
          <div className="text-sm text-muted-foreground space-y-2 max-w-4xl mx-auto leading-relaxed">
            <p className="text-xs text-muted-foreground mb-4">
              For: {(() => {
                // Try multiple ways to get the full name
                const fullName = survey.responses?.participantInfo?.fullName || 
                               survey.participantInfo?.fullName ||
                               survey.fullName ||
                               survey.learner_name ||
                               survey.learner ||
                               'Insert Name';
                console.log('Using name for "For" field:', fullName);
                return fullName;
              })()}<br/>
              From: {survey.responses?.participantInfo?.company || survey.participantInfo?.company || survey.company || 'Company'}<br/>
              Assessment Prepared: {new Date().toLocaleDateString()}
            </p>
            
            <p>This personalised summary reflects your self-assessment responses for the LEADForward program. This self-assessment is designed to help you explore your current leadership sentiment, intent, adaptability and agility.</p>
            
            <p>There are no right or wrong answers in this assessment - only insight. The purpose is not to evaluate or judge, but to help you build a deeper understanding of your leadership mindset, intent, and agility.</p>
            
            <p>This assessment explores how you currently feel in your leadership role, what drives you, and how you respond to complexity and change. It's designed to offer directional insight into the type of leader you are today, while laying the foundation for the kind of leader you want to become.</p>
            
            <p>The summary offers a practical and personal snapshot of your leadership - capturing what's present for you now, and what might evolve over time. It will support your growth throughout the LEADForward programme and guide your coaching conversations.</p>
            
            <p>Use it as a reference point, and insight for reflection. This is your starting line into moving your leadership forward.</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Leadership Sentiment Snapshot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-primary">Leadership Sentiment Snapshot</CardTitle>
            <p className="text-sm text-muted-foreground">This section reflects how you're currently experiencing your leadership role - your mindset, energy, and emotional connection to leading. It captures how you feel, how confident you are, and what's present for you right now as a leader.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1. Current Leadership Style */}
            <div>
              <h4 className="text-sm font-semibold mb-2">1. Current Leadership Style:</h4>
              <p className="text-sm mb-2">Based on your selection you see your current leadership style as:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-800">{currentSummary.currentLeadershipStyle || 'Managing, but close to overload'}</p>
              </div>
            </div>

            {/* 2. Confidence Levels in Key Areas */}
            <div>
              <h4 className="text-sm font-semibold mb-2">2. Confidence Levels in Key Areas:</h4>
              <p className="text-sm mb-3">Based on your assessment, you see your confidence in the following areas as follows:</p>
              
              <div className="space-y-3">
                {Object.entries(currentSummary.confidenceLevels || {}).map(([key, value], index) => {
                  const labels = {
                    complexityAmbiguity: 'Lead through complexity and ambiguity',
                    motivateAlign: 'Motivate and align your team',
                    decisionMaking: 'Make decisions with pace and clarity',
                    empowerOthers: 'Empower others to take ownership and lead',
                    strategicOperational: 'Balance strategic and operational demands',
                    learningExperimentation: 'Create space for learning and experimentation',
                    resilientEnergy: 'Stay resilient and maintain personal energy'
                  };
                  const label = labels[key as keyof typeof labels] || key;
                  const score = Number(value);
                  
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs flex-1">{label}</span>
                      <div className="flex items-center gap-2 w-32">
                        <div className="flex-1 bg-secondary h-2 rounded">
                          <div 
                            className="bg-primary h-2 rounded transition-all" 
                            style={{ width: `${(score / 6) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{score}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">From an overall perspective your aggregated average score is: <span className="font-semibold">{currentSummary.overallConfidenceScore || '3.4'}</span></p>
                <p className="text-sm mt-2">Based on this score, this indicates that {currentSummary.confidenceInterpretation || 'you\'re generally confident and capable in most areas, though certain challenges or contexts may still affect your consistency. You have a solid foundation to build from—targeted growth could lift you into greater impact.'}</p>
              </div>
            </div>

            {/* 3. Current Leadership Mindset */}
            <div>
              <h4 className="text-sm font-semibold mb-2">3. Current Leadership Mindset:</h4>
              <p className="text-sm mb-2">You described your current leadership as the following:</p>
              <div className="space-y-1">
                {Array.isArray(currentSummary.currentLeadershipMindset) 
                  ? currentSummary.currentLeadershipMindset.map((mindset, index) => (
                      <div key={index} className="text-sm">• {mindset}</div>
                    ))
                  : <div className="text-sm">• {currentSummary.currentLeadershipMindset || 'I\'m feeling stretched but staying afloat'}</div>
                }
              </div>
            </div>

            {/* 4. Current Leadership Challenges */}
            <div>
              <h4 className="text-sm font-semibold mb-2">4. Current Leadership Challenges:</h4>
              <p className="text-sm mb-2">You described your current leadership challenge as:</p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">{currentSummary.currentLeadershipChallenges || 'Navigating increased complexity and ambiguity in the business environment'} Consider this challenge as we go through the LEADForward program.</p>
              </div>
            </div>

            {/* 5. What's Energising You Right Now */}
            <div>
              <h4 className="text-sm font-semibold mb-2">5. What's Energising You Right Now:</h4>
              <p className="text-sm mb-2">You see yourself as being energised by:</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">{currentSummary.energisingFactors || 'Seeing team members grow and develop their capabilities'} As you go through the program, consider how this can be leveraged to build energy in other areas of your role and leadership.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leadership Intent & Purpose */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-primary">Leadership Intent & Purpose</CardTitle>
            <p className="text-sm text-muted-foreground">This section explores what drives you - your values, aspirations, and the impact you want your leadership to have. It provides insight into the kind of leader you want to be and what matters most to you in your role.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1. What Matters Most Right Now */}
            <div>
              <h4 className="text-sm font-semibold mb-2">1. What Matters Most Right Now:</h4>
              <p className="text-sm mb-2">The following matters to you most right now as a leader:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">{currentSummary.whatMattersNow || 'Building resilient and adaptive teams that can thrive in uncertainty'} Consider these identified aspects as you are working through the LEADForward program and how you can leverage, optimise or work on.</p>
              </div>
            </div>

            {/* 2. Leadership Aspirations */}
            <div>
              <h4 className="text-sm font-semibold mb-2">2. Leadership Aspirations:</h4>
              <p className="text-sm mb-2">You identified the following attributes that you aspire to be as a leader are:</p>
              <div className="space-y-1">
                {Array.isArray(currentSummary.leadershipAspirations) 
                  ? currentSummary.leadershipAspirations.map((aspiration, index) => (
                      <div key={index} className="text-sm">• {aspiration}</div>
                    ))
                  : <div className="text-sm">• {currentSummary.leadershipAspirations || 'Empowering and people-centred'}</div>
                }
              </div>
              <p className="text-xs text-muted-foreground mt-2">Keep these front of mind as you go through the leadership days and coaching sessions.</p>
            </div>

            {/* 3. Desired Impact */}
            <div>
              <h4 className="text-sm font-semibold mb-2">3. Desired Impact:</h4>
              <p className="text-sm mb-2">When I think about my leadership I want to have the following impact:</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">{currentSummary.desiredImpact || 'Creating an environment where people feel valued, challenged, and empowered to do their best work'} As you go through the leadership and coaching process we will explore that impact further.</p>
              </div>
            </div>

            {/* 4. Leadership Stretch Goal */}
            <div>
              <h4 className="text-sm font-semibold mb-2">4. Leadership Stretch Goal:</h4>
              <p className="text-sm mb-2">As part of this, you have identified the following stretch goal that you would like to work on over the next six to twelve months:</p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800">{currentSummary.stretchGoal || 'Develop more confidence in leading through complex, ambiguous situations'}</p>
              </div>
            </div>

            {/* 5. Connection to Purpose */}
            <div>
              <h4 className="text-sm font-semibold mb-2">5. Connection to Purpose:</h4>
              <p className="text-sm mb-2">Purpose is a critical component at Douglas Pharmaceuticals, and you feel your current connection to purpose is that:</p>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{currentSummary.connectionToPurpose || 4}</span>
                  <span className="text-sm text-muted-foreground">/6</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{currentSummary.connectionToPurposeDescription || 'I feel connected and gaining clarity'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adaptive & Agile Leadership Snapshot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-primary">Adaptive & Agile Leadership Snapshot</CardTitle>
            <p className="text-sm text-muted-foreground">Your self-assessed responses across six dimensions of adaptive leadership have been reviewed to highlight your current strengths and development areas. This includes how you navigate change, make decisions, empower others, and continue to learn and adapt.</p>
            <p className="text-sm text-muted-foreground mt-2">This snapshot reflects your current preferences and patterns across the six dimensions, offering directional insight into how you typically operate as a leader.</p>
            <p className="text-sm text-muted-foreground mt-2">Adaptive leadership is not a fixed state. It's dynamic and context-dependent. Many leaders shift between different levels of agility depending on the situation, pressure, or demands of their role. The key is to build awareness of how you lead in different conditions - so you can respond with greater intention, flexibility, and impact.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1. Summary Leadership Agility Level */}
            <div>
              <h4 className="text-sm font-semibold mb-2">1. Summary Leadership Agility Level:</h4>
              <p className="text-sm mb-2">Based on your scoring you have been assessed as:</p>
              <div className="text-center py-4">
                {(() => {
                  const agilityBadge = getAgilityLevelBadge(currentSummary.agilityLevel || 'Achiever');
                  const IconComponent = agilityBadge.icon;
                  return (
                    <>
                      <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-lg font-semibold">
                        <IconComponent className="h-5 w-5" />
                        {currentSummary.agilityLevel || 'Achiever'}
                      </div>
                      <p className="text-sm mt-3 text-muted-foreground">This is considered: {currentSummary.agilityLevelDescription || 'operates with confidence and clarity, sets goals and delivers outcomes'}</p>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* 2. Notable Strength */}
            <div>
              <h4 className="text-sm font-semibold mb-2">2. Notable Strength:</h4>
              <p className="text-sm mb-2">Based on the responses recorded, your highest rating response was identified as:</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800">{currentSummary.notableStrength || 'Empowering Others & Collaboration'}</p>
              </div>
            </div>

            {/* 3. Potential Development Area */}
            <div>
              <h4 className="text-sm font-semibold mb-2">3. Potential Development Area:</h4>
              <p className="text-sm mb-2">Based on the responses recorded, your lowest rating response was identified as:</p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm font-medium text-orange-800">{currentSummary.developmentAreas || 'Navigating Change & Uncertainty'}</p>
              </div>
            </div>

            {/* Overall Summary */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Overall Summary:</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">{currentSummary.overallAssessment || 'This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Growth Journey */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-primary">Your Growth Journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>This report is private and has been created specifically for you. It's designed to support your learning, spark reflection, and guide your leadership growth throughout the LEADForward experience.</p>
              
              <p>Your responses offer a personal snapshot of how you currently lead, what drives you, and where you may want to grow. Your facilitator and coach will use this summary to support deeper conversations and tailor your experience to help you move forward with clarity and confidence. This is your space to explore and evolve as leader.</p>
              
              <p>Treat this as your starting line - not a finish line. Leadership is a practice, and these insights are an enabler for that.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              www.unboxable.co.nz
            </div>
            <div className="text-xs text-muted-foreground">
              Prepared in Confidence for: {(() => {
                // Try multiple ways to get the full name
                const fullName = survey.responses?.participantInfo?.fullName || 
                               survey.participantInfo?.fullName ||
                               survey.fullName ||
                               survey.learner_name ||
                               survey.learner ||
                               'Name';
                console.log('Using name for "Prepared for" field:', fullName);
                return fullName;
              })()}
            </div>
          </div>
        </div>

      </div>
      
      {/* Action Buttons at Bottom */}
      <div className="mt-8 pt-4 border-t border-border">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {!isEditing ? (
            <>
              {/* Main Actions - Always Visible */}
              <Button onClick={() => setShowEditorModal(true)} variant="default" size="sm">
                <Brain className="h-4 w-4 mr-1" />
                Edit Summary
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