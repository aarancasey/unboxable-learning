
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, GraduationCap, Users } from 'lucide-react';

interface LoginPageProps {
  role: 'learner' | 'admin';
  onLogin: () => void;
  onBack: () => void;
}

const LoginPage = ({ role, onLogin, onBack }: LoginPageProps) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - in real app, this would validate against authService
    onLogin();
  };

  const isLearner = role === 'learner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="self-start"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {isLearner ? (
              <GraduationCap className="mx-auto h-16 w-16 text-blue-600" />
            ) : (
              <Users className="mx-auto h-16 w-16 text-purple-600" />
            )}
            
            <CardTitle className="text-2xl">
              {isLearner ? 'Learner Login' : 'Admin Login'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              {isLearner && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <strong>Demo credentials:</strong><br />
                  Email: learner@demo.com<br />
                  Password: demo123
                </div>
              )}

              {!isLearner && (
                <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                  <strong>Demo credentials:</strong><br />
                  Email: admin@demo.com<br />
                  Password: admin123
                </div>
              )}
              
              <Button 
                type="submit" 
                className={`w-full ${isLearner 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                }`}
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
