import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createTask, uploadTaskImage } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';

export function TaskCreation({ onTaskCreated }: { onTaskCreated: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('2');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create tasks');
      return;
    }
    
    setIsLoading(true);
    setDebugInfo(null);
    
    try {
      console.log('Creating task for user:', user.id);
      
      let imageUrl = null;
      
      // Upload image if exists
      if (image) {
        console.log('Uploading image...');
        try {
          imageUrl = await uploadTaskImage(user.id, image);
          console.log('Image uploaded, URL:', imageUrl);
          
          if (!imageUrl) {
            setDebugInfo('Image upload failed, but continuing with task creation');
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          setDebugInfo(`Image upload error: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          // Continue with task creation even if image upload fails
        }
      }
      
      // Create task
      const taskData = {
        user_id: user.id,
        title,
        description: description || null,
        priority: parseInt(priority) || null,
        status: 'pending',
        estimated_minutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        image_url: imageUrl,
        actual_minutes: null,
        completed_at: null
      };
      
      console.log('Submitting task data:', taskData);
      
      try {
        const newTask = await createTask(taskData);
        
        if (newTask) {
          console.log('Task created successfully:', newTask);
          toast.success('Task created successfully!');
          setTitle('');
          setDescription('');
          setPriority('2');
          setEstimatedMinutes('');
          setImage(null);
          setImagePreview(null);
          setDebugInfo(null);
          onTaskCreated();
        } else {
          const errorMsg = 'Failed to create task - no task returned from API';
          console.error(errorMsg);
          setDebugInfo(errorMsg);
          toast.error(errorMsg);
        }
      } catch (taskError) {
        console.error('Error in createTask call:', taskError);
        setDebugInfo(`Task creation error: ${taskError instanceof Error ? taskError.message : 'Unknown error'}`);
        toast.error(`Failed to create task: ${taskError instanceof Error ? taskError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setDebugInfo(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="p-6 animate-slideUp dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Task Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be cleaned?"
            required
            className="dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description & Steps</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details about this task..."
            className="resize-none dark:bg-gray-700 dark:border-gray-600"
            rows={6}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority" className="dark:bg-gray-700 dark:border-gray-600">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="1">High</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="estimatedMinutes">Estimated Time (minutes)</Label>
            <Input
              id="estimatedMinutes"
              type="number"
              min="1"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              placeholder="How long will it take?"
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
        
        <div>
          <Label className="block mb-2">Add Room Photo (for AI analysis)</Label>
          {imagePreview ? (
            <div className="space-y-3">
              <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden mb-2">
                <img 
                  src={imagePreview} 
                  alt="Task preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-blue-500 dark:text-blue-400">
                The room will be analyzed with AI when you start this task
              </p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6 text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="image-upload" className="cursor-pointer text-highlight hover:text-highlight/90">
                  <span>Upload a photo of the room</span>
                  <input
                    id="image-upload"
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
                  AI will analyze your room when you start this task
                </p>
              </div>
            </div>
          )}
        </div>
        
        {debugInfo && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Debug Information:</h3>
            <pre className="text-xs mt-1 text-red-700 dark:text-red-400 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}
        
        <AnimatedButton
          type="submit"
          loading={isLoading}
          variant="highlight"
          className="w-full"
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          Create Task
        </AnimatedButton>
      </form>
    </GlassCard>
  );
}

export default TaskCreation;
