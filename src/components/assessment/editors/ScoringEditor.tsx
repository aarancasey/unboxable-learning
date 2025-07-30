import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Award, 
  Target, 
  TrendingUp, 
  Star,
  Plus,
  Trash2,
  RotateCcw,
  Calculator,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScoringEditorProps {
  rubricAssessments: Array<{
    rubricId: string;
    rubricName: string;
    overallScore: number;
    maxScore: number;
    criteriaScores: Array<{
      criterion: string;
      score: number;
      maxScore: number;
      weight: number;
    }>;
  }>;
  purposeRating: number;
  agilityLevel: string;
  onChange: (data: any) => void;
}

export const ScoringEditor = ({ 
  rubricAssessments, 
  purposeRating, 
  agilityLevel, 
  onChange 
}: ScoringEditorProps) => {
  const { toast } = useToast();
  const [localRubrics, setLocalRubrics] = useState(rubricAssessments);
  const [localPurposeRating, setLocalPurposeRating] = useState(purposeRating);
  const [localAgilityLevel, setLocalAgilityLevel] = useState(agilityLevel);
  const [hasChanges, setHasChanges] = useState(false);

  const agilityLevels = [
    { value: 'Opportunist', label: 'Opportunist', description: 'Basic leadership level' },
    { value: 'Diplomat', label: 'Diplomat', description: 'Relationship focused' },
    { value: 'Expert', label: 'Expert', description: 'Technical mastery' },
    { value: 'Achiever', label: 'Achiever', description: 'Results oriented' },
    { value: 'Individualist', label: 'Individualist', description: 'Creative & independent' },
    { value: 'Strategist', label: 'Strategist', description: 'Systems thinking' },
    { value: 'Alchemist', label: 'Alchemist', description: 'Transformational leader' }
  ];

  useEffect(() => {
    setLocalRubrics(rubricAssessments || []);
    setLocalPurposeRating(purposeRating || 4);
    setLocalAgilityLevel(agilityLevel || 'Achiever');
    setHasChanges(false);
  }, [rubricAssessments, purposeRating, agilityLevel]);

  const handleRubricChange = (rubricIndex: number, updates: any) => {
    const updatedRubrics = [...localRubrics];
    updatedRubrics[rubricIndex] = { ...updatedRubrics[rubricIndex], ...updates };
    
    // Recalculate overall score if criteria scores changed
    if (updates.criteriaScores) {
      const criteriaScores = updatedRubrics[rubricIndex].criteriaScores;
      const totalWeightedScore = criteriaScores.reduce((sum, criteria) => 
        sum + (criteria.score * criteria.weight / 100), 0);
      updatedRubrics[rubricIndex].overallScore = totalWeightedScore;
    }
    
    setLocalRubrics(updatedRubrics);
    setHasChanges(true);
    
    onChange({
      rubricAssessments: updatedRubrics,
      purposeRating: localPurposeRating,
      agilityLevel: localAgilityLevel
    });
  };

  const handleCriteriaChange = (rubricIndex: number, criteriaIndex: number, updates: any) => {
    const updatedRubrics = [...localRubrics];
    const updatedCriteria = [...updatedRubrics[rubricIndex].criteriaScores];
    updatedCriteria[criteriaIndex] = { ...updatedCriteria[criteriaIndex], ...updates };
    
    handleRubricChange(rubricIndex, { criteriaScores: updatedCriteria });
  };

  const addCriteria = (rubricIndex: number) => {
    const newCriteria = {
      criterion: 'New Criterion',
      score: 2.5,
      maxScore: 4,
      weight: 25
    };
    
    const updatedCriteria = [...localRubrics[rubricIndex].criteriaScores, newCriteria];
    handleRubricChange(rubricIndex, { criteriaScores: updatedCriteria });
  };

  const removeCriteria = (rubricIndex: number, criteriaIndex: number) => {
    const updatedCriteria = localRubrics[rubricIndex].criteriaScores.filter((_, i) => i !== criteriaIndex);
    handleRubricChange(rubricIndex, { criteriaScores: updatedCriteria });
  };

  const handlePurposeRatingChange = (rating: number) => {
    setLocalPurposeRating(rating);
    setHasChanges(true);
    onChange({
      rubricAssessments: localRubrics,
      purposeRating: rating,
      agilityLevel: localAgilityLevel
    });
  };

  const handleAgilityLevelChange = (level: string) => {
    setLocalAgilityLevel(level);
    setHasChanges(true);
    onChange({
      rubricAssessments: localRubrics,
      purposeRating: localPurposeRating,
      agilityLevel: level
    });
  };

  const handleReset = () => {
    setLocalRubrics(rubricAssessments || []);
    setLocalPurposeRating(purposeRating || 4);
    setLocalAgilityLevel(agilityLevel || 'Achiever');
    setHasChanges(false);
    
    onChange({
      rubricAssessments: rubricAssessments || [],
      purposeRating: purposeRating || 4,
      agilityLevel: agilityLevel || 'Achiever'
    });
    
    toast({
      title: "Scores Reset",
      description: "All scoring has been reset to original values.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Scoring & Assessment</h3>
        <p className="text-sm text-muted-foreground">
          Adjust rubric scores, purpose rating, and leadership agility level for this assessment.
        </p>
      </div>

      {/* Overall Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purpose Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Purpose Alignment Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Current Rating</Label>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {localPurposeRating}/6
                </Badge>
              </div>
              <Slider
                value={[localPurposeRating]}
                onValueChange={(value) => handlePurposeRatingChange(value[0])}
                min={1}
                max={6}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Disconnected (1)</span>
                <span>Highly Aligned (6)</span>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Rating Guide:</strong><br />
                1-2: Disconnected from purpose<br />
                3-4: Developing clarity<br />
                5-6: Highly aligned and purposeful
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Leadership Agility Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Leadership Agility Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Level</Label>
              <Select value={localAgilityLevel} onValueChange={handleAgilityLevelChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agilityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{level.label}</span>
                        <span className="text-xs text-muted-foreground">{level.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>{localAgilityLevel}:</strong><br />
                {agilityLevels.find(l => l.value === localAgilityLevel)?.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rubric Assessments */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium">Rubric Assessments</h4>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Rubric
          </Button>
        </div>

        {localRubrics.map((rubric, rubricIndex) => (
          <Card key={rubric.rubricId} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {rubric.rubricName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {rubric.overallScore.toFixed(1)}/{rubric.maxScore}
                  </Badge>
                  <Badge variant="outline">
                    {((rubric.overallScore / rubric.maxScore) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Criteria Scores */}
              <div className="space-y-4">
                {rubric.criteriaScores.map((criteria, criteriaIndex) => (
                  <Card key={criteriaIndex} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            value={criteria.criterion}
                            onChange={(e) => handleCriteriaChange(rubricIndex, criteriaIndex, 
                              { criterion: e.target.value })}
                            className="font-medium"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCriteria(rubricIndex, criteriaIndex)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Score */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="text-sm">Score</Label>
                              <Badge variant="outline">
                                {criteria.score.toFixed(1)}/{criteria.maxScore}
                              </Badge>
                            </div>
                            <Slider
                              value={[criteria.score]}
                              onValueChange={(value) => handleCriteriaChange(rubricIndex, criteriaIndex, 
                                { score: value[0] })}
                              min={0}
                              max={criteria.maxScore}
                              step={0.1}
                              className="w-full"
                            />
                          </div>
                          
                          {/* Max Score */}
                          <div className="space-y-2">
                            <Label className="text-sm">Max Score</Label>
                            <Input
                              type="number"
                              value={criteria.maxScore}
                              onChange={(e) => handleCriteriaChange(rubricIndex, criteriaIndex, 
                                { maxScore: parseFloat(e.target.value) || 4 })}
                              min={1}
                              max={10}
                              step={0.5}
                            />
                          </div>
                          
                          {/* Weight */}
                          <div className="space-y-2">
                            <Label className="text-sm">Weight (%)</Label>
                            <Input
                              type="number"
                              value={criteria.weight}
                              onChange={(e) => handleCriteriaChange(rubricIndex, criteriaIndex, 
                                { weight: parseInt(e.target.value) || 25 })}
                              min={0}
                              max={100}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => addCriteria(rubricIndex)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Assessment Criteria
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!hasChanges}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Scores
        </Button>
        
        {hasChanges && (
          <Badge variant="default" className="px-3 py-1">
            Scores updated
          </Badge>
        )}
      </div>

      {/* Scoring Guidelines */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Calculator className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-amber-900">
                Scoring Guidelines
              </h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Overall scores are calculated automatically based on weighted criteria</li>
                <li>• Ensure all criteria weights add up to 100% for accurate calculations</li>
                <li>• Use consistent scoring scales across all criteria</li>
                <li>• Higher scores should reflect stronger performance in that area</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};