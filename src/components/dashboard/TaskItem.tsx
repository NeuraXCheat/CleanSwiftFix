
import React from 'react';
import { Task } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, CheckCircle2, Brain, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TaskItemProps {
  task: Task;
  onStartTask: (task: Task) => void;
  onComplete: (task: Task) => void;
}

export function TaskItem({ task, onStartTask, onComplete }: TaskItemProps) {
  const navigate = useNavigate();
  
  const getPriorityBadge = () => {
    switch (task.priority) {
      case 1:
        return <Badge className="bg-red-500">High Priority</Badge>;
      case 2:
        return <Badge className="bg-amber-500">Medium Priority</Badge>;
      case 3:
        return <Badge className="bg-green-500">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (task.status) {
      case 'pending':
        return <Badge variant="outline" className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300">Not Started</Badge>;
      case 'in_progress':
        return <Badge className="bg-highlight">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return null;
    }
  };
  
  const handleStartFocus = () => {
    navigate(`/focus/${task.id}`);
  };

  return (
    <GlassCard className="p-4 hover-scale transition-all duration-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-start gap-4">
        {task.image_url && (
          <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img 
              src={task.image_url} 
              alt={task.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-1">
            {getPriorityBadge()}
            {getStatusBadge()}
            {task.has_ai_analysis && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                <Brain size={12} className="mr-1" /> AI Analysis
              </Badge>
            )}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">{task.title}</h3>
          
          {task.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
          )}
          
          {task.estimated_minutes && (
            <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock size={14} className="mr-1" />
              <span>Estimated: {task.estimated_minutes} minutes</span>
            </div>
          )}
        </div>
        
        <div className="ml-auto flex-shrink-0">
          {task.status === 'pending' && (
            <AnimatedButton 
              size="sm" 
              variant="highlight"
              onClick={handleStartFocus}
            >
              <span>Start</span>
              <ArrowRight size={16} className="ml-1" />
            </AnimatedButton>
          )}
          
          {task.status === 'in_progress' && (
            <div className="flex flex-col gap-2">
              <AnimatedButton 
                size="sm" 
                variant="highlight"
                onClick={handleStartFocus}
              >
                <Timer size={16} className="mr-1" />
                <span>Focus</span>
              </AnimatedButton>
              
              <AnimatedButton 
                size="sm" 
                variant="outline"
                onClick={() => onComplete(task)}
                className="dark:border-gray-600"
              >
                <CheckCircle2 size={16} className="mr-1" />
                <span>Complete</span>
              </AnimatedButton>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

export default TaskItem;
