
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type AuthMode = 'signin' | 'signup';

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Signed in successfully!');
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast.success('Account created! Please check your email for verification.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[600px] py-12 px-4 sm:px-6 lg:px-8">
      <GlassCard className="w-full max-w-md p-8 space-y-8 animate-slideUp">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'signin' 
              ? "Enter your details to access your cleaning dashboard" 
              : "Sign up to start organizing your cleaning tasks"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <AnimatedButton
              loading={isLoading}
              className="w-full"
              variant="highlight"
              type="submit"
              animation="scale"
            >
              {mode === 'signin' ? 'Sign in' : 'Sign up'}
            </AnimatedButton>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm font-medium text-highlight hover:text-highlight/90 focus:outline-none focus:underline transition-colors"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

export default AuthForm;
