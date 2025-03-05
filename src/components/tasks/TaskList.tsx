import React from 'react';
import { Task } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Play, CheckCircle, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TaskListProps {
  tasks: Task[];
  onStartTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
}

export function TaskList({ tasks, onStartTask, onCompleteTask }: TaskListProps) {
  const navigate = useNavigate();
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const handleStartTask = (task: Task) => {
    if (task.status === 'in_progress') {
      navigate(`/focus/${task.id}`);
    } else {
      onStartTask(task);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Tasks */}
      <GlassCard className="p-6 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Active Tasks</h2>
        
        {pendingTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No active tasks</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <div 
                key={task.id}
                className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {task.estimated_minutes && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Timer className="h-4 w-4 mr-1" />
                        {task.estimated_minutes} min
                      </span>
                    )}
                    
                    <AnimatedButton
                      variant={task.status === 'in_progress' ? 'highlight' : 'outline'}
                      size="sm"
                      onClick={() => handleStartTask(task)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {task.status === 'in_progress' ? 'Continue' : 'Start'}
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <GlassCard className="p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Completed Tasks</h2>
          
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <div 
                key={task.id}
                className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  
                  {task.actual_minutes && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Timer className="h-4 w-4 mr-1" />
                      {task.actual_minutes} min
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

export default TaskList; 