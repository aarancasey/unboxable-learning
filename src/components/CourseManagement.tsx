
import { useState } from 'react';
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

  const mockCourses = [
    {
      id: 1,
      title: "New Employee Onboarding",
      description: "Comprehensive onboarding program for new hires",
      modules: 8,
      enrolledUsers: 15,
      completionRate: 78,
      status: "active",
      createdDate: "2024-01-01",
      estimatedDuration: "3 weeks",
      moduleList: [
        { id: 1, title: "Welcome & Company Overview", type: "video", duration: "15 min", status: "active" },
        { id: 2, title: "Company Culture & Values", type: "interactive", duration: "20 min", status: "active" },
        { id: 3, title: "HR Policies & Procedures", type: "document", duration: "30 min", status: "active" },
        { id: 4, title: "Team Introductions", type: "video", duration: "25 min", status: "scheduled" },
      ]
    },
    {
      id: 2,
      title: "Leadership Development",
      description: "Advanced leadership skills for managers and senior staff",
      modules: 12,
      enrolledUsers: 8,
      completionRate: 65,
      status: "active",
      createdDate: "2024-01-05",
      estimatedDuration: "6 weeks",
      moduleList: [
        { id: 1, title: "Leadership Fundamentals", type: "video", duration: "45 min", status: "active" },
        { id: 2, title: "Communication Strategies", type: "interactive", duration: "30 min", status: "active" },
        { id: 3, title: "Team Building Exercises", type: "interactive", duration: "60 min", status: "draft" },
      ]
    },
    {
      id: 3,
      title: "Sales Training Bootcamp",
      description: "Intensive sales methodology and customer relationship training",
      modules: 6,
      enrolledUsers: 22,
      completionRate: 92,
      status: "completed",
      createdDate: "2023-12-15",
      estimatedDuration: "4 weeks",
      moduleList: [
        { id: 1, title: "Sales Fundamentals", type: "video", duration: "40 min", status: "active" },
        { id: 2, title: "Customer Discovery", type: "interactive", duration: "35 min", status: "active" },
      ]
    }
  ];

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

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map((course) => (
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
    </div>
  );
};

export default CourseManagement;
