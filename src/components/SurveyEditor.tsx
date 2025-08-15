import { useState, useEffect } from 'react';
import { surveyService } from '@/services/surveyService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Save, 
  Edit, 
  Move, 
  ChevronUp, 
  ChevronDown,
  FileText,
  HelpCircle,
  CheckSquare,
  Radio,
  ToggleLeft,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useSurveyData } from './survey/useSurveyData';
import type { Survey, SurveySection, Question } from './survey/types';

const SurveyEditor = () => {
  const originalSurvey = useSurveyData();
  const [survey, setSurvey] = useState<Survey>(originalSurvey);
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(survey) !== JSON.stringify(originalSurvey));
  }, [survey, originalSurvey]);

  const updateSurvey = (updates: Partial<Survey>) => {
    setSurvey(prev => ({ ...prev, ...updates }));
  };

  const updateSection = (sectionIndex: number, updates: Partial<SurveySection>) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) => 
        index === sectionIndex ? { ...section, ...updates } : section
      )
    }));
  };

  const addSection = () => {
    const newSection: SurveySection = {
      title: "New Section",
      type: "questions",
      description: "",
      questions: []
    };
    setSurvey(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const deleteSection = (sectionIndex: number) => {
    setSurvey(prev => {
      const newSections = prev.sections.filter((_, index) => index !== sectionIndex);
      
      // Update selected section if needed
      if (selectedSection >= newSections.length) {
        setSelectedSection(Math.max(0, newSections.length - 1));
      } else if (selectedSection > sectionIndex) {
        setSelectedSection(selectedSection - 1);
      }
      
      return {
        ...prev,
        sections: newSections
      };
    });
  };

  const moveSection = (sectionIndex: number, direction: 'up' | 'down') => {
    const sections = [...survey.sections];
    const newIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    
    if (newIndex >= 0 && newIndex < sections.length) {
      [sections[sectionIndex], sections[newIndex]] = [sections[newIndex], sections[sectionIndex]];
      setSurvey(prev => ({ ...prev, sections }));
      setSelectedSection(newIndex);
    }
  };

  const addQuestion = (sectionIndex: number) => {
    const newQuestion: Question = {
      id: `question_${Date.now()}`,
      type: "text",
      question: "New question"
    } as Question;
    
    updateSection(sectionIndex, {
      questions: [...(survey.sections[sectionIndex].questions || []), newQuestion]
    });
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: any) => {
    const section = survey.sections[sectionIndex];
    if (!section.questions) return;
    
    const updatedQuestions = section.questions.map((question, index) =>
      index === questionIndex ? { ...question, ...updates } as Question : question
    );
    
    updateSection(sectionIndex, { questions: updatedQuestions });
  };

  const deleteQuestion = (sectionIndex: number, questionIndex: number) => {
    const section = survey.sections[sectionIndex];
    if (!section.questions) return;
    
    const updatedQuestions = section.questions.filter((_, index) => index !== questionIndex);
    updateSection(sectionIndex, { questions: updatedQuestions });
  };

  const moveQuestion = (sectionIndex: number, questionIndex: number, direction: 'up' | 'down') => {
    const section = survey.sections[sectionIndex];
    if (!section.questions) return;
    
    const questions = [...section.questions];
    const newIndex = direction === 'up' ? questionIndex - 1 : questionIndex + 1;
    
    if (newIndex >= 0 && newIndex < questions.length) {
      [questions[questionIndex], questions[newIndex]] = [questions[newIndex], questions[questionIndex]];
      updateSection(sectionIndex, { questions });
    }
  };

  const saveSurvey = async () => {
    try {
      console.log('🚀 Attempting to save survey to Supabase:', survey);
      const success = await surveyService.saveSurveyConfiguration(survey);
      
      if (success) {
        // Also save to localStorage as backup
        localStorage.setItem('surveyData', JSON.stringify(survey));
        console.log('✅ Survey saved successfully to Supabase');
        toast.success('Survey saved successfully to database!');
        setHasChanges(false);
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      // Fallback to localStorage only
      localStorage.setItem('surveyData', JSON.stringify(survey));
      toast.error('Failed to save to database, saved locally only');
      setHasChanges(false);
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'radio': return <Radio className="h-4 w-4" />;
      case 'checkbox': return <CheckSquare className="h-4 w-4" />;
      case 'scale': return <ToggleLeft className="h-4 w-4" />;
      case 'scale-grid': return <Hash className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const renderQuestionEditor = (question: Question, sectionIndex: number, questionIndex: number) => {
    return (
      <Card key={question.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getQuestionTypeIcon(question.type)}
              <span className="font-medium">Question {questionIndex + 1}</span>
              <Badge variant="secondary">{question.type}</Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => moveQuestion(sectionIndex, questionIndex, 'up')}
                disabled={questionIndex === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => moveQuestion(sectionIndex, questionIndex, 'down')}
                disabled={questionIndex === (survey.sections[sectionIndex].questions?.length || 0) - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteQuestion(sectionIndex, questionIndex)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`question-type-${question.id}`}>Question Type</Label>
              <Select
                value={question.type}
                onValueChange={(value) => updateQuestion(sectionIndex, questionIndex, { type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Input</SelectItem>
                  <SelectItem value="radio">Single Choice</SelectItem>
                  <SelectItem value="checkbox">Multiple Choice</SelectItem>
                  <SelectItem value="scale">Scale Rating</SelectItem>
                  <SelectItem value="scale-grid">Scale Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor={`question-id-${question.id}`}>Question ID</Label>
              <Input
                id={`question-id-${question.id}`}
                value={question.id}
                onChange={(e) => updateQuestion(sectionIndex, questionIndex, { id: e.target.value })}
                placeholder="question_id"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor={`question-text-${question.id}`}>Question Text</Label>
            <Textarea
              id={`question-text-${question.id}`}
              value={question.question}
              onChange={(e) => updateQuestion(sectionIndex, questionIndex, { question: e.target.value })}
              placeholder="Enter your question here..."
              className="min-h-[100px]"
            />
          </div>

          {(question.type === 'radio' || question.type === 'checkbox') && 'options' in question && (
            <div>
              <Label>Options</Label>
              <div className="space-y-2 mt-2">
                {('options' in question ? question.options : [])?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const currentOptions = 'options' in question ? question.options || [] : [];
                        const newOptions = [...currentOptions];
                        newOptions[optionIndex] = e.target.value;
                        updateQuestion(sectionIndex, questionIndex, { options: newOptions });
                      }}
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const currentOptions = 'options' in question ? question.options || [] : [];
                        const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
                        updateQuestion(sectionIndex, questionIndex, { options: newOptions });
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const currentOptions = 'options' in question ? question.options || [] : [];
                    const newOptions = [...currentOptions, ''];
                    updateQuestion(sectionIndex, questionIndex, { options: newOptions });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {question.type === 'scale' && 'scaleLabels' in question && question.scaleLabels && (
            <div>
              <Label>Scale Labels</Label>
              <div className="space-y-2 mt-2">
                {('scaleLabels' in question ? question.scaleLabels : []).map((label, labelIndex) => (
                  <div key={labelIndex} className="flex items-center space-x-2">
                    <span className="w-8 text-sm">{labelIndex + 1}:</span>
                    <Input
                      value={label}
                      onChange={(e) => {
                        const newLabels = [...(('scaleLabels' in question && question.scaleLabels) ? question.scaleLabels : [])];
                        newLabels[labelIndex] = e.target.value;
                        updateQuestion(sectionIndex, questionIndex, { scaleLabels: newLabels });
                      }}
                      placeholder={`Scale level ${labelIndex + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.type === 'scale-grid' && 'prompts' in question && (
            <div>
              <Label>Grid Prompts</Label>
              <div className="space-y-2 mt-2">
                {('prompts' in question ? question.prompts : [])?.map((prompt, promptIndex) => (
                  <div key={promptIndex} className="flex items-center space-x-2">
                    <Input
                      value={prompt}
                      onChange={(e) => {
                        const newPrompts = [...(('prompts' in question && question.prompts) ? question.prompts : [])];
                        newPrompts[promptIndex] = e.target.value;
                        updateQuestion(sectionIndex, questionIndex, { prompts: newPrompts });
                      }}
                      placeholder={`Prompt ${promptIndex + 1}`}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newPrompts = (('prompts' in question && question.prompts) ? question.prompts : []).filter((_, i) => i !== promptIndex);
                        updateQuestion(sectionIndex, questionIndex, { prompts: newPrompts });
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newPrompts = [...(('prompts' in question && question.prompts) ? question.prompts : []), ''];
                    updateQuestion(sectionIndex, questionIndex, { prompts: newPrompts });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prompt
                </Button>
              </div>
            </div>
          )}

          {question.type === 'checkbox' && 'maxSelections' in question && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`max-selections-${question.id}`}
                checked={!!('maxSelections' in question && question.maxSelections)}
                onCheckedChange={(checked) => {
                  updateQuestion(sectionIndex, questionIndex, { 
                    maxSelections: checked ? 3 : undefined 
                  });
                }}
              />
              <Label htmlFor={`max-selections-${question.id}`}>Limit selections</Label>
              {('maxSelections' in question && question.maxSelections) && (
                <Input
                  type="number"
                  value={question.maxSelections}
                  onChange={(e) => updateQuestion(sectionIndex, questionIndex, { 
                    maxSelections: parseInt(e.target.value) || 3 
                  })}
                  className="w-20"
                  min="1"
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Survey Editor</h2>
          <p className="text-gray-600">Edit and customise the survey content and structure</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="destructive">Unsaved Changes</Badge>
          )}
          <Button onClick={saveSurvey} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Survey
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="survey-title">Survey Title</Label>
            <Input
              id="survey-title"
              value={survey.title}
              onChange={(e) => updateSurvey({ title: e.target.value })}
              placeholder="Enter survey title"
            />
          </div>
          <div>
            <Label htmlFor="survey-description">Survey Description</Label>
            <Textarea
              id="survey-description"
              value={survey.description}
              onChange={(e) => updateSurvey({ description: e.target.value })}
              placeholder="Enter survey description"
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sections List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Sections</CardTitle>
              <Button size="sm" onClick={addSection}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {survey.sections.map((section, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedSection === index
                    ? 'bg-primary/10 border-primary'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedSection(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{section.title}</p>
                    <p className="text-xs text-gray-500">
                      {section.type === 'instructions' ? 'Instructions' : `${section.questions?.length || 0} questions`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(index, 'up');
                      }}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(index, 'down');
                      }}
                      disabled={index === survey.sections.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(index);
                      }}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section Editor */}
        <div className="lg:col-span-3">
          {survey.sections[selectedSection] && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit className="h-5 w-5" />
                  <span>Edit Section: {survey.sections[selectedSection].title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="section-title">Section Title</Label>
                    <Input
                      id="section-title"
                      value={survey.sections[selectedSection].title}
                      onChange={(e) => updateSection(selectedSection, { title: e.target.value })}
                      placeholder="Enter section title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="section-type">Section Type</Label>
                    <Select
                      value={survey.sections[selectedSection].type}
                      onValueChange={(value) => updateSection(selectedSection, { type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instructions">Instructions</SelectItem>
                        <SelectItem value="questions">Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="section-description">Section Description</Label>
                  <Textarea
                    id="section-description"
                    value={survey.sections[selectedSection].description || ''}
                    onChange={(e) => updateSection(selectedSection, { description: e.target.value })}
                    placeholder="Enter section description"
                  />
                </div>

                {survey.sections[selectedSection].type === 'instructions' && (
                  <div>
                    <Label htmlFor="section-content">Instructions Content</Label>
                    <Textarea
                      id="section-content"
                      value={survey.sections[selectedSection].content || ''}
                      onChange={(e) => updateSection(selectedSection, { content: e.target.value })}
                      placeholder="Enter instructions content"
                      className="min-h-[200px]"
                    />
                  </div>
                )}

                {survey.sections[selectedSection].type === 'questions' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium">Questions</h4>
                      <Button onClick={() => addQuestion(selectedSection)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {survey.sections[selectedSection].questions?.map((question, questionIndex) =>
                        renderQuestionEditor(question, selectedSection, questionIndex)
                      )}
                      
                      {(!survey.sections[selectedSection].questions || survey.sections[selectedSection].questions.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <p>No questions in this section</p>
                          <p className="text-sm">Click "Add Question" to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyEditor;