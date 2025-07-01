
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

  // Load courses based on survey data
  useEffect(() => {
    const savedSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
    
    // Create a course based on survey data if surveys exist
    if (savedSurveys.length > 0) {
      const newCourse = {
        id: 1,
        title: "Module 2: Advanced Customer Service Skills",
        description: "Building on Module 1 foundations, develop advanced customer service techniques and conflict resolution skills",
        modules: 4,
        maxEnrollment: 17,
        enrolledUsers: Math.min(savedSurveys.length, 17),
        completionRate: 0,
        status: "active",
        createdDate: new Date().toISOString().split('T')[0],
        estimatedDuration: "4 weeks",
        moduleList: [
          { id: 1, title: "Leadership Sentiment, Adaptive and Agile Self-Assessment", type: "survey", duration: "45 min", status: "active" },
          { id: 2, title: "Advanced Communication Techniques", type: "video", duration: "25 min", status: "active" },
          { id: 3, title: "Handling Difficult Customers", type: "interactive", duration: "30 min", status: "active" },
          { id: 4, title: "Service Excellence & Team Collaboration", type: "document", duration: "20 min", status: "active" },
        ]
      };
      setCourses([newCourse]);
    } else {
      setCourses([]);
    }
  }, []);

  const handleSaveCourse = (courseData: any) => {
    setCourses(prev => [...prev, courseData]);
    console.log('Course saved:', courseData);
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
