
import { useState, useEffect } from 'react';
import { getTasks, updateTask, Task, getProfile, UserProfile, supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Award } from 'lucide-react';

export function useDashboardData(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tasksData, profileData] = await Promise.all([
        getTasks(userId),
        getProfile(userId)
      ]);
      
      setTasks(tasksData);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load your data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTask = async (task: Task) => {
    try {
      const updatedTask = await updateTask(task.id, { 
        status: 'in_progress'
      });
      
      if (updatedTask) {
        setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
        toast.success(`Started task: ${task.title}`);
      }
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error('Failed to start task');
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      const now = new Date().toISOString();
      const updatedTask = await updateTask(task.id, { 
        status: 'completed',
        completed_at: now
      });
      
      if (updatedTask) {
        setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
        toast.success(`Completed task: ${task.title}`);
        
        // Award points if applicable
        if (profile && task.estimated_minutes) {
          const pointsToAdd = Math.max(10, task.estimated_minutes);
          await updateProfile(profile.id, { points: profile.points + pointsToAdd });
          toast('Points earned!', {
            description: `+${pointsToAdd} points for completing this task`,
            icon: <Award className="h-5 w-5 text-yellow-500" />
          });
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const updateProfile = async (id: string, updates: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  };

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  return {
    tasks,
    profile,
    isLoading,
    loadData,
    handleStartTask,
    handleCompleteTask
  };
}

export default useDashboardData;
