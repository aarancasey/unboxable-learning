
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LoginFormProps {
  role: 'learner' | 'admin';
  onLogin: (userData?: any) => void;
}

const LoginForm = ({ role, onLogin }: LoginFormProps) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'admin') {
      // Secure admin authentication
      if (!credentials.email || !credentials.password) {
        toast({
          title: "Credentials Required",
          description: "Please enter both email and password",
          variant: "destructive",
        });
        return;
      }

      try {
        const { data: isValidAdmin, error } = await supabase.rpc('authenticate_admin', {
          email_input: credentials.email.toLowerCase(),
          password_input: credentials.password
        });

        if (error) {
          console.error('Admin authentication error:', error);
          toast({
            title: "Authentication Error",
            description: "Unable to verify admin credentials. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (!isValidAdmin) {
          toast({
            title: "Invalid Credentials",
            description: "Please check your email and password",
            variant: "destructive",
          });
          return;
        }

        onLogin();
        return;
      } catch (error) {
        console.error('Admin login error:', error);
        toast({
          title: "Login Error",
          description: "An error occurred during admin login. Please try again.",
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

    try {
      console.log('Attempting to authenticate learner:', credentials.email);
      
      // Use the secure authentication function with password verification
      const { data: learnerData, error } = await supabase.rpc('authenticate_learner', {
        email_input: credentials.email.toLowerCase(),
        password_input: credentials.password || null
      });
      
      if (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Authentication Error",
          description: "Unable to verify credentials. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      if (!learnerData || learnerData.length === 0) {
        toast({
          title: "Learner Not Found",
          description: "No learner found with this email address",
          variant: "destructive",
        });
        return;
      }
      
      const learner = learnerData[0];
      console.log('Found learner:', learner);

      // Check if password validation failed for returning users
      if (!learner.password_valid && !learner.requires_password_change) {
        toast({
          title: "Invalid Password",
          description: "The password you entered is incorrect",
          variant: "destructive",
        });
        return;
      }

      // For returning users without password, require password
      if (!learner.requires_password_change && !credentials.password) {
        toast({
          title: "Password Required",
          description: "Please enter your password",
          variant: "destructive",
        });
        return;
      }

      // If learner is pending, activate them on first login
      if (learner.status === 'pending') {
        try {
          const { DataService } = await import('@/services/dataService');
          await DataService.updateLearner(learner.id, { 
            status: 'active',
            requires_password_change: true 
          });
          learner.status = 'active';
          learner.requires_password_change = true;
        } catch (error) {
          console.error('Error activating learner:', error);
          toast({
            title: "Activation Error",
            description: "Unable to activate account. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // Successful login
      onLogin(learner);
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLearner = role === 'learner';

  return (
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

      {/* Show password field for learners - simplified since we handle logic in submit */}
      {isLearner && (
        <div>
          <Label htmlFor="password" className="text-unboxable-navy">Password (if not first time login)</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            className="border-slate-300 focus:border-unboxable-navy focus:ring-unboxable-navy"
          />
          <p className="text-sm text-gray-600 mt-1">Leave blank for first-time login</p>
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
  );
};

export default LoginForm;
