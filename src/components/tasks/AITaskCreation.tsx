import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createTask } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Brain, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function AITaskCreation({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // Set default title based on image name
        const fileName = file.name.split('.')[0];
        setTaskTitle(fileName.replace(/[-_]/g, ' ') || 'Clean Room');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };
  
  const createRoomCleaningTask = async () => {
    if (!image || !user) return;
    
    setIsCreating(true);
    
    try {
      // Convert image to base64 for storage and later analysis
      const reader = new FileReader();
      reader.readAsDataURL(image);
      
      reader.onloadend = async () => {
        const imageData = reader.result?.toString() || '';
        
        // Create a task with the image and flag for AI analysis later
        const createdTask = await createTask({
          user_id: user.id,
          title: taskTitle || 'Clean Room',
          description: 'This room will be analyzed with AI when you start the task.',
          priority: 1, // High priority by default
          status: 'pending',
          estimated_minutes: 30, // Default estimate
          image_url: imageData,
          actual_minutes: null,
          completed_at: null
        });
        
        if (createdTask) {
          toast.success('Created cleaning task! AI analysis will happen when you start the task.');
          onComplete();
        } else {
          toast.error('Failed to create task');
        }
      };
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('An error occurred while creating the task');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <GlassCard className="p-6 animate-slideUp dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">AI Cleaning Assistant</h2>
        <div className="flex items-center gap-2">
          <AnimatedButton
            size="sm"
            variant="outline"
            onClick={onComplete}
            className="dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <X size={16} className="mr-1" /> Cancel
          </AnimatedButton>
        </div>
      </div>

      <div className="space-y-4">
        {!imagePreview ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
            <Camera className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-2">
              <label htmlFor="ai-image-upload" className="cursor-pointer text-highlight hover:text-highlight/90">
                <span>Upload a photo of your space</span>
                <input
                  id="ai-image-upload"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                <Brain className="inline-block h-3 w-3 mr-1" />
                AI will analyze your room when you start the task
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Room preview" 
                className="w-full h-64 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div>
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input
                id="taskTitle"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Name for this cleaning task"
                className="mb-4 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-200">
                This room will be analyzed with AI when you start the task. The AI will provide cleaning steps and tips based on the image.
              </p>
            </div>
            
            <AnimatedButton
              onClick={createRoomCleaningTask}
              loading={isCreating}
              className="w-full"
              variant="highlight"
            >
              <Check className="mr-2 h-4 w-4" />
              {isCreating ? 'Creating Task...' : 'Create AI Cleaning Task'}
            </AnimatedButton>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default AITaskCreation;
