import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, getTasks, updateTask } from '@/lib/supabase';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskCreationButtons } from '@/components/tasks/TaskCreationButtons';
import { TaskCreation } from '@/components/tasks/TaskCreation';
import { AITaskCreation } from '@/components/tasks/AITaskCreation';
import { DevMenu } from '@/components/DevMenu';
import { useAuth } from '@/hooks/useAuth';

type CreationMode = 'none' | 'manual' | 'ai';

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creationMode, setCreationMode] = useState<CreationMode>('none');
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    
    try {
      const fetchedTasks = await getTasks(user.id);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTask = async (task: Task) => {
    try {
      await updateTask(task.id, { status: 'in_progress' });
      navigate(`/focus/${task.id}`);
    } catch (error) {
      console.error('Error starting task:', error);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      await updateTask(task.id, { 
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      await loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleTaskCreated = () => {
    setCreationMode('none');
    loadTasks();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-6">Your Tasks</h1>
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
        </div>

        <TaskList
          tasks={tasks}
          onStartTask={handleStartTask}
          onCompleteTask={handleCompleteTask}
        />

        {profile?.is_admin && <DevMenu />}
      </div>
    </div>
  );
}

export default Dashboard; 