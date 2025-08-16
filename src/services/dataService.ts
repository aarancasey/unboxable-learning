import { supabase } from '@/integrations/supabase/client';

// Data service to handle both Supabase and localStorage with migration control
export class DataService {
  // Migration tracking to prevent automatic restoration of deleted data
  private static getMigrationFlag(key: string): boolean {
    return localStorage.getItem(`migration_completed_${key}`) === 'true';
  }

  private static setMigrationFlag(key: string): void {
    localStorage.setItem(`migration_completed_${key}`, 'true');
  }

  // Learners management
  static async getLearners() {
    try {
      const { data, error } = await supabase
        .from('learners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Always prioritize Supabase data - don't auto-migrate if empty
      // This prevents deleted users from being restored
      return data || [];
    } catch (error) {
      console.error('Error getting learners:', error);
      // Only fallback to localStorage if there's a genuine connection error
      return JSON.parse(localStorage.getItem('learners') || '[]');
    }
  }

  static async addLearner(learner: any) {
    try {
      console.log('Adding learner to Supabase:', learner);
      const { data, error } = await supabase
        .from('learners')
        .insert([learner])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding learner:', error);
        throw error;
      }

      console.log('Successfully added learner to Supabase:', data);
      return data;
    } catch (error) {
      console.error('Error adding learner:', error);
      throw error; // Don't fallback to localStorage for bulk uploads
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

      // Remove from localStorage to prevent restoration
      const localLearners = JSON.parse(localStorage.getItem('learners') || '[]');
      const filtered = localLearners.filter((l: any) => l.id !== id);
      localStorage.setItem('learners', JSON.stringify(filtered));

      // Track deleted users to prevent re-migration
      const deletedUsers = JSON.parse(localStorage.getItem('deleted_learners') || '[]');
      deletedUsers.push({ id, deletedAt: new Date().toISOString() });
      localStorage.setItem('deleted_learners', JSON.stringify(deletedUsers));

      return true;
    } catch (error) {
      console.error('Error deleting learner:', error);
      // Fallback to localStorage
      const localLearners = JSON.parse(localStorage.getItem('learners') || '[]');
      const filtered = localLearners.filter((l: any) => l.id !== id);
      localStorage.setItem('learners', JSON.stringify(filtered));
      
      // Track deletion even in fallback
      const deletedUsers = JSON.parse(localStorage.getItem('deleted_learners') || '[]');
      deletedUsers.push({ id, deletedAt: new Date().toISOString() });
      localStorage.setItem('deleted_learners', JSON.stringify(deletedUsers));
      
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

      // Always prioritize Supabase data - don't auto-migrate if empty
      // This prevents deleted courses from being restored

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
      localCourses.push({ ...course, id: data.id, logoUrl: course.logo_url });
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

  static async updateCourse(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle(); // Use maybeSingle instead of single

      if (error) throw error;

      // Also update localStorage as backup if we got data back
      if (data) {
        const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        const index = localCourses.findIndex((c: any) => c.id === id);
        if (index !== -1) {
          localCourses[index] = { ...localCourses[index], ...updates };
          localStorage.setItem('courses', JSON.stringify(localCourses));
        }
      }

      return data;
    } catch (error) {
      console.error('Error updating course:', error);
      // Fallback to localStorage
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const index = localCourses.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        localCourses[index] = { ...localCourses[index], ...updates };
        localStorage.setItem('courses', JSON.stringify(localCourses));
        return localCourses[index];
      }
      throw error; // Re-throw if no fallback possible
    }
  }

  static async deleteCourse(id: number) {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Also update localStorage as backup
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const filtered = localCourses.filter((c: any) => c.id !== id);
      localStorage.setItem('courses', JSON.stringify(filtered));

      return true;
    } catch (error) {
      console.error('Error deleting course:', error);
      // Fallback to localStorage
      const localCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const filtered = localCourses.filter((c: any) => c.id !== id);
      localStorage.setItem('courses', JSON.stringify(filtered));
      return true;
    }
  }

  // Survey submissions management with validation
  static async getSurveySubmissions() {
    try {
      console.log('Attempting to fetch survey submissions from Supabase...');
      const { data, error } = await supabase
        .from('survey_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('CRITICAL: Supabase error when fetching survey submissions:', error);
        throw error;
      }

      if (!data) {
        console.warn('No survey submissions found in database');
        return [];
      }

      console.log(`SUCCESS: Fetched ${data.length} survey submissions from database`);
      
      // Validate data integrity
      const validSubmissions = data.filter(submission => {
        if (!submission.id || !submission.learner_name || !submission.responses) {
          console.warn('Invalid submission found:', submission);
          return false;
        }
        return true;
      });

      if (validSubmissions.length !== data.length) {
        console.warn(`Data integrity issue: ${data.length - validSubmissions.length} invalid submissions found`);
      }

      return validSubmissions;
    } catch (error) {
      console.error('CRITICAL: Error getting survey submissions from database:', error);
      // Fallback to localStorage
      const localData = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
      console.log(`Falling back to localStorage: ${localData.length} submissions found`);
      return localData;
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

  static async updateSurveySubmission(id: number, updates: any) {
    try {
      const { data, error } = await supabase
        .from('survey_submissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Also update localStorage as backup
      const localSubmissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
      const updatedSubmissions = localSubmissions.map((submission: any) => 
        submission.id === id ? { ...submission, ...updates } : submission
      );
      localStorage.setItem('surveySubmissions', JSON.stringify(updatedSubmissions));

      return data;
    } catch (error) {
      console.error('Error updating survey submission:', error);
      // Fallback to localStorage
      const localSubmissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
      const updatedSubmissions = localSubmissions.map((submission: any) => 
        submission.id === id ? { ...submission, ...updates } : submission
      );
      localStorage.setItem('surveySubmissions', JSON.stringify(updatedSubmissions));
      return updatedSubmissions.find((s: any) => s.id === id);
    }
  }

  static async deleteSurveySubmission(id: number) {
    try {
      const { error } = await supabase
        .from('survey_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Also update localStorage as backup
      const localSubmissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
      const updatedSubmissions = localSubmissions.filter((submission: any) => submission.id !== id);
      localStorage.setItem('surveySubmissions', JSON.stringify(updatedSubmissions));

      return true;
    } catch (error) {
      console.error('Error deleting survey submission:', error);
      // Fallback to localStorage
      const localSubmissions = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
      const updatedSubmissions = localSubmissions.filter((submission: any) => submission.id !== id);
      localStorage.setItem('surveySubmissions', JSON.stringify(updatedSubmissions));
      return true;
    }
  }

  // Manual migration methods for admin use only
  static async manualMigrateLearners() {
    const localLearners = JSON.parse(localStorage.getItem('learners') || '[]');
    const deletedUsers = JSON.parse(localStorage.getItem('deleted_learners') || '[]');
    const deletedIds = deletedUsers.map((u: any) => u.id);
    
    // Filter out deleted users before migration
    const validLearners = localLearners.filter((l: any) => !deletedIds.includes(l.id));
    
    if (validLearners.length > 0) {
      await this.migrateLearners(validLearners);
      this.setMigrationFlag('learners');
      return { migrated: validLearners.length, skipped: localLearners.length - validLearners.length };
    }
    return { migrated: 0, skipped: 0 };
  }

  private static async migrateLearners(localLearners: any[]) {
    try {
      console.log('Migrating learners to Supabase...');
      const { error } = await supabase
        .from('learners')
        .insert(localLearners.map(learner => ({
          name: learner.name,
          email: learner.email,
          status: learner.status,
          team: learner.department || learner.team,  // Handle both old and new field names
          role: learner.mobile || learner.role,       // Handle both old and new field names
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

  // Survey status methods
  static async getSurveyStatusForLearners(learners: any[]) {
    try {
      const submissions = await this.getSurveySubmissions();
      const { data: progressData } = await supabase
        .from('survey_progress')
        .select('*');

      return learners.map(learner => {
        // Check for completed submission
        const submission = submissions.find(sub => 
          sub.learner_id === learner.id ||
          sub.learner_name === learner.name ||
          sub.learner_name === learner.email
        );

        if (submission) {
          return {
            ...learner,
            surveyStatus: 'completed',
            surveySubmission: submission,
            lastSurveyActivity: submission.submitted_at
          };
        }

        // Check for in-progress survey
        const progress = progressData?.find(p => {
          const participantInfo = p.participant_info as any;
          return participantInfo?.email === learner.email ||
                 participantInfo?.name === learner.name;
        });

        if (progress) {
          return {
            ...learner,
            surveyStatus: 'in_progress',
            surveyProgress: progress,
            lastSurveyActivity: progress.updated_at
          };
        }

        return {
          ...learner,
          surveyStatus: 'not_started',
          lastSurveyActivity: null
        };
      });
    } catch (error) {
      console.error('Error getting survey status for learners:', error);
      return learners.map(learner => ({
        ...learner,
        surveyStatus: 'not_started',
        lastSurveyActivity: null
      }));
    }
  }

  static async sendSurveyReminder(learnerEmail: string, learnerName: string) {
    try {
      const { error } = await supabase.functions.invoke('send-password-reminder', {
        body: {
          email: learnerEmail,
          name: learnerName,
          type: 'survey_reminder'
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error sending survey reminder:', error);
      throw error;
    }
  }

  // Recent Activities
  static async getRecentActivities(days: number = 14) {
    try {
      const activities = [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Get recent learner registrations
      const learners = await this.getLearners();
      const recentLearners = learners.filter(learner => 
        new Date(learner.created_at || learner.createdAt || Date.now()) >= cutoffDate
      );

      // Get recent survey submissions
      const surveys = await this.getSurveySubmissions();
      const recentSurveys = surveys.filter(survey => 
        new Date(survey.submitted_at || survey.submittedAt || Date.now()) >= cutoffDate
      );

      // Get recent course schedules from Supabase
      const { data: courseSchedules } = await supabase
        .from('course_schedules')
        .select('*')
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });

      // Format learner activities
      recentLearners.forEach(learner => {
        activities.push({
          id: `learner-${learner.id}`,
          type: 'learner_registration',
          message: `New learner registered: ${learner.name}`,
          timestamp: learner.created_at || learner.createdAt || new Date().toISOString(),
          icon: 'user-plus',
          participant: learner.name
        });
      });

      // Format survey activities
      recentSurveys.forEach(survey => {
        activities.push({
          id: `survey-${survey.id}`,
          type: 'survey_submission',
          message: `Survey completed by ${survey.learner_name || survey.learnerName}`,
          timestamp: survey.submitted_at || survey.submittedAt || new Date().toISOString(),
          icon: 'file-text',
          participant: survey.learner_name || survey.learnerName
        });
      });

      // Format course schedule activities
      if (courseSchedules) {
        courseSchedules.forEach(schedule => {
          activities.push({
            id: `course-${schedule.id}`,
            type: 'course_scheduled',
            message: `Course scheduled: ${schedule.course_name}`,
            timestamp: schedule.created_at,
            icon: 'calendar',
            participant: schedule.instructor || 'System'
          });
        });
      }

      // Sort by timestamp, most recent first
      return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  // Upcoming Tasks
  static async getUpcomingTasks() {
    try {
      const tasks = [];
      const now = new Date();

      // Get pending survey reviews
      const surveys = await this.getSurveySubmissions();
      const pendingSurveys = surveys.filter(survey => survey.status === 'pending');

      // Get upcoming course schedules
      const { data: upcomingCourses } = await supabase
        .from('course_schedules')
        .select('*')
        .gte('start_date', now.toISOString().split('T')[0])
        .lt('start_date', new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('start_date', { ascending: true });

      // Get learners requiring password changes
      const learners = await this.getLearners();
      const passwordChanges = learners.filter(learner => learner.requires_password_change || learner.requiresPasswordChange);

      // Format pending survey tasks
      pendingSurveys.forEach(survey => {
        const daysOld = Math.floor((now.getTime() - new Date(survey.submitted_at || survey.submittedAt).getTime()) / (1000 * 60 * 60 * 24));
        tasks.push({
          id: `review-${survey.id}`,
          task: `Review survey: ${survey.learner_name || survey.learnerName}`,
          due: `${daysOld} days ago`,
          priority: daysOld > 7 ? 'high' : daysOld > 3 ? 'medium' : 'low',
          type: 'survey_review',
          dueDate: survey.submitted_at || survey.submittedAt
        });
      });

      // Format upcoming course tasks
      if (upcomingCourses) {
        upcomingCourses.forEach(course => {
          const daysUntil = Math.ceil((new Date(course.start_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          tasks.push({
            id: `course-${course.id}`,
            task: `Course starting: ${course.course_name}`,
            due: daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`,
            priority: daysUntil <= 3 ? 'high' : daysUntil <= 7 ? 'medium' : 'low',
            type: 'course_start',
            dueDate: course.start_date
          });
        });
      }

      // Format password change tasks
      passwordChanges.forEach(learner => {
        tasks.push({
          id: `password-${learner.id}`,
          task: `Password change required: ${learner.name}`,
          due: 'Overdue',
          priority: 'high',
          type: 'password_change',
          dueDate: learner.created_at || learner.createdAt,
          learnerEmail: learner.email,
          learnerName: learner.name,
          learnerId: learner.id
        });
      });

      // Sort by priority and due date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return tasks.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }).slice(0, 8);
    } catch (error) {
      console.error('Error getting upcoming tasks:', error);
      return [];
    }
  }
}