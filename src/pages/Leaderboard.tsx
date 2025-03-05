
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getLeaderboard, UserProfile } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, ChevronLeft, Award, Crown, Medal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  
  useEffect(() => {
    loadLeaderboard();
  }, []);
  
  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
      
      if (user) {
        const currentUserRank = data.findIndex(profile => profile.id === user.id) + 1;
        setUserRank(currentUserRank > 0 ? currentUserRank : null);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Crown className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Crown className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="text-gray-500 dark:text-gray-400 font-mono">{rank}</span>;
    }
  };
  
  const getInitials = (profile: UserProfile) => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    } else if (profile.first_name) {
      return profile.first_name[0].toUpperCase();
    } else if (profile.email) {
      return profile.email[0].toUpperCase();
    }
    return 'U';
  };
  
  const getBadgeForPoints = (points: number) => {
    if (points >= 1000) {
      return <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500">Master Cleaner</Badge>;
    } else if (points >= 500) {
      return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">Expert Cleaner</Badge>;
    } else if (points >= 200) {
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">Advanced Cleaner</Badge>;
    } else if (points >= 100) {
      return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500">Regular Cleaner</Badge>;
    } else {
      return <Badge className="bg-gradient-to-r from-orange-500 to-red-500">Beginner</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading leaderboard...</div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
            Cleaning Leaderboard
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
        
        {userRank && (
          <GlassCard className="p-5 dark:bg-gray-800 dark:border-gray-700 border-highlight">
            <div className="flex items-center">
              <div className="rounded-full w-8 h-8 flex items-center justify-center bg-highlight text-white mr-3">
                {userRank}
              </div>
              <h2 className="font-semibold">Your Rank: #{userRank}</h2>
              <div className="ml-auto flex items-center">
                <Award className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="font-bold">
                  {leaderboard.find(p => p.id === user?.id)?.points || 0} points
                </span>
              </div>
            </div>
          </GlassCard>
        )}
        
        <GlassCard className="p-5 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Top Cleaners</h2>
          
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No users on the leaderboard yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((profile, index) => (
                <div 
                  key={profile.id} 
                  className={`p-3 rounded-lg flex items-center ${
                    profile.id === user?.id 
                      ? 'bg-highlight/10 dark:bg-highlight/20' 
                      : (index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/30' : '')
                  }`}
                >
                  <div className="mr-3 w-8 flex justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback className={`${
                      index < 3 ? 'bg-highlight' : 'bg-gray-500 dark:bg-gray-600'
                    } text-white`}>
                      {getInitials(profile)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {profile.first_name || profile.last_name 
                          ? `${profile.first_name || ''} ${profile.last_name || ''}` 
                          : profile.email.split('@')[0]}
                      </p>
                      {getBadgeForPoints(profile.points)}
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Level {Math.floor(profile.points / 100) + 1}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 font-bold text-lg">
                    {profile.points}
                    <Medal className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
        
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Complete more cleaning tasks to earn points and climb the leaderboard!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
