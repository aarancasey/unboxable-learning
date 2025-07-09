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
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF } from '@/lib/pdfExport';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface EditableAISummaryProps {
  survey: any;
  onSummaryUpdate?: (updatedSummary: any) => void;
}

export const EditableAISummary = ({ survey, onSummaryUpdate }: EditableAISummaryProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(survey.aiSummary || {});
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { toast } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
    setEditedSummary({ ...survey.aiSummary });
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
    setEditedSummary({ ...survey.aiSummary });
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

  const currentSummary = isEditing ? editedSummary : survey.aiSummary;

  return (
    <Card className="border-2 border-unboxable-navy/20">
      <CardHeader className="bg-gradient-to-r from-unboxable-navy/5 to-unboxable-orange/5 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/c8eb7e6b-35a2-4f41-a9d7-c1dd08c9b30b.png" 
              alt="Unboxable Logo" 
              className="h-6 w-auto"
            />
            <div>
              <CardTitle className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-unboxable-orange" aria-hidden="true" />
                <span className="text-xl font-semibold text-unboxable-navy">AI Leadership Assessment Summary</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Comprehensive analysis of leadership capabilities, sentiment, and development opportunities
              </p>
            </div>
          </div>
          
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8 pt-8">
        {/* Section 1: Leadership Sentiment Snapshot */}
        <section className="border-l-4 border-unboxable-orange pl-6 pb-8 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-unboxable-navy mb-6 flex items-center">
            <span className="bg-unboxable-orange text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
            Leadership Sentiment Snapshot
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-unboxable-navy/20 rounded-lg p-4">
              <h4 className="font-medium text-unboxable-navy mb-3">Current Leadership Style</h4>
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
            
            <div className="bg-white border border-unboxable-navy/20 rounded-lg p-4">
              <h4 className="font-medium text-unboxable-navy mb-3">Confidence Rating</h4>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3 flex items-center">
                <span className="text-green-600 mr-2">✓</span>
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
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-800 mb-3 flex items-center">
                <span className="text-orange-600 mr-2">→</span>
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
        <section className="border-l-4 border-unboxable-navy pl-6 pb-8 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-unboxable-navy mb-6 flex items-center">
            <span className="bg-unboxable-navy text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
            Leadership Intent & Purpose
          </h3>
          
          <div className="mb-6">
            <h4 className="font-medium text-unboxable-navy mb-4">Leadership Aspirations</h4>
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
              <div className="flex flex-wrap gap-3">
                {(currentSummary.leadershipAspirations || ['Empowering and people-centred', 'Strategic and future-focused', 'Curious and adaptive']).map((aspiration: string, index: number) => (
                  <Badge key={index} className="bg-unboxable-navy/10 text-unboxable-navy hover:bg-unboxable-navy/10 border border-unboxable-navy/20">
                    {aspiration}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-unboxable-navy mb-3">Connection to Purpose Rating</h4>
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
                <span className="text-3xl font-bold text-unboxable-navy">
                  {currentSummary.purposeRating || '4'}
                </span>
              )}
              <div>
                <span className="text-sm text-gray-600 block">/ 6</span>
                <span className="text-sm text-unboxable-navy font-medium">Connected and gaining clarity</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Adaptive & Agile Leadership Snapshot */}
        <section className="border-l-4 border-unboxable-orange pl-6 pb-8 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-unboxable-navy mb-6 flex items-center">
            <span className="bg-unboxable-orange text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
            Adaptive & Agile Leadership Snapshot
          </h3>
          
          <div className="mb-6">
            <h4 className="font-medium text-unboxable-navy mb-4">Leadership Agility Level</h4>
            {isEditing ? (
              <Input
                value={currentSummary.agilityLevel || ''}
                onChange={(e) => setEditedSummary({
                  ...editedSummary,
                  agilityLevel: e.target.value
                })}
                className="w-full max-w-xs"
              />
            ) : (
              <Badge className="bg-unboxable-orange/10 text-unboxable-orange hover:bg-unboxable-orange/10 border border-unboxable-orange/20 text-base px-6 py-3">
                {currentSummary.agilityLevel || 'Achiever'}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <h4 className="font-medium text-green-800 mb-4 flex items-center">
                <span className="text-green-600 mr-2">🌟</span>
                Notable Strengths (Top 3)
              </h4>
              {isEditing ? (
                <Textarea
                  value={Array.isArray(currentSummary.topStrengths) 
                    ? currentSummary.topStrengths.join(', ')
                    : currentSummary.topStrengths || ''
                  }
                  onChange={(e) => setEditedSummary({
                    ...editedSummary,
                    topStrengths: e.target.value.split(', ').filter(item => item.trim())
                  })}
                  className="w-full"
                  rows={4}
                  placeholder="Enter strengths separated by commas"
                />
              ) : (
                <ul className="space-y-3">
                  {(currentSummary.topStrengths || ['Action Orientation & Delivery', 'Decision-Making Agility', 'Empowering Others & Collaboration']).map((strength: string, index: number) => (
                    <li key={index} className="text-sm text-green-700 flex items-start leading-relaxed">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {strength}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
              <h4 className="font-medium text-orange-800 mb-4 flex items-center">
                <span className="text-orange-600 mr-2">🎯</span>
                Development Areas (Focus Areas)
              </h4>
              {isEditing ? (
                <Textarea
                  value={Array.isArray(currentSummary.developmentAreas) 
                    ? currentSummary.developmentAreas.join(', ')
                    : currentSummary.developmentAreas || ''
                  }
                  onChange={(e) => setEditedSummary({
                    ...editedSummary,
                    developmentAreas: e.target.value.split(', ').filter(item => item.trim())
                  })}
                  className="w-full"
                  rows={4}
                  placeholder="Enter development areas separated by commas"
                />
              ) : (
                <ul className="space-y-3">
                  {(currentSummary.developmentAreas || ['Navigating Change & Uncertainty', 'Strategic Agility & Systems Thinking', 'Learning Agility & Growth Mindset']).map((area: string, index: number) => (
                    <li key={index} className="text-sm text-orange-700 flex items-start leading-relaxed">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {area}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Overall Assessment */}
        <section className="border-l-4 border-gray-500 pl-6">
          <h3 className="text-lg font-semibold text-unboxable-navy mb-6 flex items-center">
            <span className="bg-gray-100 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
            Overall Assessment Summary
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            {isEditing ? (
              <Textarea
                value={currentSummary.overallAssessment || ''}
                onChange={(e) => setEditedSummary({
                  ...editedSummary,
                  overallAssessment: e.target.value
                })}
                className="w-full"
                rows={4}
              />
            ) : (
              <p className="text-base text-gray-700 leading-relaxed">
                {currentSummary.overallAssessment || 'This leader demonstrates strong operational capabilities with clear areas for strategic development. Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.'}
              </p>
            )}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Summary
              </Button>
              <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button variant="outline" onClick={handleSendEmail} disabled={isSendingEmail}>
                <Mail className="h-4 w-4 mr-2" />
                {isSendingEmail ? 'Sending...' : 'Email to Learner'}
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <FileText className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={handleExportXLS}>
                <FileText className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-unboxable-navy hover:bg-unboxable-navy/90">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </section>
      </CardContent>
    </Card>
  );
};