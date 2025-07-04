export interface BaseQuestion {
  id: string;
  type: string;
  question: string;
}

export interface RadioQuestion extends BaseQuestion {
  type: 'radio';
  options: string[];
}

export interface CheckboxQuestion extends BaseQuestion {
  type: 'checkbox';
  options: string[];
  maxSelections?: number;
}

export interface ScaleQuestion extends BaseQuestion {
  type: 'scale';
  scaleLabels: string[];
}

export interface ScaleGridQuestion extends BaseQuestion {
  type: 'scale-grid';
  prompts: string[];
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
}

export type Question = RadioQuestion | CheckboxQuestion | ScaleQuestion | ScaleGridQuestion | TextQuestion;

export interface SurveySection {
  title: string;
  type: 'instructions' | 'questions';
  description?: string;
  content?: string;
  questions?: Question[];
}

export interface Survey {
  title: string;
  description: string;
  sections: SurveySection[];
}