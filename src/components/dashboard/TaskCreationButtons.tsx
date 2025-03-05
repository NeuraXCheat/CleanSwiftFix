
import React from 'react';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Plus, Camera } from 'lucide-react';

interface TaskCreationButtonsProps {
  onManualCreate: () => void;
  onAICreate: () => void;
}

export function TaskCreationButtons({ onManualCreate, onAICreate }: TaskCreationButtonsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnimatedButton
        onClick={onManualCreate}
        variant="highlight"
        className="py-6"
        animation="scale"
      >
        <Plus className="mr-2 h-5 w-5" />
        Add Task Manually
      </AnimatedButton>
      
      <AnimatedButton
        onClick={onAICreate}
        variant="highlight"
        className="py-6"
        animation="scale"
      >
        <Camera className="mr-2 h-5 w-5" />
        Create Tasks with AI
      </AnimatedButton>
    </div>
  );
}

export default TaskCreationButtons;
