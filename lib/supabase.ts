import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT ---
// Replace the placeholder values below with your actual Supabase credentials
// if they are not provided as environment variables.
// You can find these in your Supabase project's API settings.
const supabaseUrl = process.env.SUPABASE_URL || "https://tqzsdsqdmcdkggpaibst.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxenNkc3FkbWNka2dncGFpYnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzEyMjYsImV4cCI6MjA3ODMwNzIyNn0.yfEDHMZmUhI4EariddeJlgcNiZI_6qjWl9iHXUPUDk0";

/**
 * A flag to check if Supabase has been configured with actual credentials.
 * The app will show a warning banner if this is false.
 */
export const isSupabaseConfigured = !supabaseUrl.includes('your-project-id') && !supabaseAnonKey.includes('your-supabase-anon-key');

// We initialize the client even with placeholder values to prevent the app from crashing.
// Supabase-dependent features will fail until real credentials are provided.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log a warning to the console for developers.
if (!isSupabaseConfigured) {
    console.warn(
        "Supabase credentials are not configured or are using placeholders. " +
        "Please update them in lib/supabase.ts or set SUPABASE_URL and SUPABASE_ANON_KEY environment variables. " +
        "The application will not function correctly until this is resolved."
    );
}
