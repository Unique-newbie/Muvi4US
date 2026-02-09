'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { useAppStore } from '@/store/app-store';
import { useAdminStore } from '@/lib/admin-store';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isConfigured: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>;

    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const setStoreUser = useAppStore((state) => state.setUser);
    const syncWithSupabase = useAppStore((state) => state.syncWithSupabase);
    const checkAdminStatus = useAdminStore((state) => state.checkAdminStatus);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setIsLoading(false);
            return;
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session: currentSession } }: { data: { session: Session | null } }) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setStoreUser(currentSession?.user ?? null);

            if (currentSession?.user) {
                syncWithSupabase(currentSession.user.id);
                checkAdminStatus();
            }

            setIsLoading(false);
        });

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: AuthChangeEvent, newSession: Session | null) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);
                setStoreUser(newSession?.user ?? null);

                if (newSession?.user) {
                    syncWithSupabase(newSession.user.id);
                    checkAdminStatus();
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [setStoreUser, syncWithSupabase, checkAdminStatus]);

    const signIn = async (email: string, password: string) => {
        const supabase = getSupabaseClient();
        if (!supabase) {
            return { error: new Error('Supabase not configured') };
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return { error: error ? new Error(error.message) : null };
    };

    const signUp = async (email: string, password: string) => {
        const supabase = getSupabaseClient();
        if (!supabase) {
            return { error: new Error('Supabase not configured') };
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        return { error: error ? new Error(error.message) : null };
    };



    const signOut = async () => {
        const supabase = getSupabaseClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                isConfigured: isSupabaseConfigured,
                signIn,
                signUp,

                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
