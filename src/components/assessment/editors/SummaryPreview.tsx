import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target,
  Award,
  Crown,
  Star,
  Users,
  Brain,
  Circle,
  Lightbulb,
  Download,
  Mail,
  Eye
} from 'lucide-react';
import { PurposeRatingGauge } from '../charts/PurposeRatingGauge';
import { RubricScoresRadar } from '../charts/RubricScoresRadar';
import { StrengthsComparisonChart } from '../charts/StrengthsComparisonChart';
import { ConfidenceLevelBar } from '../charts/ConfidenceLevelBar';

interface SummaryPreviewProps {
  summaryData: any;
  survey: any;
}

export const SummaryPreview = ({ summaryData, survey }: SummaryPreviewProps) => {
  // Prepare radar chart data for rubrics
  const radarData = summaryData.rubricAssessments?.length > 0 
    ? summaryData.rubricAssessments[0]?.criteriaScores?.map((criteria: any) => ({
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

  const agilityBadge = getAgilityLevelBadge(summaryData.agilityLevel || 'Achiever');
  const IconComponent = agilityBadge.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Assessment Preview</h3>
          <p className="text-sm text-muted-foreground">
            Preview how the final assessment summary will appear to learners and administrators.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 bg-background">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header with Logo */}
          <div className="text-center mb-6">
            <img 
              src="/lovable-uploads/c8eb7e6b-35a2-4f41-a9d7-c1dd08c9b30b.png" 
              alt="Unboxable Logo" 
              className="h-4 w-auto mx-auto mb-2"
            />
            <h1 className="text-lg font-bold text-primary mb-1">AI Leadership Assessment Summary</h1>
            <p className="text-sm text-muted-foreground">
              For {summaryData.learnerInfo?.name || 'Learner Name'} • {summaryData.learnerInfo?.team || 'Team'}
            </p>
            <p className="text-xs text-muted-foreground">
              Submitted: {summaryData.learnerInfo?.submittedDate ? 
                new Date(summaryData.learnerInfo.submittedDate).toLocaleDateString() : 
                new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Leadership Assessment Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Leadership Assessment Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Purpose Connection */}
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Purpose Connection</div>
                  <div className="bg-primary text-xs text-primary-foreground px-2 py-1 rounded inline-flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {summaryData.purposeRating || 4}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {(summaryData.purposeRating || 4) >= 5 ? 'Highly Aligned' : 
                     (summaryData.purposeRating || 4) >= 3 ? 'Developing Clarity' : 'Needs Focus'}
                  </div>
                </div>
                
                {/* Confidence Level */}
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Confidence Level</div>
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {summaryData.confidenceRating || 'Developing'}
                  </div>
                </div>
                
                {/* Leadership Agility */}
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Leadership Agility</div>
                  <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${agilityBadge.color}`}>
                    <IconComponent className="h-3 w-3" />
                    {summaryData.agilityLevel || 'Achiever'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{agilityBadge.description}</div>
                </div>
                
                {/* Overall Score */}
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">Overall Score</div>
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {summaryData.rubricAssessments?.[0]?.overallScore?.toFixed(1) || '2.8'}/
                    {summaryData.rubricAssessments?.[0]?.maxScore || '4'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leadership Competency Analysis with Radar Chart */}
          {summaryData.visualizations?.radarChart?.enabled && radarData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Leadership Competency Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <RubricScoresRadar data={radarData} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Purpose Alignment Analysis */}
          {summaryData.visualizations?.purposeGauge?.enabled && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Purpose Alignment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <PurposeRatingGauge 
                    rating={summaryData.purposeRating || 4}
                    maxRating={summaryData.visualizations?.purposeGauge?.maxRating || 6}
                  />
                </div>
              </CardContent>
            </Card>
          )}

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
                  <div className="text-sm font-medium">{summaryData.currentLeadershipStyle || 'Not specified'}</div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Confidence Rating</h4>
                  <div className="text-sm text-green-700">{summaryData.confidenceRating || 'Not specified'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Strongest Area
                  </h4>
                  <p className="text-sm text-green-700">{summaryData.strongestArea || 'Not specified'}</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Primary Focus Area
                  </h4>
                  <p className="text-sm text-blue-700">{summaryData.focusArea || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Development Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-green-600">Top Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(summaryData.topStrengths || []).map((strength: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                  {(!summaryData.topStrengths || summaryData.topStrengths.length === 0) && (
                    <p className="text-sm text-muted-foreground">No strengths specified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-blue-600">Development Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(summaryData.developmentAreas || []).map((area: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{area}</span>
                    </div>
                  ))}
                  {(!summaryData.developmentAreas || summaryData.developmentAreas.length === 0) && (
                    <p className="text-sm text-muted-foreground">No development areas specified</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Assessment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Overall Assessment & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {summaryData.overallAssessment || 'No assessment provided.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Info */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-green-900">
                Live Preview
              </h4>
              <p className="text-sm text-green-700">
                This preview shows the assessment exactly as it will appear when exported to PDF 
                or sent via email. All visualizations and content are dynamically generated based 
                on your configurations in the previous tabs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};