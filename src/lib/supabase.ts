import { createBrowserClient } from '@supabase/ssr';

// Supabase client for browser/client components
// Set these environment variables to enable authentication:
// NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
// NEXT_PUBLIC_SUPABASE_ANON_KEY - Your Supabase anon/public key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create client only if configured
export function createClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase not configured. Auth features will be disabled.');
        return null;
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton client instance
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
    if (!isSupabaseConfigured) return null;

    if (!clientInstance) {
        clientInstance = createClient();
    }

    return clientInstance;
}

// Auth helper types
export type { User, Session } from '@supabase/supabase-js';
