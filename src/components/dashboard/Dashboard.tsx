import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { ProgressCard } from './ProgressCard';
import { TaskCreation } from '../tasks/TaskCreation';
import { AITaskCreation } from '../tasks/AITaskCreation';
import { TaskList } from '../tasks/TaskList';
import { TaskCreationButtons } from '../tasks/TaskCreationButtons';
import { DevMenu } from '@/components/admin/DevMenu';

type CreationMode = 'none' | 'manual' | 'ai';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { tasks, profile, isLoading, loadData, handleStartTask, handleCompleteTask } = useDashboardData(user?.id || '');
  const [creationMode, setCreationMode] = useState<CreationMode>('none');

  const handleTaskCreated = () => {
    setCreationMode('none');
    loadData();
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <DashboardHeader onSignOut={signOut} />
        
        {/* Stats Overview */}
        <DashboardStats tasks={tasks} />
        
        {/* Points and Progress */}
        {profile && (
          <ProgressCard profile={profile} tasks={tasks} />
        )}
        
        {/* Task Creation */}
        {creationMode === 'none' ? (
          <TaskCreationButtons 
            onManualCreate={() => setCreationMode('manual')} 
            onAICreate={() => setCreationMode('ai')} 
          />
        ) : creationMode === 'manual' ? (
          <TaskCreation onTaskCreated={handleTaskCreated} />
        ) : (
          <AITaskCreation onComplete={handleTaskCreated} />
        )}
        
        {/* Task List */}
        <TaskList 
          tasks={tasks} 
          onStartTask={handleStartTask} 
          onCompleteTask={handleCompleteTask}
        />

        {/* Developer Menu - Only shown for admin users */}
        {profile?.is_admin && (
          <DevMenu />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
