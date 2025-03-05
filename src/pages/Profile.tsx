
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProfile, updateProfile, UserProfile } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Save, Award, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ui/ThemeToggle';

export function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);
  
  const loadProfile = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const profileData = await getProfile(user.id);
        if (profileData) {
          setProfile(profileData);
          setFirstName(profileData.first_name || '');
          setLastName(profileData.last_name || '');
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!user || !profile) return;
    
    setIsSaving(true);
    try {
      const updated = await updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName
      });
      
      if (updated) {
        setProfile(updated);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Profile & Settings</h1>
          <div className="flex gap-2">
            <ThemeToggle />
            <AnimatedButton variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </AnimatedButton>
          </div>
        </div>
        
        <GlassCard className="p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="text-2xl bg-highlight text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-semibold">
                {firstName || lastName ? `${firstName} ${lastName}` : 'Your Profile'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              
              <div className="flex items-center justify-center sm:justify-start mt-2">
                <Award className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="font-bold">{profile?.points || 0} points</span>
              </div>
            </div>
          </div>
          
          <Separator className="my-6 dark:bg-gray-700" />
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Your last name"
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-100 dark:bg-gray-700 dark:border-gray-600 opacity-70"
              />
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <AnimatedButton
                variant="highlight"
                onClick={handleSave}
                loading={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </AnimatedButton>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            App Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
              </div>
              <ThemeToggle />
            </div>
            
            <Separator className="dark:bg-gray-700" />
            
            <div className="pt-2">
              <AnimatedButton
                variant="destructive"
                onClick={signOut}
                className="w-full sm:w-auto"
              >
                Sign Out
              </AnimatedButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default Profile;
