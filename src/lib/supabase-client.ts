
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anon key from the project config
const supabaseUrl = 'https://gybixndluavyufbenwyx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5Yml4bmRsdWF2eXVmYmVud3l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMzEzMzYsImV4cCI6MjA1NjcwNzMzNn0.DFMaDOop81D57mbZuh0fK6q2DMoPuZhjdVoTESlb2GI';

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
