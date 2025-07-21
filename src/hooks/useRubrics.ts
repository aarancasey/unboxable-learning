import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentRubric, RubricTemplate } from '@/types/rubrics';
import { useToast } from '@/hooks/use-toast';

export const useRubrics = () => {
  const [rubrics, setRubrics] = useState<AssessmentRubric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRubrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('assessment_rubrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data from database format to our interface
      const transformedRubrics: AssessmentRubric[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: undefined, // Add description field to database if needed
        criteria: Array.isArray(item.criteria) ? item.criteria as any[] : [],
        scoring_scale: typeof item.scoring_scale === 'object' ? item.scoring_scale as any : { id: '', name: '', levels: [], maxPoints: 0 },
        category_id: item.category_id,
        content_library_id: item.content_library_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setRubrics(transformedRubrics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rubrics';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRubric = async (rubric: Omit<AssessmentRubric, 'id'>) => {
    setLoading(true);
    
    try {
      // Transform our interface to database format
      const dbRubric = {
        name: rubric.name,
        criteria: rubric.criteria as any,
        scoring_scale: rubric.scoring_scale as any,
        category_id: rubric.category_id,
        content_library_id: rubric.content_library_id
      };
      
      const { data, error } = await supabase
        .from('assessment_rubrics')
        .insert([dbRubric])
        .select()
        .single();

      if (error) throw error;
      
      // Transform back to our interface
      const transformedRubric: AssessmentRubric = {
        id: data.id,
        name: data.name,
        description: rubric.description,
        criteria: Array.isArray(data.criteria) ? data.criteria as any[] : [],
        scoring_scale: typeof data.scoring_scale === 'object' ? data.scoring_scale as any : { id: '', name: '', levels: [], maxPoints: 0 },
        category_id: data.category_id,
        content_library_id: data.content_library_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setRubrics(prev => [transformedRubric, ...prev]);
      toast({
        title: "Success",
        description: "Rubric created successfully"
      });
      
      return transformedRubric;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create rubric';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRubric = async (id: string, updates: Partial<AssessmentRubric>) => {
    setLoading(true);
    
    try {
      // Transform our interface to database format
      const dbUpdates = {
        name: updates.name,
        criteria: updates.criteria as any,
        scoring_scale: updates.scoring_scale as any,
        category_id: updates.category_id,
        content_library_id: updates.content_library_id
      };
      
      const { data, error } = await supabase
        .from('assessment_rubrics')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Transform back to our interface
      const transformedRubric: AssessmentRubric = {
        id: data.id,
        name: data.name,
        description: updates.description,
        criteria: Array.isArray(data.criteria) ? data.criteria as any[] : [],
        scoring_scale: typeof data.scoring_scale === 'object' ? data.scoring_scale as any : { id: '', name: '', levels: [], maxPoints: 0 },
        category_id: data.category_id,
        content_library_id: data.content_library_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setRubrics(prev => prev.map(r => r.id === id ? transformedRubric : r));
      toast({
        title: "Success",
        description: "Rubric updated successfully"
      });
      
      return transformedRubric;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update rubric';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRubric = async (id: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('assessment_rubrics')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRubrics(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Success",
        description: "Rubric deleted successfully"
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete rubric';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRubrics();
  }, []);

  return {
    rubrics,
    loading,
    error,
    fetchRubrics,
    createRubric,
    updateRubric,
    deleteRubric
  };
};

// Predefined rubric templates (no AI needed)
export const getRubricTemplates = (): RubricTemplate[] => [
  {
    id: 'leadership-assessment',
    name: 'Leadership Assessment',
    description: 'Comprehensive leadership evaluation rubric',
    category: 'Leadership',
    criteria: [
      {
        name: 'Communication Skills',
        description: 'Ability to convey ideas clearly and effectively',
        weight: 25
      },
      {
        name: 'Decision Making',
        description: 'Quality of decisions and decision-making process',
        weight: 25
      },
      {
        name: 'Team Management',
        description: 'Effectiveness in leading and motivating teams',
        weight: 25
      },
      {
        name: 'Strategic Thinking',
        description: 'Ability to think strategically and plan ahead',
        weight: 25
      }
    ],
    scoring_scale: {
      name: 'Leadership Scale',
      maxPoints: 4,
      levels: [
        { level: 1, label: 'Developing', description: 'Beginning to show competency', points: 1 },
        { level: 2, label: 'Proficient', description: 'Meets expectations', points: 2 },
        { level: 3, label: 'Advanced', description: 'Exceeds expectations', points: 3 },
        { level: 4, label: 'Expert', description: 'Exceptional performance', points: 4 }
      ]
    }
  },
  {
    id: 'communication-skills',
    name: 'Communication Skills',
    description: 'Assessment of verbal and written communication abilities',
    category: 'Communication',
    criteria: [
      {
        name: 'Clarity',
        description: 'How clearly ideas are expressed',
        weight: 30
      },
      {
        name: 'Active Listening',
        description: 'Demonstrates effective listening skills',
        weight: 25
      },
      {
        name: 'Presentation Skills',
        description: 'Effectiveness in formal presentations',
        weight: 25
      },
      {
        name: 'Written Communication',
        description: 'Quality of written materials and documents',
        weight: 20
      }
    ],
    scoring_scale: {
      name: 'Communication Scale',
      maxPoints: 5,
      levels: [
        { level: 1, label: 'Poor', description: 'Significant improvement needed', points: 1 },
        { level: 2, label: 'Below Average', description: 'Some improvement needed', points: 2 },
        { level: 3, label: 'Average', description: 'Meets basic requirements', points: 3 },
        { level: 4, label: 'Good', description: 'Above average performance', points: 4 },
        { level: 5, label: 'Excellent', description: 'Outstanding communication skills', points: 5 }
      ]
    }
  },
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Evaluation of project planning and execution skills',
    category: 'Management',
    criteria: [
      {
        name: 'Planning & Organization',
        description: 'Ability to plan and organize project activities',
        weight: 30
      },
      {
        name: 'Resource Management',
        description: 'Effective allocation and management of resources',
        weight: 25
      },
      {
        name: 'Timeline Management',
        description: 'Adherence to schedules and deadlines',
        weight: 25
      },
      {
        name: 'Risk Management',
        description: 'Identification and mitigation of project risks',
        weight: 20
      }
    ],
    scoring_scale: {
      name: 'Project Management Scale',
      maxPoints: 4,
      levels: [
        { level: 1, label: 'Novice', description: 'Limited project management experience', points: 1 },
        { level: 2, label: 'Developing', description: 'Growing project management skills', points: 2 },
        { level: 3, label: 'Competent', description: 'Solid project management abilities', points: 3 },
        { level: 4, label: 'Expert', description: 'Advanced project management expertise', points: 4 }
      ]
    }
  },
  {
    id: 'teamwork-collaboration',
    name: 'Teamwork & Collaboration',
    description: 'Assessment of collaborative working skills',
    category: 'Teamwork',
    criteria: [
      {
        name: 'Team Participation',
        description: 'Active participation in team activities',
        weight: 25
      },
      {
        name: 'Conflict Resolution',
        description: 'Ability to resolve conflicts constructively',
        weight: 25
      },
      {
        name: 'Support of Others',
        description: 'Willingness to help and support team members',
        weight: 25
      },
      {
        name: 'Shared Responsibility',
        description: 'Takes ownership of team outcomes',
        weight: 25
      }
    ],
    scoring_scale: {
      name: 'Teamwork Scale',
      maxPoints: 3,
      levels: [
        { level: 1, label: 'Individual Contributor', description: 'Works well independently', points: 1 },
        { level: 2, label: 'Team Player', description: 'Collaborates effectively with others', points: 2 },
        { level: 3, label: 'Team Leader', description: 'Enhances team performance', points: 3 }
      ]
    }
  }
];