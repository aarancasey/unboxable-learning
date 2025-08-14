import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UnboxableLogo from './login/UnboxableLogo';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface PasswordCreationPageProps {
  learnerData: any;
  onPasswordCreated: (learnerData: any) => void;
  onBack: () => void;
}

const PasswordCreationPage = ({ learnerData, onPasswordCreated, onBack }: PasswordCreationPageProps) => {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isPasswordStrong = (password: string) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[0-9]/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordStrong(passwords.newPassword)) {
      toast({
        title: "Password Requirements Not Met",
        description: "Please ensure your password meets all the requirements below",
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the learner's password and clear the requires_password_change flag
      const { data, error } = await supabase.rpc('update_learner_password', {
        learner_id_input: learnerData.id,
        new_password_input: passwords.newPassword
      });

      if (error) {
        console.error('Error updating password:', error);
        toast({
          title: "Password Update Failed",
          description: "Unable to update your password. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password Created Successfully",
        description: "Welcome to your learning portal!",
      });

      // Update learner data to reflect password change completion
      const updatedLearnerData = {
        ...learnerData,
        requires_password_change: false
      };

      onPasswordCreated(updatedLearnerData);
    } catch (error) {
      console.error('Password update error:', error);
      toast({
        title: "Password Update Error",
        description: "An error occurred while updating your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <UnboxableLogo />
            <CardTitle className="text-2xl text-unboxable-navy">
              Set Your Password
            </CardTitle>
            <p className="text-sm text-gray-600">
              Welcome, {learnerData.name}! For security, please create your password to continue.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-unboxable-navy">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter your new password"
                    className="border-slate-300 focus:border-unboxable-navy focus:ring-unboxable-navy pr-10"
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-unboxable-navy">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your new password"
                    className="border-slate-300 focus:border-unboxable-navy focus:ring-unboxable-navy pr-10"
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {passwords.newPassword && (
                <PasswordStrengthIndicator password={passwords.newPassword} />
              )}

              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-unboxable-navy hover:bg-unboxable-navy/90 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Password...' : 'Create Password & Continue'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onBack}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PasswordCreationPage;