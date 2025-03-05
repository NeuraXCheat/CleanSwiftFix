
import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { User, BarChart, Trophy, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  onSignOut: () => void;
}

export function DashboardHeader({ onSignOut }: DashboardHeaderProps) {
  return (
    <GlassCard className="p-4 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CleanSwift</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Your AI-powered cleaning assistant</p>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Link to="/analytics">
            <AnimatedButton
              variant="outline"
              size="sm"
              className="dark:border-gray-600"
            >
              <BarChart size={16} className="mr-1" />
              Stats
            </AnimatedButton>
          </Link>
          
          <Link to="/leaderboard">
            <AnimatedButton
              variant="outline"
              size="sm" 
              className="dark:border-gray-600"
            >
              <Trophy size={16} className="mr-1" />
              Ranks
            </AnimatedButton>
          </Link>
          
          <Link to="/profile">
            <AnimatedButton
              variant="outline"
              size="sm"
              className="dark:border-gray-600"
            >
              <User size={16} className="mr-1" />
              Profile
            </AnimatedButton>
          </Link>
          
          <AnimatedButton
            variant="destructive"
            size="sm"
            onClick={onSignOut}
          >
            <LogOut size={16} className="mr-1" />
            Sign Out
          </AnimatedButton>
        </div>
      </div>
    </GlassCard>
  );
}

export default DashboardHeader;
