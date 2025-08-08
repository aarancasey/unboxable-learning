import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Target,
  Award,
  Crown,
  Star,
  Zap,
  Circle,
  Users,
  Lightbulb
} from 'lucide-react';

interface PDFPreviewContentProps {
  survey: any;
  currentSummary: any;
}

export const PDFPreviewContent = ({ survey, currentSummary }: PDFPreviewContentProps) => {
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
    <div className="max-w-5xl mx-auto bg-background">
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
                <div className="text-sm font-medium">Managing, but close to overload</div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Confidence Rating</h4>
                <div className="text-sm text-green-700">Developing Confidence (2.5-3.4)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-green-800 mb-2">Strongest Area</h4>
                <div className="text-sm text-green-700">Motivate and align your team</div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-orange-800 mb-2">Focus Area</h4>
                <div className="text-sm text-orange-700">Lead through complexity and ambiguity</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Leadership Aspirations</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Empowering and people-centred</Badge>
                <Badge variant="outline" className="text-xs">Strategic and future-focused</Badge>
                <Badge variant="outline" className="text-xs">Curious and adaptive</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Development Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-green-600 flex items-center gap-2">
                <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                Top Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Action Orientation & Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Decision-Making Agility</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Empowering Others & Collaboration</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-blue-600 flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                Development Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Navigating Change & Uncertainty</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Strategic Agility & Systems Thinking</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>Learning Agility & Growth Mindset</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Assessment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-purple-600 flex items-center gap-2">
              <div className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              Overall Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">
              This leader demonstrates strong operational capabilities with clear areas for strategic development. 
              Focus on building confidence in navigating ambiguity while leveraging existing strengths in team motivation and decision-making.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};