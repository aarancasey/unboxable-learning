import { useState, useEffect } from 'react';
import { CourseCreationForm } from './CourseCreationForm';
import { CourseHeader } from './course/CourseHeader';
import { CourseCard } from './course/CourseCard';
import { EmptyCoursesState } from './course/EmptyCoursesState';
import { CourseDetailView } from './course/CourseDetailView';

const CourseManagement = () => {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load courses from DataService (Supabase) on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { DataService } = await import('@/services/dataService');
      const coursesData = await DataService.getCourses();
      
      // If no courses in database, create a default course
      if (coursesData.length === 0) {
        const defaultCourse = {
          title: "Leadership Development Course",
          description: "Complete the pre-course assessment and unlock learning modules",
          duration: "4 weeks",
          max_enrollment: 20,
          status: "active",
          module_list: [
            { 
              id: '1', 
              title: 'Leadership Sentiment, Adaptive and Agile Self-Assessment', 
              type: 'survey', 
              duration: '45 min',
              description: 'Comprehensive leadership self-assessment covering sentiment, purpose, and agility',
              status: "active" 
            },
            { id: 2, title: "Advanced Communication Techniques", type: "video", duration: "25 min", status: "active" },
            { id: 3, title: "Handling Difficult Customers", type: "interactive", duration: "30 min", status: "active" },
            { id: 4, title: "Service Excellence & Team Collaboration", type: "document", duration: "20 min", status: "active" },
            { id: 5, title: "Customer Feedback & Continuous Improvement", type: "video", duration: "22 min", status: "active" },
          ]
        };
        
        const newCourse = await DataService.addCourse(defaultCourse);
        setCourses([newCourse]);
      } else {
        setCourses(coursesData);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async (courseData: any) => {
    try {
      const { DataService } = await import('@/services/dataService');
      await DataService.addCourse(courseData);
      // Reload courses to get updated data
      await loadCourses();
      console.log('Course saved to database:', courseData);
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleCourseUpdate = async () => {
    // Reload courses after update
    await loadCourses();
  };

  if (selectedCourse) {
    return (
      <CourseDetailView
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
        onCourseUpdate={handleCourseUpdate}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <CourseHeader onCreateCourse={() => setShowCreateForm(true)} />

        {/* Courses Grid or Empty State */}
        {loading ? (
          <div className="text-center py-8">Loading courses...</div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={setSelectedCourse}
              />
            ))}
          </div>
        ) : (
          <EmptyCoursesState onCreateCourse={() => setShowCreateForm(true)} />
        )}
      </div>

      {/* Course Creation Form */}
      <CourseCreationForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSave={handleSaveCourse}
      />
    </>
  );
};

export default CourseManagement;
