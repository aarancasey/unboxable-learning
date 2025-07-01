import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, GraduationCap, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginPageProps {
  role: 'learner' | 'admin';
  onLogin: (userData?: any) => void;
  onBack: () => void;
}

const LoginPage = ({ role, onLogin, onBack }: LoginPageProps) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'admin') {
      // Check admin credentials
      if (credentials.email === 'fiona@unboxable.co.nz' && credentials.password === 'Netball1974#') {
        onLogin();
        return;
      } else {
        toast({
          title: "Invalid Credentials",
          description: "Please check your email and password",
          variant: "destructive",
        });
        return;
      }
    }

    // Learner authentication
    if (!credentials.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Get learners from localStorage
    const storedLearners = localStorage.getItem('learners');
    const learners = storedLearners ? JSON.parse(storedLearners) : [];
    
    // Find learner by email
    const learner = learners.find((l: any) => l.email.toLowerCase() === credentials.email.toLowerCase());
    
    if (!learner) {
      toast({
        title: "Learner Not Found",
        description: "No learner found with this email address",
        variant: "destructive",
      });
      return;
    }

    // Check if learner requires password change (first time login)
    if (learner.requiresPasswordChange) {
      // For first-time login, just email is enough
      onLogin(learner);
      return;
    }

    // For returning users, check password
    if (!credentials.password) {
      toast({
        title: "Password Required",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    if (credentials.password !== learner.password) {
      toast({
        title: "Invalid Password",
        description: "The password you entered is incorrect",
        variant: "destructive",
      });
      return;
    }

    // Successful login
    onLogin(learner);
  };

  const isLearner = role === 'learner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="self-start hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {/* Unboxable Logo */}
            <div className="mx-auto mb-4">
              <img 
                src="/lovable-uploads/d0544c04-760a-4cf9-824c-612e5ef4aeaa.png" 
                alt="Unboxable" 
                className="h-16 mx-auto mb-2"
              />
              <p className="text-sm text-unboxable-navy font-medium">RETHINKING BUSINESS</p>
            </div>
            
            {isLearner ? (
              <GraduationCap className="mx-auto h-12 w-12 text-unboxable-navy" />
            ) : (
              <Users className="mx-auto h-12 w-12 text-unboxable-orange" />
            )}
            
            <CardTitle className="text-2xl text-unboxable-navy">
              {isLearner ? 'Learner Portal' : 'Admin Portal'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-unboxable-navy">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="border-slate-300 focus:border-unboxable-navy focus:ring-unboxable-navy"
                  required
                />
              </div>
              
              {/* Only show password field for admin or returning learners */}
              {!isLearner && (
                <div>
                  <Label htmlFor="password" className="text-unboxable-navy">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="border-slate-300 focus:border-unboxable-navy focus:ring-unboxable-navy"
                    required
                  />
                </div>
              )}

              {/* Show password field for learners who don't require password change */}
              {isLearner && credentials.email && (() => {
                const storedLearners = localStorage.getItem('learners');
                const learners = storedLearners ? JSON.parse(storedLearners) : [];
                const learner = learners.find((l: any) => l.email.toLowerCase() === credentials.email.toLowerCase());
                return learner && !learner.requiresPasswordChange;
              })() && (
                <div>
                  <Label htmlFor="password" className="text-unboxable-navy">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="border-slate-300 focus:border-unboxable-navy focus:ring-unboxable-navy"
                    required
                  />
                </div>
              )}

              {!isLearner && (
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border">
                  <strong className="text-unboxable-navy">Demo credentials:</strong><br />
                  Email: fiona@unboxable.co.nz<br />
                  Password: Netball1974#
                </div>
              )}
              
              <Button 
                type="submit" 
                className={`w-full text-white ${isLearner 
                  ? 'bg-unboxable-navy hover:bg-unboxable-navy/90' 
                  : 'bg-unboxable-orange hover:bg-unboxable-orange/90'
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
