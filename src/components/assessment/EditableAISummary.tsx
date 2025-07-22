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
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF } from '@/lib/pdfExport';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { PurposeRatingGauge } from './charts/PurposeRatingGauge';
import { RubricScoresRadar } from './charts/RubricScoresRadar';
import { StrengthsComparisonChart } from './charts/StrengthsComparisonChart';
import { ConfidenceLevelBar } from './charts/ConfidenceLevelBar';
import { AgilityLevelIndicator } from './charts/AgilityLevelIndicator';
import { getRubricTemplates } from '@/hooks/useRubrics';

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
  const [isSendingEmail, setIsSendingEmail] = useState(false);
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
    console.log('PDF export button clicked - survey data:', survey);
    alert('PDF Export clicked - check console for details');
    setIsExporting(true);
    try {
      console.log('Calling exportToPDF with survey:', survey.learner);
      await exportToPDF(survey, 'leadership-assessment');
      console.log('exportToPDF completed successfully');
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

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-assessment-summary', {
        body: {
          learnerName: survey.learner,
          learnerEmail: survey.email || 'learner@example.com',
          summary: survey.aiSummary,
          surveyTitle: survey.title
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: "Assessment summary has been sent to the learner.",
      });
    } catch (error) {
      console.error('Email failed:', error);
      toast({
        title: "Email Failed",
        description: "Failed to send assessment summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
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
      
      const filename = `survey-responses-${survey.learner.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
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
      
      const filename = `survey-responses-${survey.learner.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.xlsx`;
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
    <div className="max-w-7xl mx-auto bg-white">
      {/* Header with Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-start space-x-4">
            <img 
              src="/lovable-uploads/c8eb7e6b-35a2-4f41-a9d7-c1dd08c9b30b.png" 
              alt="Unboxable Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-unboxable-navy">AI Leadership Assessment Summary</h1>
              <p className="text-gray-600 mt-1">
                Comprehensive analysis of leadership capabilities, sentiment, and development opportunities
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={handleExportPDF} disabled={isExporting} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'PDF'}
                </Button>
                <Button onClick={handleSendEmail} disabled={isSendingEmail} variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Visual Dashboard Overview */}
        <section className="bg-gradient-to-r from-unboxable-navy/5 to-unboxable-orange/5 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-unboxable-navy mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-unboxable-orange mr-2" />
            Leadership Assessment Dashboard
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Purpose Rating Gauge */}
            <div className="text-center">
              <h4 className="text-sm font-medium text-unboxable-navy flex items-center justify-center mb-3">
                <Target className="h-4 w-4 mr-1 text-unboxable-orange" />
                Purpose Connection
              </h4>
              <div className="flex justify-center mb-2">
                <PurposeRatingGauge rating={currentSummary.purposeRating || 4} />
              </div>
              <p className="text-xs text-gray-600">Connected & gaining clarity</p>
            </div>

            {/* Confidence Level */}
            <div>
              <h4 className="text-sm font-medium text-unboxable-navy flex items-center mb-3">
                <TrendingUp className="h-4 w-4 mr-1 text-unboxable-orange" />
                Confidence Level
              </h4>
              <div className="bg-white rounded-lg border border-unboxable-navy/10 p-3">
                <ConfidenceLevelBar confidenceRating={currentSummary.confidenceRating || ''} />
              </div>
            </div>

            {/* Agility Level with Badge */}
            <div>
              <h4 className="text-sm font-medium text-unboxable-navy flex items-center mb-3">
                <Award className="h-4 w-4 mr-1 text-unboxable-orange" />
                Leadership Agility
              </h4>
              <div className="bg-white rounded-lg border border-unboxable-navy/10 p-3">
                {(() => {
                  const agilityBadge = getAgilityLevelBadge(currentSummary.agilityLevel || 'Achiever');
                  const IconComponent = agilityBadge.icon;
                  return (
                    <div className="text-center">
                      <Badge className={`${agilityBadge.color} hover:${agilityBadge.color} flex items-center justify-center w-full mb-2`}>
                        <IconComponent className="h-3 w-3 mr-1" />
                        {currentSummary.agilityLevel || 'Achiever'}
                      </Badge>
                      <p className="text-xs text-gray-600">{agilityBadge.description}</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Strengths vs Development */}
            <div>
              <h4 className="text-sm font-medium text-unboxable-navy mb-3">
                Focus Areas Overview
              </h4>
              <div className="bg-white rounded-lg border border-unboxable-navy/10 p-3">
                <div className="h-32">
                  <StrengthsComparisonChart 
                    strengths={currentSummary.topStrengths || []}
                    developmentAreas={currentSummary.developmentAreas || []}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Leadership & Purpose Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="text-sm font-medium text-unboxable-navy mb-3">Leadership Competency Analysis</h4>
              <div className="bg-white rounded-lg border border-unboxable-navy/10 p-3">
                <div className="h-48">
                  <RubricScoresRadar data={radarData} />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-unboxable-navy mb-3">Purpose Alignment Analysis</h4>
              <div className="bg-white rounded-lg border border-unboxable-navy/10 p-3 flex items-center justify-center">
                <div className="text-center">
                  <PurposeRatingGauge rating={currentSummary.purposeRating || 4} />
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">Alignment Score</p>
                    <p className="text-lg font-bold text-unboxable-navy">{((currentSummary.purposeRating || 4) / 6 * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Leadership Sentiment Snapshot */}
        <section className="border-l-4 border-unboxable-orange pl-4 pb-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-unboxable-navy mb-4 flex items-center">
            <span className="bg-unboxable-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">1</span>
            Leadership Sentiment Snapshot
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-white border border-unboxable-navy/20 rounded-lg p-3">
              <h4 className="font-medium text-unboxable-navy mb-2">Current Leadership Style</h4>
              {isEditing ? (
                <Input
                  value={currentSummary.currentLeadershipStyle || ''}
                  onChange={(e) => setEditedSummary({
                    ...editedSummary,
                    currentLeadershipStyle: e.target.value
                  })}
                  className="w-full"
                />
              ) : (
                <Badge className="bg-unboxable-navy/10 text-unboxable-navy hover:bg-unboxable-navy/10">
                  {currentSummary.currentLeadershipStyle || 'Managing, but close to overload'}
                </Badge>
              )}
            </div>
            
            <div className="bg-white border border-unboxable-navy/20 rounded-lg p-3">
              <h4 className="font-medium text-unboxable-navy mb-2">Confidence Rating</h4>
              {isEditing ? (
                <Input
                  value={currentSummary.confidenceRating || ''}
                  onChange={(e) => setEditedSummary({
                    ...editedSummary,
                    confidenceRating: e.target.value
                  })}
                  className="w-full"
                />
              ) : (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {currentSummary.confidenceRating || 'Developing Confidence (2.5–3.4)'}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                Strongest Area
              </h4>
              {isEditing ? (
                <Textarea
                  value={currentSummary.strongestArea || ''}
                  onChange={(e) => setEditedSummary({
                    ...editedSummary,
                    strongestArea: e.target.value
                  })}
                  className="w-full"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-green-700 leading-relaxed">
                  {currentSummary.strongestArea || 'Motivate and align your team'}
                </p>
              )}
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-medium text-orange-800 mb-2 flex items-center">
                Area to Focus On
              </h4>
              {isEditing ? (
                <Textarea
                  value={currentSummary.focusArea || ''}
                  onChange={(e) => setEditedSummary({
                    ...editedSummary,
                    focusArea: e.target.value
                  })}
                  className="w-full"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-orange-700 leading-relaxed">
                  {currentSummary.focusArea || 'Lead through complexity and ambiguity'}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Leadership Intent & Purpose */}
        <section className="border-l-4 border-unboxable-navy pl-4 pb-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-unboxable-navy mb-4 flex items-center">
            <span className="bg-unboxable-navy text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">2</span>
            Leadership Intent & Purpose
          </h3>
          
          <div className="mb-4">
            <h4 className="font-medium text-unboxable-navy mb-3">Leadership Aspirations</h4>
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
                className="w-full"
                rows={3}
                placeholder="Enter aspirations separated by commas"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {(currentSummary.leadershipAspirations || ['Empowering and people-centred', 'Strategic and future-focused', 'Curious and adaptive']).map((aspiration: string, index: number) => (
                  <Badge key={index} className="bg-unboxable-navy/10 text-unboxable-navy hover:bg-unboxable-navy/10 border border-unboxable-navy/20">
                    {aspiration}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-unboxable-navy mb-2">Connection to Purpose Rating</h4>
            <div className="flex items-center space-x-3">
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
                <span className="text-2xl font-bold text-unboxable-navy">
                  {currentSummary.purposeRating || '4'}
                </span>
              )}
              <div className="text-sm text-gray-600">
                <p>/6 - Connected & gaining clarity</p>
                <p className="text-xs">Strong alignment with personal values and organizational mission</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Adaptive & Agile Leadership */}
        <section className="border-l-4 border-unboxable-orange pl-4 pb-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-unboxable-navy mb-4 flex items-center">
            <span className="bg-unboxable-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">3</span>
            Adaptive & Agile Leadership
          </h3>

          <div className="mb-4">
            <h4 className="font-medium text-unboxable-navy mb-3">Current Agility Level</h4>
            <div className="bg-white border border-unboxable-navy/20 rounded-lg p-3">
              {isEditing ? (
                <Input
                  value={currentSummary.agilityLevel || ''}
                  onChange={(e) => setEditedSummary({
                    ...editedSummary,
                    agilityLevel: e.target.value
                  })}
                  className="w-full"
                  placeholder="e.g., Achiever, Strategist, etc."
                />
              ) : (
                <div className="text-center">
                  {(() => {
                    const agilityBadge = getAgilityLevelBadge(currentSummary.agilityLevel || 'Achiever');
                    const IconComponent = agilityBadge.icon;
                    return (
                      <>
                        <Badge className={`${agilityBadge.color} hover:${agilityBadge.color} text-lg px-3 py-1 flex items-center justify-center w-fit mx-auto`}>
                          <IconComponent className="h-4 w-4 mr-2" />
                          {currentSummary.agilityLevel || 'Achiever'}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-2">
                          {agilityBadge.description}
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 mb-3 flex items-center">
                Top Strengths
              </h4>
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
                  className="w-full"
                  rows={4}
                  placeholder="Enter strengths, one per line"
                />
              ) : (
                <ul className="space-y-2">
                  {(currentSummary.topStrengths || ['Action Orientation & Delivery', 'Decision-Making Agility', 'Empowering Others & Collaboration']).map((strength: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-sm text-green-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-medium text-orange-800 mb-3 flex items-center">
                Development Areas
              </h4>
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
                  className="w-full"
                  rows={4}
                  placeholder="Enter development areas, one per line"
                />
              ) : (
                <ul className="space-y-2">
                  {(currentSummary.developmentAreas || ['Navigating Change & Uncertainty', 'Strategic Agility & Systems Thinking', 'Learning Agility & Growth Mindset']).map((area: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span className="text-sm text-orange-700">{area}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Enhanced Rubrics-Based Overall Assessment */}
        <section className="border-l-4 border-unboxable-navy pl-4 pb-6">
          <h3 className="text-lg font-semibold text-unboxable-navy mb-4 flex items-center">
            <span className="bg-unboxable-navy text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">4</span>
            Comprehensive Assessment & Rubrics Analysis
          </h3>
          
          {/* Rubrics Assessment Grid */}
          {currentSummary.rubricAssessments && currentSummary.rubricAssessments.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-unboxable-navy mb-3">Leadership Competency Rubrics</h4>
              <div className="bg-white border border-unboxable-navy/20 rounded-lg p-3">
                {currentSummary.rubricAssessments.map((assessment: any, index: number) => (
                  <div key={index} className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-unboxable-navy">{assessment.rubricName}</h5>
                      <Badge className="bg-unboxable-orange/10 text-unboxable-orange">
                        {assessment.overallScore.toFixed(1)}/{assessment.maxScore} ({((assessment.overallScore / assessment.maxScore) * 100).toFixed(0)}%)
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {assessment.criteriaScores.map((criteria: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{criteria.criterion}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{criteria.score.toFixed(1)}/{criteria.maxScore}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-unboxable-orange h-2 rounded-full"
                                style={{ width: `${(criteria.score / criteria.maxScore) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Executive Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-unboxable-navy mb-3 flex items-center">
              Executive Summary & Development Pathway
            </h4>
            {isEditing ? (
              <Textarea
                value={currentSummary.overallAssessment || ''}
                onChange={(e) => setEditedSummary({
                  ...editedSummary,
                  overallAssessment: e.target.value
                })}
                className="w-full"
                rows={5}
                placeholder="Enter overall assessment and recommendations"
              />
            ) : (
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  {currentSummary.overallAssessment || 'This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.'}
                </p>
                
                {/* Enhanced Recommendations based on Rubrics */}
                {currentSummary.rubricAssessments && currentSummary.rubricAssessments.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="bg-green-100 border border-green-200 rounded p-3">
                      <h5 className="font-medium text-green-800 mb-2">Leverage These Strengths</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        {currentSummary.rubricAssessments[0]?.criteriaScores
                          .filter((c: any) => c.score >= 3.0)
                          .map((c: any, idx: number) => (
                            <li key={idx}>• {c.criterion}</li>
                          ))}
                      </ul>
                    </div>
                    <div className="bg-orange-100 border border-orange-200 rounded p-3">
                      <h5 className="font-medium text-orange-800 mb-2">Priority Development Areas</h5>
                      <ul className="text-sm text-orange-700 space-y-1">
                        {currentSummary.rubricAssessments[0]?.criteriaScores
                          .filter((c: any) => c.score < 3.0)
                          .map((c: any, idx: number) => (
                            <li key={idx}>• {c.criterion}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button onClick={handleExportXLS} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" />
              Excel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};