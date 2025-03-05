import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import type { UserProfile } from '@/hooks/useAuth';

export function DevMenu() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('points', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading user data...</div>;
  }

  return (
    <GlassCard className="p-6 dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4">Developer Menu</h2>
      
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">User ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Points</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Admin</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 text-sm">{user.user_id}</td>
                  <td className="px-4 py-2 text-sm">{user.points}</td>
                  <td className="px-4 py-2 text-sm">{user.is_admin ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GlassCard>
  );
}

export default DevMenu; 