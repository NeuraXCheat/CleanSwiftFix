import React from 'react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Plus, Sparkles } from 'lucide-react';

interface TaskCreationButtonsProps {
  onManualCreate: () => void;
  onAICreate: () => void;
}

export function TaskCreationButtons({ onManualCreate, onAICreate }: TaskCreationButtonsProps) {
  return (
    <div className="flex gap-4">
      <AnimatedButton
        variant="outline"
        onClick={onManualCreate}
        className="flex-1"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Task
      </AnimatedButton>
      
      <AnimatedButton
        variant="highlight"
        onClick={onAICreate}
        className="flex-1"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Create with AI
      </AnimatedButton>
    </div>
  );
}

export default TaskCreationButtons; 