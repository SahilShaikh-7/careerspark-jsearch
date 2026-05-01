import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://tqzsdsqdmcdkggpaibst.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxenNkc3FkbWNka2dncGFpYnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzEyMjYsImV4cCI6MjA3ODMwNzIyNn0.yfEDHMZmUhI4EariddeJlgcNiZI_6qjWl9iHXUPUDk0";

/**
 * A flag to check if Supabase has been configured with actual credentials.
 */
export const isSupabaseConfigured = !supabaseUrl.includes('your-project-id') && !supabaseAnonKey.includes('your-supabase-anon-key');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!isSupabaseConfigured) {
    console.warn(
        "Supabase credentials are not configured. " +
        "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
    );
}
