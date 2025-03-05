
import React from 'react';
import { Task } from '@/lib/supabase';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onStartTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
}

export function TaskList({ tasks, onStartTask, onCompleteTask }: TaskListProps) {
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No tasks found. Create a new task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {inProgressTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">In Progress</h2>
          <div className="space-y-3">
            {inProgressTasks.map(task => (
              <TaskItem 
                key={task.id}
                task={task}
                onStartTask={onStartTask}
                onComplete={onCompleteTask}
              />
            ))}
          </div>
        </div>
      )}
      
      {pendingTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">To Do</h2>
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <TaskItem 
                key={task.id}
                task={task}
                onStartTask={onStartTask}
                onComplete={onCompleteTask}
              />
            ))}
          </div>
        </div>
      )}
      
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Completed</h2>
          <div className="space-y-3">
            {completedTasks.slice(0, 3).map(task => (
              <TaskItem 
                key={task.id}
                task={task}
                onStartTask={onStartTask}
                onComplete={onCompleteTask}
              />
            ))}
          </div>
          {completedTasks.length > 3 && (
            <p className="text-sm text-center mt-3 text-gray-500">
              + {completedTasks.length - 3} more completed tasks
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskList;
