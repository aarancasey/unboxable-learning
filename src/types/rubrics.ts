export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // Percentage weight of this criterion
}

export interface ScaleLevel {
  level: number;
  label: string;
  description: string;
  points: number;
}

export interface ScoringScale {
  id: string;
  name: string;
  levels: ScaleLevel[];
  maxPoints: number;
}

export interface AssessmentRubric {
  id?: string;
  name: string;
  description?: string;
  criteria: RubricCriterion[];
  scoring_scale: ScoringScale;
  category_id?: string;
  content_library_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RubricTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  criteria: Omit<RubricCriterion, 'id'>[];
  scoring_scale: Omit<ScoringScale, 'id'>;
}

export type RubricGenerationMode = 'template' | 'manual' | 'hybrid';