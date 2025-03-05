import { supabase } from './supabase-client';

export { supabase };

export type UserProfile = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  points: number;
  created_at: string;
  is_admin?: boolean;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: number | null;
  status: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  created_at: string;
  completed_at: string | null;
  image_url: string | null;
};

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}

export async function getTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data || [];
}

export async function createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task | null> {
  console.log('Creating task with data:', task);
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      console.error('Error details:', error.details, error.message, error.hint);
      
      // Check if the error is related to the storage bucket not existing
      if (error.message?.includes('does not exist') && error.message?.includes('bucket')) {
        console.log('Attempting to create storage bucket for task images...');
        try {
          const { error: bucketError } = await supabase.storage.createBucket('task-images', {
            public: true
          });
          
          if (bucketError) {
            console.error('Failed to create bucket:', bucketError);
          } else {
            console.log('Bucket created successfully, retrying task creation...');
            // Try again after creating the bucket
            const { data: retryData, error: retryError } = await supabase
              .from('tasks')
              .insert([task])
              .select()
              .single();
              
            if (retryError) {
              console.error('Error on retry:', retryError);
              return null;
            }
            
            console.log('Task created successfully on retry:', retryData);
            return retryData;
          }
        } catch (bucketCreateError) {
          console.error('Exception during bucket creation:', bucketCreateError);
        }
      }
      
      return null;
    }

    console.log('Task created successfully:', data);
    return data;
  } catch (exception) {
    console.error('Exception during task creation:', exception);
    return null;
  }
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return null;
  }

  return data;
}

export async function uploadTaskImage(userId: string, file: File): Promise<string | null> {
  console.log('Uploading image for user:', userId);
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Ensure the bucket exists
    const { data: bucketData, error: bucketError } = await supabase.storage
      .getBucket('task-images');
      
    if (bucketError && bucketError.message.includes('The resource was not found')) {
      console.log('Bucket does not exist, creating it...');
      await supabase.storage.createBucket('task-images', { public: true });
    }
    
    const { error, data } = await supabase.storage
      .from('task-images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('task-images')
      .getPublicUrl(data.path);

    console.log('Image uploaded successfully, URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Exception during image upload:', error);
    return null;
  }
}

export async function getLeaderboard(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('points', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data || [];
}
