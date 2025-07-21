import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssessmentRubric } from '@/types/rubrics';
import { FileText, Award, BarChart3 } from 'lucide-react';

interface RubricPreviewProps {
  rubric: AssessmentRubric;
}

export const RubricPreview = ({ rubric }: RubricPreviewProps) => {
  const totalPossiblePoints = rubric.criteria.reduce((total, criterion) => {
    return total + (rubric.scoring_scale.maxPoints * (criterion.weight / 100));
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="w-5 h-5" />
                {rubric.name}
              </CardTitle>
              {rubric.description && (
                <p className="text-gray-600 mt-2">{rubric.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-unboxable-navy">
                {totalPossiblePoints.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Total Points</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Scoring Scale Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {rubric.scoring_scale.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rubric.scoring_scale.levels
              .sort((a, b) => a.level - b.level)
              .map((level) => (
              <div
                key={level.level}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-unboxable-navy text-white rounded-full text-sm font-medium">
                  {level.points}
                </div>
                <div>
                  <div className="font-medium text-sm">{level.label}</div>
                  <div className="text-xs text-gray-600">{level.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Assessment Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rubric.criteria.map((criterion, index) => {
              const maxPointsForCriterion = rubric.scoring_scale.maxPoints * (criterion.weight / 100);
              
              return (
                <Card key={criterion.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{criterion.name}</h4>
                      {criterion.description && (
                        <p className="text-gray-600 text-sm mt-1">{criterion.description}</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant="secondary" className="mb-1">
                        {criterion.weight}% weight
                      </Badge>
                      <div className="text-sm text-gray-500">
                        Max: {maxPointsForCriterion.toFixed(1)} pts
                      </div>
                    </div>
                  </div>

                  {/* Scoring levels for this criterion */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    {rubric.scoring_scale.levels
                      .sort((a, b) => a.level - b.level)
                      .map((level) => {
                        const pointsForLevel = level.points * (criterion.weight / 100);
                        return (
                          <div
                            key={level.level}
                            className="border rounded-lg p-3 text-center"
                          >
                            <div className="font-medium text-sm text-unboxable-navy">
                              {level.label}
                            </div>
                            <div className="text-lg font-bold mt-1">
                              {pointsForLevel.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-500">points</div>
                          </div>
                        );
                      })}
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Rubric Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-unboxable-navy">
                {rubric.criteria.length}
              </div>
              <div className="text-sm text-gray-500">Criteria</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-unboxable-navy">
                {rubric.scoring_scale.levels.length}
              </div>
              <div className="text-sm text-gray-500">Scale Levels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-unboxable-navy">
                {rubric.scoring_scale.maxPoints}
              </div>
              <div className="text-sm text-gray-500">Max Scale Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-unboxable-navy">
                {totalPossiblePoints.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Total Possible</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};