
import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Task } from '@/lib/supabase';

interface DashboardStatsProps {
  tasks: Task[];
}

export function DashboardStats({ tasks }: DashboardStatsProps) {
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <GlassCard className="p-5 text-center">
        <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
        <p className="text-3xl font-bold mt-2">{totalCount}</p>
      </GlassCard>
      
      <GlassCard className="p-5 text-center">
        <h3 className="text-sm font-medium text-gray-500">Pending</h3>
        <p className="text-3xl font-bold mt-2">{pendingCount}</p>
      </GlassCard>
      
      <GlassCard className="p-5 text-center">
        <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
        <p className="text-3xl font-bold mt-2">{inProgressCount}</p>
      </GlassCard>
      
      <GlassCard className="p-5 text-center">
        <h3 className="text-sm font-medium text-gray-500">Completed</h3>
        <p className="text-3xl font-bold mt-2">{completedCount}</p>
      </GlassCard>
    </div>
  );
}

export default DashboardStats;
