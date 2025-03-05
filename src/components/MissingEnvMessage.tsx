
import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { AlertTriangle } from 'lucide-react';

export function MissingEnvMessage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <GlassCard className="p-8 max-w-md">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-amber-500" />
          <h1 className="text-2xl font-bold">Supabase Configuration Required</h1>
          <p className="text-gray-600">
            Please set up your Supabase environment variables to continue. The following 
            environment variables need to be configured:
          </p>
          
          <div className="bg-gray-50 p-4 rounded-md w-full font-mono text-sm text-left">
            <div className="mb-2">VITE_SUPABASE_URL=https://your-project.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=your-anon-key</div>
          </div>
          
          <p className="text-gray-600 text-sm">
            Get these values from your Supabase project settings. After setting these variables,
            restart the application.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

export default MissingEnvMessage;
