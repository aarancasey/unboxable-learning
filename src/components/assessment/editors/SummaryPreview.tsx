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
import { dateHelpers } from '@/lib/dateUtils';
import { PurposeRatingGauge } from '../charts/PurposeRatingGauge';
import { RubricScoresRadar } from '../charts/RubricScoresRadar';
import { StrengthsComparisonChart } from '../charts/StrengthsComparisonChart';
import { ConfidenceLevelBar } from '../charts/ConfidenceLevelBar';
import { ConfidenceLevelsChart } from '../charts/ConfidenceLevelsChart';
import { AgilityLevelIndicator } from '../charts/AgilityLevelIndicator';

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
                dateHelpers.shortDate(summaryData.learnerInfo.submittedDate) : 
                dateHelpers.shortDate(new Date())}
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

          {/* Confidence Level Analysis */}
          {summaryData.visualizations?.confidenceBar?.enabled && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Confidence Level Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Current Confidence Rating: <strong>{summaryData.confidenceRating || 'Developing Confidence (2.5–3.4)'}</strong>
                    </p>
                  </div>
                  <div className="h-32"> {/* Fixed height container */}
                    <ConfidenceLevelBar 
                      confidenceRating={summaryData.confidenceRating || 'Developing Confidence (2.5–3.4)'}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Confidence progression from Low to Mastery level
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug: Always show if confidence bar should be enabled */}
          {!summaryData.visualizations?.confidenceBar?.enabled && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Debug:</strong> Confidence bar is disabled in visualizations config. 
                  Current config: {JSON.stringify(summaryData.visualizations?.confidenceBar)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Strengths Comparison Chart */}
          {summaryData.visualizations?.strengthsChart?.enabled && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Strengths vs Development Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <StrengthsComparisonChart 
                    strengths={summaryData.topStrengths || []}
                    developmentAreas={summaryData.developmentAreas || []}
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
            <CardContent className="space-y-6">
              {/* Current Leadership Style */}
              <div>
                <h4 className="text-sm font-medium mb-2">1. Current Leadership Style</h4>
                <p className="text-sm">Based on your selection you see your current leadership style as:</p>
                <div className="bg-muted rounded-lg p-3 mt-2">
                  <p className="text-sm font-medium">{summaryData.currentLeadershipStyle || 'Not specified'}</p>
                </div>
              </div>

              {/* Confidence Levels in Key Areas */}
              {summaryData.confidenceLevels && (
                <div>
                  <h4 className="text-sm font-medium mb-2">2. Confidence Levels in Key Areas</h4>
                  <p className="text-sm mb-4">Based on your assessment, you see your confidence in the following areas as follows:</p>
                  <ConfidenceLevelsChart confidenceLevels={summaryData.confidenceLevels} />
                  <div className="mt-4 bg-muted rounded-lg p-3">
                    <p className="text-sm">
                      <strong>From an overall perspective your aggregated average score is: {summaryData.overallConfidenceScore?.toFixed(1) || '3.2'}</strong>
                    </p>
                    <p className="text-sm mt-1">
                      Based on this score, this indicates that: {summaryData.confidenceInterpretation || 'You are developing your capabilities with solid foundations in key areas.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Current Leadership Mindset */}
              <div>
                <h4 className="text-sm font-medium mb-2">3. Current Leadership Mindset</h4>
                <p className="text-sm">You described your current leadership as the following:</p>
                <div className="bg-muted rounded-lg p-3 mt-2">
                  <p className="text-sm">{summaryData.currentLeadershipMindset || 'Not specified'}</p>
                </div>
              </div>

              {/* Current Leadership Challenges */}
              <div>
                <h4 className="text-sm font-medium mb-2">4. Current Leadership Challenges</h4>
                <p className="text-sm">You described your current leadership challenge as:</p>
                <div className="bg-muted rounded-lg p-3 mt-2">
                  <p className="text-sm">{summaryData.currentLeadershipChallenges || 'Not specified'}</p>
                </div>
              </div>

              {/* What's Energising You Right Now */}
              <div>
                <h4 className="text-sm font-medium mb-2">5. What's Energising You Right Now</h4>
                <p className="text-sm">You see yourself as being energised by:</p>
                <div className="bg-muted rounded-lg p-3 mt-2">
                  <p className="text-sm">{summaryData.energisingFactors || 'Not specified'}</p>
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
            <CardContent className="space-y-6">
              {/* What Matters Most Right Now */}
              <div>
                <h4 className="text-sm font-medium mb-2">1. What Matters Most Right Now</h4>
                <p className="text-sm">The following matters to you most right now as a leader:</p>
                <div className="bg-muted rounded-lg p-3 mt-2">
                  <p className="text-sm">{summaryData.whatMattersNow || 'Not specified'}</p>
                </div>
              </div>

              {/* Leadership Aspirations */}
              <div>
                <h4 className="text-sm font-medium mb-2">2. Leadership Aspirations</h4>
                <p className="text-sm mb-3">You identified the following attributes that you aspire to be as a leader are:</p>
                <div className="flex flex-wrap gap-2">
                  {(summaryData.leadershipAspirations || []).map((aspiration: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {aspiration}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Desired Impact */}
              <div>
                <h4 className="text-sm font-medium mb-2">3. Desired Impact</h4>
                <p className="text-sm">When I think about my leadership, I want to have the following impact:</p>
                <div className="bg-muted rounded-lg p-3 mt-2">
                  <p className="text-sm">{summaryData.desiredImpact || 'Not specified'}</p>
                </div>
              </div>

              {/* Leadership Stretch Goal */}
              <div>
                <h4 className="text-sm font-medium mb-2">4. Leadership Stretch Goal</h4>
                <p className="text-sm">As part of this, you have identified the following stretch goal that you would like to work on over the next six to twelve months:</p>
                <div className="bg-muted rounded-lg p-3 mt-2">
                  <p className="text-sm">{summaryData.stretchGoal || 'Not specified'}</p>
                </div>
              </div>

              {/* Connection to Purpose */}
              <div>
                <h4 className="text-sm font-medium mb-2">5. Connection to Purpose</h4>
                <p className="text-sm">Purpose is a critical component at Douglas Pharmaceuticals, and you feel your current connection to purpose is that:</p>
                <div className="bg-muted rounded-lg p-3 mt-2">
                  <p className="text-sm">{summaryData.connectionToPurpose || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adaptive & Agile Leadership Snapshot */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-purple-600 flex items-center gap-2">
                <div className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                Adaptive &amp; Agile Leadership Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 leading-relaxed">
                  Your self-assessed responses across six dimensions of adaptive leadership have been reviewed to highlight your current strengths and development areas. This includes how you navigate change, make decisions, empower others, and continue to learn and adapt.
                </p>
                <p className="text-sm text-blue-800 mt-3 leading-relaxed">
                  This snapshot reflects your current preferences and patterns across the six dimensions, offering directional insight into how you typically operate as a leader.
                </p>
                <p className="text-sm text-blue-800 mt-3 leading-relaxed">
                  Adaptive leadership is not a fixed state. It's dynamic and context-dependent. Many leaders shift between different levels of agility depending on the situation, pressure, or demands of their role. The key is to build awareness of how you lead in different conditions - so you can respond with greater intention, flexibility, and impact.
                </p>
              </div>

              {/* Summary Leadership Agility Level */}
              <div>
                <h4 className="text-sm font-medium mb-2">1. Summary Leadership Agility Level</h4>
                <p className="text-sm mb-4">Based on your scoring you have been assessed as a:</p>
                <AgilityLevelIndicator agilityLevel={summaryData.agilityLevel || 'Achiever'} />
                <div className="mt-4 bg-muted rounded-lg p-3">
                  <p className="text-sm">
                    <strong>This is considered:</strong> {summaryData.agilityLevelDescription || 'Results-oriented, strategic, effective manager'}
                  </p>
                </div>
              </div>

              {/* Notable Strength */}
              <div>
                <h4 className="text-sm font-medium mb-2">2. Notable Strength</h4>
                <p className="text-sm">Based on the responses recorded, your highest rating response was identified as:</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-green-800 font-medium">{summaryData.notableStrength || 'Not specified'}</p>
                </div>
              </div>

              {/* Potential Development Areas */}
              <div>
                <h4 className="text-sm font-medium mb-2">3. Potential Development Areas</h4>
                <p className="text-sm">Based on the responses recorded, your lowest rating response was identified as:</p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-orange-800 font-medium">{summaryData.developmentAreas || 'Not specified'}</p>
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