import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { UserProfile, getLeaderboard } from '@/lib/supabase';
import { Settings, Users, Award, Search } from 'lucide-react';
import { toast } from 'sonner';

export function DevMenu() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboard(); // This gets all users ordered by points
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse">Loading user data...</div>
      </div>
    );
  }

  return (
    <GlassCard className="p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Developer Menu
        </h2>
        <AnimatedButton
          variant="outline"
          size="sm"
          onClick={loadUsers}
          className="dark:border-gray-600"
        >
          Refresh Data
        </AnimatedButton>
      </div>

      <div className="mb-6">
        <Label htmlFor="search">Search Users</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email or name..."
            className="pl-9 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 px-4">
          <Users className="h-4 w-4" />
          <span>Total Users: {users.length}</span>
        </div>

        <Separator className="dark:bg-gray-700" />

        <div className="max-h-[400px] overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.email}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{user.points || 0}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Level {Math.floor((user.points || 0) / 100) + 1}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No users found matching your search.
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

export default DevMenu; 