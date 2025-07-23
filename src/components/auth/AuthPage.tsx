import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { User, Session } from '@supabase/supabase-js';

interface AuthPageProps {
  onAuthSuccess: (user: User, session: Session) => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        onAuthSuccess(session.user, session);
      }
    };
    
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          onAuthSuccess(session.user, session);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onAuthSuccess]);

  const handleSignUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    return { error };
  };

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = isLogin 
        ? await handleSignIn(email, password)
        : await handleSignUp(email, password);

      if (error) {
        let errorMessage = "An error occurred. Please try again.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes("User already registered")) {
          errorMessage = "This email is already registered. Please sign in instead.";
        } else if (error.message.includes("Password should be at least")) {
          errorMessage = "Password should be at least 6 characters long.";
        } else if (error.message.includes("Unable to validate email address")) {
          errorMessage = "Please enter a valid email address.";
        }

        toast({
          title: isLogin ? "Sign In Error" : "Sign Up Error",
          description: errorMessage,
          variant: "destructive"
        });
      } else if (!isLogin) {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Sign In' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? 'Enter your credentials to access your account'
              : 'Create a new account to get started'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {!isLogin && (
                <p className="text-sm text-muted-foreground">
                  Password should be at least 6 characters long
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;