import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getTasks, updateTask, Task, getProfile, updateProfile } from '@/lib/supabase';
import { analyzeImageWithGroq } from '@/lib/groq';
import { askFollowUpQuestion, ChatMessage } from '@/lib/llama';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Play, Pause, CheckCircle, Timer, ArrowLeft, Award,
  Brain, MessageSquare, Send, Sparkles, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export function FocusMode() {
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  // States for AI analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    tasks: Array<{
      title: string;
      description?: string;
      priority: number;
      completed: boolean;
    }>;
  } | null>(null);
  
  // States for chat
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);
  
  const estimatedSeconds = (task?.estimated_minutes || 25) * 60;
  const progress = Math.min(100, (elapsedSeconds / estimatedSeconds) * 100);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    if (user && taskId) {
      loadTask();
    }
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [user, taskId]);
  
  const loadTask = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const tasks = await getTasks(user.id);
        const foundTask = tasks.find(t => t.id === taskId);
        
        if (foundTask) {
          setTask(foundTask);
          
          // If task has an image, analyze it
          if (foundTask.image_url) {
            analyzeRoomImage(foundTask.image_url);
          }
        } else {
          toast.error('Task not found');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error loading task:', error);
      toast.error('Failed to load task details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const analyzeRoomImage = async (imageUrl: string) => {
    if (!imageUrl || !task) return;
    
    setIsAnalyzing(true);
    toast.info('Analyzing room image with AI...');
    
    try {
      // Extract base64 data if it's an embedded image
      let base64Image = '';
      if (imageUrl.startsWith('data:image/')) {
        base64Image = imageUrl.split(',')[1];
      } else {
        // Fetch remote image and convert to base64
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onloadend = () => {
            const dataUrl = reader.result?.toString() || '';
            base64Image = dataUrl.split(',')[1];
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      }
      
      if (!base64Image) {
        throw new Error('Failed to get image data');
      }
      
      // Analyze with GROQ
      const aiAnalysis = await analyzeImageWithGroq(base64Image);
      
      if (aiAnalysis) {
        // Transform tasks into step items with completion status
        const stepsWithStatus = aiAnalysis.tasks.map(task => ({
          ...task,
          completed: false
        }));
        
        const formattedAnalysis = {
          summary: aiAnalysis.summary,
          tasks: stepsWithStatus
        };
        
        setAnalysis(formattedAnalysis);
        
        // Initialize chat with a system message about the analyzed room
        setChatMessages([
          {
            role: 'system',
            content: `This is an analysis of a room that needs cleaning: ${aiAnalysis.summary} The cleaning tasks are: ${aiAnalysis.tasks.map(task => task.title).join(', ')}`
          }
        ]);
        
        toast.success('Room analysis complete!');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image with AI');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const toggleTimer = () => {
    if (isTimerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };
  
  const startTimer = () => {
    setIsTimerRunning(true);
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  };
  
  const pauseTimer = () => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  const toggleStepCompletion = async (index: number) => {
    if (!analysis) return;
    
    // Update local state only
    const updatedTasks = [...analysis.tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    
    setAnalysis({
      ...analysis,
      tasks: updatedTasks
    });
  };
  
  const completeTask = async () => {
    if (!task || !user) return;

    try {
      pauseTimer();

      const now = new Date().toISOString();
      const actualMinutes = Math.ceil(elapsedSeconds / 60);

      // Calculate points based on task completion
      let pointsEarned = Math.max(10, actualMinutes); // Base points
      
      // Bonus points for completing all steps if they exist
      if (analysis?.tasks && analysis.tasks.every(t => t.completed)) {
        pointsEarned += 20; // Bonus for completing all steps
      }

      // Update task status
      const updatedTask = await updateTask(task.id, {
        status: 'completed',
        completed_at: now,
        actual_minutes: actualMinutes
      });

      if (updatedTask) {
        setTask(updatedTask);

        // Update user's points
        const profile = await getProfile(user.id);
        if (profile) {
          await updateProfile(user.id, {
            points: (profile.points || 0) + pointsEarned
          });

          toast('Points earned!', {
            description: `+${pointsEarned} points for completing this task`,
            icon: <Award className="h-5 w-5 text-yellow-500" />
          });
        }

        toast.success('Task completed!');

        // Navigate back to dashboard after a delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };
  
  // Function to handle asking follow-up questions to the AI
  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;
    
    // Add user question to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: newQuestion
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setNewQuestion('');
    setIsAskingAI(true);
    
    try {
      // Send message to AI
      const updatedMessages = [...chatMessages, userMessage];
      const aiResponse = await askFollowUpQuestion(updatedMessages);
      
      if (aiResponse) {
        // Add AI response to chat
        setChatMessages(prev => [
          ...prev, 
          { role: 'assistant', content: aiResponse }
        ]);
      }
    } catch (error) {
      console.error('Error asking AI:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsAskingAI(false);
    }
  };
  
  const exitFocusMode = () => {
    navigate('/dashboard');
  };
  
  if (isLoading || !task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  const allStepsCompleted = analysis?.tasks.every(t => t.completed) || false;
  
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center">
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={exitFocusMode}
            className="mr-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </AnimatedButton>
          <h1 className="text-xl font-bold">Focus Mode</h1>
        </div>
        
        <GlassCard className="p-6 text-center dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-2">{task.title}</h2>
          
          <div className="mb-8 relative">
            <div className="text-6xl font-mono font-bold mb-2">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {task.estimated_minutes && (
                <span>Goal: {task.estimated_minutes} minutes</span>
              )}
            </div>
            
            <ProgressBar
              value={elapsedSeconds}
              max={estimatedSeconds}
              size="lg"
              variant="info"
            />
          </div>
          
          <div className="flex space-x-4 mb-4">
            <AnimatedButton
              className="flex-1"
              variant={isTimerRunning ? "outline" : "highlight"}
              onClick={toggleTimer}
            >
              {isTimerRunning ? (
                <>
                  <Pause size={18} className="mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play size={18} className="mr-2" />
                  Start
                </>
              )}
            </AnimatedButton>
            
            <AnimatedButton
              className="flex-1"
              onClick={completeTask}
              disabled={elapsedSeconds < 10 || (analysis?.tasks.length && !allStepsCompleted)} 
            >
              <CheckCircle size={18} className="mr-2" />
              Complete
            </AnimatedButton>
          </div>
          
          {elapsedSeconds < 10 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Work for at least a few seconds before completing
            </p>
          )}
          
          {analysis?.tasks.length && !allStepsCompleted && (
            <p className="text-xs text-amber-500 dark:text-amber-400 mt-2">
              Complete all steps before finishing the task
            </p>
          )}
        </GlassCard>
        
        {isAnalyzing ? (
          <GlassCard className="p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Brain className="h-12 w-12 mb-4 text-blue-500 animate-pulse" />
              <h3 className="text-lg font-medium mb-2">Analyzing your room with AI...</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This will take a few moments. We're identifying cleaning tasks and providing tips.
              </p>
            </div>
          </GlassCard>
        ) : analysis ? (
          <GlassCard className="p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Cleaning Steps</h3>
              <AnimatedButton 
                variant="outline" 
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="dark:border-gray-600"
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                {showChat ? 'Hide Chat' : 'Ask AI'}
              </AnimatedButton>
            </div>
            
            {analysis.summary && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded mb-4">
                <div className="flex items-start">
                  <Sparkles className="h-4 w-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">{analysis.summary}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-3 mt-4">
              {analysis.tasks.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex items-start p-3 rounded-md transition-colors ${
                    step.completed 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-gray-50 dark:bg-gray-700/30'
                  }`}
                >
                  <Checkbox 
                    id={`step-${index}`}
                    checked={step.completed}
                    onCheckedChange={() => toggleStepCompletion(index)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={`step-${index}`}
                      className={`font-medium text-sm cursor-pointer ${
                        step.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                      }`}
                    >
                      {step.title}
                    </label>
                    {step.description && (
                      <p className={`text-xs mt-1 ${
                        step.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chat interface */}
            {showChat && (
              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Brain className="h-4 w-4 mr-1 text-highlight" />
                  Ask the CleanSwift AI Assistant
                </h4>
                
                <div className="h-40 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700 rounded mb-3 space-y-2">
                  {chatMessages.filter(msg => msg.role !== 'system').map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2 rounded-lg max-w-[80%] ${
                        msg.role === 'user' 
                          ? 'bg-highlight text-white ml-auto' 
                          : 'bg-gray-200 dark:bg-gray-600 dark:text-gray-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  
                  {isAskingAI && (
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      AI is thinking...
                    </div>
                  )}
                  
                  {chatMessages.filter(msg => msg.role !== 'system').length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      Ask for cleaning tips or more detailed advice
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask about cleaning techniques..."
                    className="flex-1 resize-none dark:bg-gray-700 dark:border-gray-600"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAskQuestion();
                      }
                    }}
                  />
                  <AnimatedButton
                    onClick={handleAskQuestion}
                    disabled={isAskingAI || !newQuestion.trim()}
                    variant="highlight"
                    className="self-end"
                  >
                    {isAskingAI ? (
                      <Loader2 className="animate-spin h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </AnimatedButton>
                </div>
              </div>
            )}
          </GlassCard>
        ) : (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center">
              <Timer size={14} className="mr-1" />
              Focus on this task and track your time
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FocusMode;
