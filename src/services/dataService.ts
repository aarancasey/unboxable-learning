import { supabase } from '@/integrations/supabase/client';

// Data service to handle both Supabase and localStorage with migration
export class DataService {
  // Learners management
  static async getLearners() {
    try {
      const { data, error } = await supabase
        .from('learners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If no data in Supabase, try to migrate from localStorage
      if (!data || data.length === 0) {
        const localLearners = JSON.parse(localStorage.getItem('learners') || '[]');
        if (localLearners.length > 0) {
          await this.migrateLearners(localLearners);
          return localLearners;
        }
      }

      return data || [];
    } catch (error) {
      console.error('Error getting learners:', error);
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem('learners') || '[]');
    }
  }

  static async addLearner(learner: any) {
    try {
      const { data, error } = await supabase
        .from('learners')
        .insert([learner])
        .select()
        .single();

      if (error) throw error;

      // Also update localStorage as backup
      const localLearners = JSON.parse(localStorage.getItem('learners') || '[]');
      localLearners.push({ ...learner, id: data.id });
      localStorage.setItem('learners', JSON.stringify(localLearners));

      return data;
    } catch (error) {
      console.error('Error adding learner:', error);
      // Fallback to localStorage
      const localLearners = JSON.parse(localStorage.getItem('learners') || '[]');
      const newLearner = { ...learner, id: Date.now() };
      localLearners.push(newLearner);
      localStorage.setItem('learners', JSON.stringify(localLearners));
      return newLearner;
    }
  }

  static async updateLearner(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('learners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Also update localStorage as backup
      const localLearners = JSON.parse(localStorage.getItem('learners') || '[]');
      const index = localLearners.findIndex((l: any) => l.id === id);
      if (index !== -1) {
        localLearners[index] = { ...localLearners[index], ...updates };
        localStorage.setItem('learners', JSON.stringify(localLearners));
      }

      return data;
    } catch (error) {
      console.error('Error updating learner:', error);
      // Fallback to localStorage
      const localLearners = JSON.parse(localStorage.getItem('learners') || '[]');
      const index = localLearners.findIndex((l: any) => l.id === id);
      if (index !== -1) {
        localLearners[index] = { ...localLearners[index], ...updates };
        localStorage.setItem('learners', JSON.stringify(localLearners));
      }
      return localLearners[index];
    }
  }

  static async deleteLearner(id: number) {
    try {
      const { error } = await supabase
        .from('learners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Also update localStorage as backup
      const localLearners = JSON.parse(localStorage.getItem('learners') || '[]');
      const filtered = localLearners.filter((l: any) => l.id !== id);
      localStorage.setItem('learners', JSON.stringify(filtered));

      return true;
    } catch (error) {
      console.error('Error deleting learner:', error);
      // Fallback to localStorage
      const localLearners = JSON.parse(localStorage.getItem('learners') || '[]');
      const filtered = localLearners.filter((l: any) => l.id !== id);
      localStorage.setItem('learners', JSON.stringify(filtered));
      return true;
    }
  }

  // Courses management
  static async getCourses() {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If no data in Supabase, try to migrate from localStorage
      if (!data || data.length === 0) {
        const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        if (localCourses.length > 0) {
          await this.migrateCourses(localCourses);
          return localCourses;
        }
      }

      return data || [];
    } catch (error) {
      console.error('Error getting courses:', error);
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem('courses') || '[]');
    }
  }

  static async addCourse(course: any) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([course])
        .select()
        .single();

      if (error) throw error;

      // Also update localStorage as backup
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      localCourses.push({ ...course, id: data.id });
      localStorage.setItem('courses', JSON.stringify(localCourses));

      return data;
    } catch (error) {
      console.error('Error adding course:', error);
      // Fallback to localStorage
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const newCourse = { ...course, id: Date.now() };
      localCourses.push(newCourse);
      localStorage.setItem('courses', JSON.stringify(localCourses));
      return newCourse;
    }
  }

  // Survey submissions management
  static async getSurveySubmissions() {
    try {
      const { data, error } = await supabase
        .from('survey_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // If no data in Supabase, try to migrate from localStorage
      if (!data || data.length === 0) {
        const localSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
        if (localSurveys.length > 0) {
          await this.migrateSurveySubmissions(localSurveys);
          return localSurveys;
        }
      }

      return data || [];
    } catch (error) {
      console.error('Error getting survey submissions:', error);
      // Fallback to localStorage
      return JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
    }
  }

  static async addSurveySubmission(submission: any) {
    try {
      const { data, error } = await supabase
        .from('survey_submissions')
        .insert([submission])
        .select()
        .single();

      if (error) throw error;

      // Also update localStorage as backup
      const localSubmissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
      localSubmissions.push({ ...submission, id: data.id });
      localStorage.setItem('surveySubmissions', JSON.stringify(localSubmissions));

      return data;
    } catch (error) {
      console.error('Error adding survey submission:', error);
      // Fallback to localStorage
      const localSubmissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
      const newSubmission = { ...submission, id: Date.now() };
      localSubmissions.push(newSubmission);
      localStorage.setItem('surveySubmissions', JSON.stringify(localSubmissions));
      return newSubmission;
    }
  }

  // Migration helpers
  private static async migrateLearners(localLearners: any[]) {
    try {
      console.log('Migrating learners to Supabase...');
      const { error } = await supabase
        .from('learners')
        .insert(localLearners.map(learner => ({
          name: learner.name,
          email: learner.email,
          status: learner.status,
          department: learner.department,
          mobile: learner.mobile,
          password: learner.password,
          requires_password_change: learner.requiresPasswordChange
        })));

      if (error) {
        console.error('Migration error:', error);
      } else {
        console.log('Learners migrated successfully');
      }
    } catch (error) {
      console.error('Error migrating learners:', error);
    }
  }

  private static async migrateCourses(localCourses: any[]) {
    try {
      console.log('Migrating courses to Supabase...');
      const { error } = await supabase
        .from('courses')
        .insert(localCourses.map(course => ({
          title: course.title,
          description: course.description,
          duration: course.duration,
          max_enrollment: course.maxEnrollment,
          status: course.status,
          module_list: course.moduleList || []
        })));

      if (error) {
        console.error('Migration error:', error);
      } else {
        console.log('Courses migrated successfully');
      }
    } catch (error) {
      console.error('Error migrating courses:', error);
    }
  }

  private static async migrateSurveySubmissions(localSubmissions: any[]) {
    try {
      console.log('Migrating survey submissions to Supabase...');
      const { error } = await supabase
        .from('survey_submissions')
        .insert(localSubmissions.map(submission => ({
          learner_name: submission.learnerName,
          responses: submission.responses,
          status: submission.status
        })));

      if (error) {
        console.error('Migration error:', error);
      } else {
        console.log('Survey submissions migrated successfully');
      }
    } catch (error) {
      console.error('Error migrating survey submissions:', error);
    }
  }
}