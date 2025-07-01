
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Users, 
  Clock,
  Settings,
  Eye,
  PlayCircle,
  FileText
} from 'lucide-react';

const CourseManagement = () => {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);

  // Load courses based on survey data
  useEffect(() => {
    const savedSurveys = JSON.parse(localStorage.getItem('surveySubmissions') || '[]');
    
    // Create a course based on survey data if surveys exist
    if (savedSurveys.length > 0) {
      const newCourse = {
        id: 1,
        title: "Module 2: Advanced Customer Service Skills",
        description: "Building on Module 1 foundations, develop advanced customer service techniques and conflict resolution skills",
        modules: 6,
        enrolledUsers: savedSurveys.length,
        completionRate: 0,
        status: "active",
        createdDate: new Date().toISOString().split('T')[0],
        estimatedDuration: "3 weeks",
        moduleList: [
          { id: 1, title: "Advanced Communication Techniques", type: "video", duration: "25 min", status: "active" },
          { id: 2, title: "Handling Difficult Customers", type: "interactive", duration: "30 min", status: "active" },
          { id: 3, title: "Conflict Resolution Strategies", type: "document", duration: "20 min", status: "active" },
          { id: 4, title: "Building Customer Loyalty", type: "video", duration: "22 min", status: "scheduled" },
          { id: 5, title: "Service Recovery Techniques", type: "interactive", duration: "35 min", status: "draft" },
          { id: 6, title: "Team Collaboration in Service", type: "video", duration: "28 min", status: "draft" },
        ]
      };
      setCourses([newCourse]);
    } else {
      setCourses([]);
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case 'interactive':
        return <Settings className="h-4 w-4 text-green-600" />;
      case 'document':
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  if (selectedCourse) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => setSelectedCourse(null)} className="mb-2">
              ← Back to Courses
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
            <p className="text-gray-600">{selectedCourse.description}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Settings className="h-4 w-4 mr-2" />
              Course Settings
            </Button>
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Modules</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCourse.modules}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Enrolled Users</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCourse.enrolledUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCourse.completionRate}%</p>
                </div>
                <div className="w-12 h-12 relative">
                  <Progress value={selectedCourse.completionRate} className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCourse.estimatedDuration}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules List */}
        <Card>
          <CardHeader>
            <CardTitle>Course Modules</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {selectedCourse.moduleList.map((module: any, index: number) => (
                <div key={module.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getModuleIcon(module.type)}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{module.title}</h4>
                          <p className="text-sm text-gray-500">{module.duration} • {module.type}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(module.status)}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-600">Create and manage learning courses and modules</p>
        </div>
        
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Courses Grid or Empty State */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCourse(course)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  </div>
                  {getStatusBadge(course.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span>{course.modules} modules</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{course.enrolledUsers} enrolled</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{course.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Created {course.createdDate}</span>
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-medium">{course.completionRate}%</span>
                    </div>
                    <Progress value={course.completionRate} />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
            <p className="text-gray-600 mb-6">Courses will be automatically created based on survey submissions.</p>
            <p className="text-sm text-gray-500">Complete Module 1 surveys to unlock Module 2 content.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseManagement;
