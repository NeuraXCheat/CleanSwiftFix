
import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Award } from 'lucide-react';
import { UserProfile, Task } from '@/lib/supabase';

interface ProgressCardProps {
  profile: UserProfile;
  tasks: Task[];
}

export function ProgressCard({ profile, tasks }: ProgressCardProps) {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Your Cleaning Progress</h2>
        <div className="flex items-center">
          <Award className="h-5 w-5 text-yellow-500 mr-1" />
          <span className="font-bold">{profile.points} points</span>
        </div>
      </div>
      <ProgressBar 
        value={completedCount} 
        max={Math.max(totalCount, 1)} 
        label="Task Completion" 
        showValue 
        size="md" 
        variant="info"
        animated
      />
    </GlassCard>
  );
}

export default ProgressCard;
