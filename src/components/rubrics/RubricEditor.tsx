import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { AssessmentRubric, RubricCriterion, ScaleLevel, ScoringScale } from '@/types/rubrics';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RubricEditorProps {
  initialRubric?: Partial<AssessmentRubric>;
  onSave: (rubric: Omit<AssessmentRubric, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export const RubricEditor = ({ initialRubric, onSave, onCancel }: RubricEditorProps) => {
  const { toast } = useToast();
  const [rubric, setRubric] = useState<Omit<AssessmentRubric, 'id'>>({
    name: initialRubric?.name || '',
    description: initialRubric?.description || '',
    criteria: initialRubric?.criteria || [
      {
        id: crypto.randomUUID(),
        name: '',
        description: '',
        weight: 25
      }
    ],
    scoring_scale: initialRubric?.scoring_scale || {
      id: crypto.randomUUID(),
      name: 'Default Scale',
      maxPoints: 4,
      levels: [
        { level: 1, label: 'Needs Improvement', description: 'Below expectations', points: 1 },
        { level: 2, label: 'Developing', description: 'Approaching expectations', points: 2 },
        { level: 3, label: 'Proficient', description: 'Meets expectations', points: 3 },
        { level: 4, label: 'Advanced', description: 'Exceeds expectations', points: 4 }
      ]
    },
    category_id: initialRubric?.category_id,
    content_library_id: initialRubric?.content_library_id
  });

  const [saving, setSaving] = useState(false);

  // Validate that weights add up to 100%
  const totalWeight = rubric.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);

  const addCriterion = () => {
    const newWeight = Math.max(0, (100 - totalWeight) / (rubric.criteria.length + 1));
    setRubric(prev => ({
      ...prev,
      criteria: [
        ...prev.criteria,
        {
          id: crypto.randomUUID(),
          name: '',
          description: '',
          weight: Math.round(newWeight)
        }
      ]
    }));
  };

  const removeCriterion = (id: string) => {
    if (rubric.criteria.length === 1) {
      toast({
        title: "Cannot remove",
        description: "A rubric must have at least one criterion",
        variant: "destructive"
      });
      return;
    }
    
    setRubric(prev => ({
      ...prev,
      criteria: prev.criteria.filter(criterion => criterion.id !== id)
    }));
  };

  const updateCriterion = (id: string, updates: Partial<RubricCriterion>) => {
    setRubric(prev => ({
      ...prev,
      criteria: prev.criteria.map(criterion =>
        criterion.id === id ? { ...criterion, ...updates } : criterion
      )
    }));
  };

  const addScaleLevel = () => {
    const newLevel = rubric.scoring_scale.levels.length + 1;
    setRubric(prev => ({
      ...prev,
      scoring_scale: {
        ...prev.scoring_scale,
        maxPoints: newLevel,
        levels: [
          ...prev.scoring_scale.levels,
          {
            level: newLevel,
            label: `Level ${newLevel}`,
            description: '',
            points: newLevel
          }
        ]
      }
    }));
  };

  const removeScaleLevel = (level: number) => {
    if (rubric.scoring_scale.levels.length === 1) {
      toast({
        title: "Cannot remove",
        description: "A scoring scale must have at least one level",
        variant: "destructive"
      });
      return;
    }

    setRubric(prev => ({
      ...prev,
      scoring_scale: {
        ...prev.scoring_scale,
        levels: prev.scoring_scale.levels.filter(l => l.level !== level)
          .map((l, index) => ({ ...l, level: index + 1, points: index + 1 })),
        maxPoints: prev.scoring_scale.levels.length - 1
      }
    }));
  };

  const updateScaleLevel = (level: number, updates: Partial<ScaleLevel>) => {
    setRubric(prev => ({
      ...prev,
      scoring_scale: {
        ...prev.scoring_scale,
        levels: prev.scoring_scale.levels.map(l =>
          l.level === level ? { ...l, ...updates } : l
        )
      }
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!rubric.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Rubric name is required",
        variant: "destructive"
      });
      return;
    }

    if (rubric.criteria.some(c => !c.name.trim())) {
      toast({
        title: "Validation Error",
        description: "All criteria must have names",
        variant: "destructive"
      });
      return;
    }

    if (Math.abs(totalWeight - 100) > 1) {
      toast({
        title: "Validation Error",
        description: "Criterion weights must add up to 100%",
        variant: "destructive"
      });
      return;
    }

    if (rubric.scoring_scale.levels.some(l => !l.label.trim())) {
      toast({
        title: "Validation Error",
        description: "All scale levels must have labels",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(rubric);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="rubric-name">Rubric Name *</Label>
            <Input
              id="rubric-name"
              value={rubric.name}
              onChange={(e) => setRubric(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter rubric name"
            />
          </div>
          
          <div>
            <Label htmlFor="rubric-description">Description</Label>
            <Textarea
              id="rubric-description"
              value={rubric.description || ''}
              onChange={(e) => setRubric(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose and scope of this rubric"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assessment Criteria */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assessment Criteria</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Total weight: {totalWeight}% 
                {Math.abs(totalWeight - 100) > 1 && (
                  <Badge variant="destructive" className="ml-2">
                    Must equal 100%
                  </Badge>
                )}
              </p>
            </div>
            <Button onClick={addCriterion} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Criterion
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rubric.criteria.map((criterion, index) => (
            <Card key={criterion.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <GripVertical className="w-5 h-5 text-gray-400 mt-2" />
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Criterion Name *</Label>
                        <Input
                          value={criterion.name}
                          onChange={(e) => updateCriterion(criterion.id, { name: e.target.value })}
                          placeholder="e.g., Communication Skills"
                        />
                      </div>
                      <div>
                        <Label>Weight: {criterion.weight}%</Label>
                        <Slider
                          value={[criterion.weight]}
                          onValueChange={([value]) => updateCriterion(criterion.id, { weight: value })}
                          max={100}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={criterion.description}
                        onChange={(e) => updateCriterion(criterion.id, { description: e.target.value })}
                        placeholder="Describe what this criterion evaluates"
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCriterion(criterion.id)}
                    disabled={rubric.criteria.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Scoring Scale */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scoring Scale</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Define the performance levels and their point values
              </p>
            </div>
            <Button onClick={addScaleLevel} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Level
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="scale-name">Scale Name</Label>
            <Input
              id="scale-name"
              value={rubric.scoring_scale.name}
              onChange={(e) => setRubric(prev => ({
                ...prev,
                scoring_scale: { ...prev.scoring_scale, name: e.target.value }
              }))}
              placeholder="e.g., Performance Scale"
            />
          </div>

          <div className="space-y-3">
            {rubric.scoring_scale.levels
              .sort((a, b) => a.level - b.level)
              .map((level) => (
              <Card key={level.level} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-unboxable-navy text-white rounded-full text-sm font-medium">
                    {level.points}
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Level Label *</Label>
                      <Input
                        value={level.label}
                        onChange={(e) => updateScaleLevel(level.level, { label: e.target.value })}
                        placeholder="e.g., Advanced"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={level.description}
                        onChange={(e) => updateScaleLevel(level.level, { description: e.target.value })}
                        placeholder="Describe this performance level"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeScaleLevel(level.level)}
                    disabled={rubric.scoring_scale.levels.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saving || Math.abs(totalWeight - 100) > 1}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Rubric'}
        </Button>
      </div>
    </div>
  );
};