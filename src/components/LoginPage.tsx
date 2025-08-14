
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import UnboxableLogo from './login/UnboxableLogo';
import RoleIcon from './login/RoleIcon';
import LoginForm from './login/LoginForm';

interface LoginPageProps {
  role: 'learner' | 'admin';
  onLogin: (userData?: any, requiresPasswordChange?: boolean) => void;
  onBack: () => void;
}

const LoginPage = ({ role, onLogin, onBack }: LoginPageProps) => {
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
            
            <UnboxableLogo />
            <RoleIcon role={role} />
            
            <CardTitle className="text-2xl text-unboxable-navy">
              {isLearner ? 'Learner Portal' : 'Admin Portal'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <LoginForm role={role} onLogin={onLogin} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
