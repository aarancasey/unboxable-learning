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

  // Load courses from localStorage on component mount
  useEffect(() => {
    const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const savedSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
    
    // If no saved courses, create a default course with survey
    if (savedCourses.length === 0) {
      const defaultCourse = {
        id: 1,
        title: "Leadership Development Course",
        description: "Complete the pre-course assessment and unlock learning modules",
        modules: 5,
        maxEnrollment: 20,
        enrolledUsers: Math.min(savedSurveys.length, 20),
        completionRate: 0,
        status: "active",
        createdDate: new Date().toISOString().split('T')[0],
        estimatedDuration: "4 weeks",
        moduleList: [
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
      const coursesToSet = [defaultCourse];
      setCourses(coursesToSet);
      localStorage.setItem('courses', JSON.stringify(coursesToSet));
    } else {
      setCourses(savedCourses);
    }
  }, []);

  const handleSaveCourse = (courseData: any) => {
    const newCourses = [...courses, courseData];
    setCourses(newCourses);
    localStorage.setItem('courses', JSON.stringify(newCourses));
    console.log('Course saved and persisted:', courseData);
  };

  if (selectedCourse) {
    return (
      <CourseDetailView
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <CourseHeader onCreateCourse={() => setShowCreateForm(true)} />

        {/* Courses Grid or Empty State */}
        {courses.length > 0 ? (
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
