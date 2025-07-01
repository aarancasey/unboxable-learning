
import { useState } from 'react';
import LearnerDashboard from '@/components/LearnerDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import LoginPage from '@/components/LoginPage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users } from 'lucide-react';

const Index = () => {
  const [userRole, setUserRole] = useState<'learner' | 'admin' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleRoleSelect = (role: 'learner' | 'admin') => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return userRole ? (
      <LoginPage role={userRole} onLogin={() => setIsAuthenticated(true)} onBack={() => setUserRole(null)} />
    ) : (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img 
              src="/lovable-uploads/d0544c04-760a-4cf9-824c-612e5ef4aeaa.png" 
              alt="Unboxable" 
              className="h-16 mx-auto mb-4"
            />
            <p className="text-sm text-unboxable-navy font-medium mb-4">RETHINKING BUSINESS</p>
            <h1 className="text-3xl font-bold text-unboxable-navy mb-2">Learning Portal</h1>
            <p className="text-gray-600">Choose your role to continue</p>
          </div>
          
          <div className="space-y-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 hover:border-unboxable-navy/30" onClick={() => handleRoleSelect('learner')}>
              <CardContent className="p-6 text-center">
                <GraduationCap className="mx-auto h-12 w-12 text-unboxable-navy mb-3" />
                <h3 className="text-xl font-semibold mb-2 text-unboxable-navy">Learner Access</h3>
                <p className="text-gray-600 mb-4">Access your courses and complete surveys</p>
                <Button className="w-full bg-unboxable-navy hover:bg-unboxable-navy/90 text-white">
                  Enter as Learner
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 hover:border-unboxable-orange/30" onClick={() => handleRoleSelect('admin')}>
              <CardContent className="p-6 text-center">
                <Users className="mx-auto h-12 w-12 text-unboxable-orange mb-3" />
                <h3 className="text-xl font-semibold mb-2 text-unboxable-navy">Admin Portal</h3>
                <p className="text-gray-600 mb-4">Manage learners, courses, and progress</p>
                <Button className="w-full bg-unboxable-orange hover:bg-unboxable-orange/90 text-white">
                  Enter as Admin
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userRole === 'learner' ? (
        <LearnerDashboard onLogout={handleLogout} />
      ) : (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Index;
