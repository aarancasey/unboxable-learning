import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RubricScoresRadar } from '../assessment/charts/RubricScoresRadar';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface RubricAssessment {
  id: string;
  rubric_id: string;
  overall_score: number;
  max_possible_score: number;
  percentage_score: number;
  criterion_scores: Record<string, any>;
  assessment_summary: string | null;
  strengths: string[] | null;
  areas_for_improvement: string[] | null;
  recommendations: string[] | null;
  confidence_score: number | null;
  created_at: string;
  rubric_name?: string;
}

interface RubricAssessmentsCardProps {
  surveyId: number;
}

const RubricAssessmentsCard: React.FC<RubricAssessmentsCardProps> = ({ surveyId }) => {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<RubricAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAssessments, setExpandedAssessments] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAssessments();
  }, [surveyId]);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('rubric_assessments')
        .select(`
          *,
          assessment_rubrics!inner(name)
        `)
        .eq('survey_submission_id', surveyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const assessmentsWithRubricNames = (data || []).map(assessment => ({
        ...assessment,
        rubric_name: assessment.assessment_rubrics?.name || 'Unknown Rubric',
        criterion_scores: typeof assessment.criterion_scores === 'object' && assessment.criterion_scores !== null 
          ? assessment.criterion_scores as Record<string, any>
          : {},
        strengths: Array.isArray(assessment.strengths) ? assessment.strengths : [],
        areas_for_improvement: Array.isArray(assessment.areas_for_improvement) ? assessment.areas_for_improvement : [],
        recommendations: Array.isArray(assessment.recommendations) ? assessment.recommendations : [],
        assessment_summary: assessment.assessment_summary || '',
        confidence_score: assessment.confidence_score || 0
      }));

      setAssessments(assessmentsWithRubricNames);
    } catch (error) {
      console.error('Error fetching rubric assessments:', error);
      toast({
        title: "Error",
        description: "Failed to load rubric assessments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (assessmentId: string) => {
    const newExpanded = new Set(expandedAssessments);
    if (newExpanded.has(assessmentId)) {
      newExpanded.delete(assessmentId);
    } else {
      newExpanded.add(assessmentId);
    }
    setExpandedAssessments(newExpanded);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const prepareRadarData = (criterionScores: Record<string, any>) => {
    return Object.entries(criterionScores).map(([criterion, data]) => ({
      criterion: criterion.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      score: data.score || 0,
      fullMark: data.maxScore || 5
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI Rubric Assessments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading assessments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>AI Rubric Assessments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No rubric assessments available for this survey.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assessments.map(assessment => {
        const isExpanded = expandedAssessments.has(assessment.id);
        const radarData = prepareRadarData(assessment.criterion_scores);

        return (
          <Card key={assessment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>{assessment.rubric_name}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getConfidenceColor(assessment.confidence_score)}>
                    {Math.round(assessment.confidence_score * 100)}% Confidence
                  </Badge>
                  <button
                    onClick={() => toggleExpanded(assessment.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overall Score */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                  <div className={`text-2xl font-bold ${getScoreColor(assessment.percentage_score)}`}>
                    {assessment.overall_score.toFixed(1)} / {assessment.max_possible_score}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Percentage</div>
                  <div className={`text-2xl font-bold ${getScoreColor(assessment.percentage_score)}`}>
                    {assessment.percentage_score.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <Progress 
                value={assessment.percentage_score} 
                className="h-3"
              />

              {isExpanded && (
                <>
                  {/* Assessment Summary */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Assessment Summary</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                      {assessment.assessment_summary}
                    </p>
                  </div>

                  {/* Radar Chart */}
                  {radarData.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Criterion Scores</h4>
                      <div className="bg-white p-4 rounded-lg border">
                        <RubricScoresRadar data={radarData} />
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {assessment.strengths && assessment.strengths.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                        <Star className="h-4 w-4 text-green-500" />
                        <span>Strengths</span>
                      </h4>
                      <ul className="space-y-1">
                        {assessment.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start space-x-2 text-green-700 bg-green-50 p-2 rounded">
                            <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {assessment.areas_for_improvement && assessment.areas_for_improvement.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span>Areas for Improvement</span>
                      </h4>
                      <ul className="space-y-1">
                        {assessment.areas_for_improvement.map((area, index) => (
                          <li key={index} className="flex items-start space-x-2 text-yellow-700 bg-yellow-50 p-2 rounded">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {assessment.recommendations && assessment.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4 text-blue-500" />
                        <span>Recommendations</span>
                      </h4>
                      <ul className="space-y-1">
                        {assessment.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start space-x-2 text-blue-700 bg-blue-50 p-2 rounded">
                            <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Detailed Criterion Scores */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Detailed Scores</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(assessment.criterion_scores).map(([criterion, data]) => (
                        <div key={criterion} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">
                              {criterion.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="text-sm font-medium">
                              {data.score} / {data.maxScore}
                            </span>
                          </div>
                          <Progress 
                            value={(data.score / data.maxScore) * 100} 
                            className="h-2 mb-2"
                          />
                          {data.rationale && (
                            <p className="text-xs text-gray-600">{data.rationale}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RubricAssessmentsCard;