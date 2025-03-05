
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getTasks, getProfile, Task, UserProfile } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  BarChart as BarChartIcon, 
  ChevronLeft, 
  Clock, 
  Award, 
  CheckCircle,
  CalendarRange
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';

export function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const [tasksData, profileData] = await Promise.all([
          getTasks(user.id),
          getProfile(user.id)
        ]);
        
        setTasks(tasksData);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter tasks based on selected time range
  const getFilteredTasks = () => {
    if (timeRange === 'all') return tasks;
    
    const today = new Date();
    const startDate = timeRange === 'week' 
      ? subDays(today, 7) 
      : subDays(today, 30);
    
    return tasks.filter(task => {
      const taskDate = task.completed_at 
        ? parseISO(task.completed_at)
        : parseISO(task.created_at);
      
      return isWithinInterval(taskDate, {
        start: startDate,
        end: today
      });
    });
  };
  
  const filteredTasks = getFilteredTasks();
  
  // Calculate stats
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  const completionRate = filteredTasks.length > 0 
    ? Math.round((completedTasks.length / filteredTasks.length) * 100) 
    : 0;
  const totalPoints = completedTasks.reduce((sum, task) => sum + (task.points_earned || 0), 0);
  const totalMinutes = completedTasks.reduce((sum, task) => sum + (task.actual_minutes || 0), 0);
  
  // Prepare data for task status chart
  const statusData = [
    { name: 'Completed', value: filteredTasks.filter(t => t.status === 'completed').length },
    { name: 'In Progress', value: filteredTasks.filter(t => t.status === 'in_progress').length },
    { name: 'Pending', value: filteredTasks.filter(t => t.status === 'pending').length },
  ].filter(item => item.value > 0);
  
  const COLORS = ['#22c55e', '#3b82f6', '#f97316'];
  
  // Prepare data for time spent chart
  const timeData = completedTasks.slice(-5).map(task => ({
    name: task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title,
    actualMinutes: task.actual_minutes || 0,
    estimatedMinutes: task.estimated_minutes || 0
  }));
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading analytics...</div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <BarChartIcon className="mr-2 h-6 w-6" />
            Cleaning Analytics
          </h1>
          <AnimatedButton
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="dark:border-gray-600"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </AnimatedButton>
        </div>
        
        <div className="flex gap-3 mb-2">
          <AnimatedButton
            variant={timeRange === 'week' ? 'highlight' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
            className={timeRange !== 'week' ? 'dark:border-gray-600' : ''}
          >
            Last 7 days
          </AnimatedButton>
          <AnimatedButton
            variant={timeRange === 'month' ? 'highlight' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
            className={timeRange !== 'month' ? 'dark:border-gray-600' : ''}
          >
            Last 30 days
          </AnimatedButton>
          <AnimatedButton
            variant={timeRange === 'all' ? 'highlight' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('all')}
            className={timeRange !== 'all' ? 'dark:border-gray-600' : ''}
          >
            All time
          </AnimatedButton>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Award className="h-4 w-4 mr-1" />
                Points Earned
              </span>
              <span className="text-3xl font-bold mt-1">{totalPoints}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All time: {profile?.points || 0}
              </span>
            </div>
          </GlassCard>
          
          <GlassCard className="p-5 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Tasks Completed
              </span>
              <span className="text-3xl font-bold mt-1">{completedTasks.length}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Completion rate: {completionRate}%
              </span>
            </div>
          </GlassCard>
          
          <GlassCard className="p-5 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Time Spent
              </span>
              <span className="text-3xl font-bold mt-1">{totalMinutes} min</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ~{Math.round(totalMinutes / 60)} hours
              </span>
            </div>
          </GlassCard>
          
          <GlassCard className="p-5 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <CalendarRange className="h-4 w-4 mr-1" />
                Active Days
              </span>
              <span className="text-3xl font-bold mt-1">
                {new Set(completedTasks.map(t => 
                  format(parseISO(t.completed_at || t.created_at), 'yyyy-MM-dd')
                )).size}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Days with completed tasks
              </span>
            </div>
          </GlassCard>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-5 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Task Status</h2>
            
            {statusData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No task data available</p>
              </div>
            )}
          </GlassCard>
          
          <GlassCard className="p-5 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Time Spent on Recent Tasks</h2>
            
            {timeData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="estimatedMinutes" name="Estimated Time" fill="#8884d8" />
                    <Bar dataKey="actualMinutes" name="Actual Time" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No completed tasks available</p>
              </div>
            )}
          </GlassCard>
          
          <GlassCard className="p-5 dark:bg-gray-800 dark:border-gray-700 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Your Progress</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Task Completion Rate</span>
                  <span className="text-sm font-medium">{completionRate}%</span>
                </div>
                <ProgressBar value={completionRate} max={100} variant="info" size="md" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Points Progress (Level {Math.floor((profile?.points || 0) / 100) + 1})</span>
                  <span className="text-sm font-medium">
                    {(profile?.points || 0) % 100}/100
                  </span>
                </div>
                <ProgressBar 
                  value={(profile?.points || 0) % 100} 
                  max={100} 
                  variant="warning" 
                  size="md" 
                />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
