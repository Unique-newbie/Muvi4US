import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabaseClient } from '@/lib/supabase';
import { FALLBACK_SOURCES } from '@/lib/sources';

interface Announcement {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'danger';
    active: boolean;
    createdAt: Date;
}

interface ActivityLog {
    id: string;
    action: string;
    details: string;
    timestamp: Date;
    adminId: string;
}

interface ProxySource {
    id: string;
    name: string;
    url?: string;
    priority: number;
    enabled: boolean;
    type?: string;
}

interface AdminState {
    // Initialization
    isLoading: boolean;
    init: () => Promise<void>;

    // Auth
    isAdmin: boolean;
    checkAdminStatus: () => Promise<boolean>;
    logoutAdmin: () => Promise<void>;

    // Site Lockdown
    isLocked: boolean;
    lockdownMessage: string;
    lockdownUntil: Date | null;
    isGuestLockdown: boolean;

    // Featured Content Control
    featuredContentId: string | null;
    setFeaturedContentId: (id: string | null) => Promise<void>;

    // Announcements
    announcements: Announcement[];
    addAnnouncement: (message: string, type: 'info' | 'warning' | 'danger') => Promise<void>;
    removeAnnouncement: (id: string) => Promise<void>;

    // Proxy Management
    proxySources: ProxySource[];
    toggleProxySource: (id: string) => Promise<void>;

    // Activity Log
    activityLog: ActivityLog[];
    logActivity: (action: string, details: string) => void;
    clearActivityLog: () => void;

    // Actions
    setLockdown: (locked: boolean, message?: string, until?: Date | null) => Promise<void>;
    setGuestLockdown: (locked: boolean) => Promise<void>;
    // Real-time Subscription
    subscribe: () => Promise<() => void>;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            isLoading: true,
            isAdmin: false,
            isLocked: false,
            lockdownMessage: 'Establishment is under heavy raid. Come back later.',
            lockdownUntil: null,
            isGuestLockdown: false,
            featuredContentId: null,
            announcements: [],
            proxySources: FALLBACK_SOURCES,
            activityLog: [],

            init: async () => {
                const supabase = getSupabaseClient();
                if (!supabase) return;

                set({ isLoading: true });

                try {
                    // 1. Fetch App Settings
                    const { data: settings } = await supabase.from('app_settings').select('*').single();
                    if (settings) {
                        set({
                            isLocked: settings.is_locked,
                            lockdownMessage: settings.lockdown_message || 'Establishment is under heavy raid. Come back later.',
                            lockdownUntil: settings.lockdown_until,
                            isGuestLockdown: settings.is_guest_lockdown,
                            featuredContentId: settings.featured_content_id
                        });
                    }

                    // 2. Fetch Announcements
                    const { data: dbAnnouncements } = await supabase
                        .from('announcements')
                        .select('*')
                        .eq('is_active', true)
                        .order('created_at', { ascending: false });

                    if (dbAnnouncements) {
                        set({
                            announcements: dbAnnouncements.map((a: any) => ({
                                id: a.id,
                                message: a.message,
                                type: a.type as 'info' | 'warning' | 'danger',
                                active: a.is_active,
                                createdAt: new Date(a.created_at)
                            }))
                        });
                    }

                } catch (error) {
                    console.error('Failed to init admin store:', error);
                } finally {
                    set({ isLoading: false });
                }
            },

            subscribe: async () => {
                const supabase = getSupabaseClient();
                if (!supabase) return () => { };

                const channel = supabase.channel('admin_updates')
                    .on(
                        'postgres_changes',
                        { event: 'UPDATE', schema: 'public', table: 'app_settings', filter: 'id=eq.1' },
                        (payload: any) => {
                            const newSettings = payload.new;
                            set({
                                isLocked: newSettings.is_locked,
                                lockdownMessage: newSettings.lockdown_message,
                                lockdownUntil: newSettings.lockdown_until,
                                isGuestLockdown: newSettings.is_guest_lockdown,
                                featuredContentId: newSettings.featured_content_id
                            });
                        }
                    )
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table: 'announcements' },
                        async (payload: any) => {
                            // Refresh announcements on any change to ensure consistency
                            const { data: dbAnnouncements } = await supabase
                                .from('announcements')
                                .select('*')
                                .eq('is_active', true)
                                .order('created_at', { ascending: false });

                            if (dbAnnouncements) {
                                set({
                                    announcements: dbAnnouncements.map((a: any) => ({
                                        id: a.id,
                                        message: a.message,
                                        type: a.type as 'info' | 'warning' | 'danger',
                                        active: a.is_active,
                                        createdAt: new Date(a.created_at)
                                    }))
                                });
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            },

            checkAdminStatus: async () => {
                const supabase = getSupabaseClient();
                if (!supabase) return false;

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    set({ isAdmin: false });
                    return false;
                }

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                if (error || !profile?.is_admin) {
                    set({ isAdmin: false });
                    return false;
                }

                set({ isAdmin: true });
                return true;
            },

            logoutAdmin: async () => {
                const supabase = getSupabaseClient();
                if (supabase) {
                    await supabase.auth.signOut();
                }
                set({ isAdmin: false });
            },

            // Actions interacting with Supabase
            setLockdown: async (locked: boolean, message?: string, until?: Date | null) => {
                // Optimistic update
                set({
                    isLocked: locked,
                    lockdownMessage: message || get().lockdownMessage,
                    lockdownUntil: until || null
                });

                const supabase = getSupabaseClient();
                if (supabase && get().isAdmin) {
                    await supabase.from('app_settings').upsert({
                        id: 1, // Singleton row
                        is_locked: locked,
                        lockdown_message: message || get().lockdownMessage,
                        lockdown_until: until
                    });
                    get().logActivity('LOCKDOWN', `Site ${locked ? 'locked' : 'unlocked'}`);
                }
            },

            setGuestLockdown: async (locked: boolean) => {
                set({ isGuestLockdown: locked });
                const supabase = getSupabaseClient();
                if (supabase && get().isAdmin) {
                    await supabase.from('app_settings').upsert({
                        id: 1,
                        is_guest_lockdown: locked
                    });
                    get().logActivity('GUEST_LOCKDOWN', `Guest access ${locked ? 'restricted' : 'allowed'}`);
                }
            },

            setFeaturedContentId: async (id) => {
                set({ featuredContentId: id });
                const supabase = getSupabaseClient();
                if (supabase && get().isAdmin) {
                    await supabase.from('app_settings').upsert({
                        id: 1,
                        featured_content_id: id ? parseInt(id) : null
                    });
                }
            },

            addAnnouncement: async (message, type) => {
                const tempId = Math.random().toString(36).substring(7);
                const newAnnouncement: Announcement = {
                    id: tempId,
                    message,
                    type,
                    active: true,
                    createdAt: new Date(),
                };

                set((state) => ({ announcements: [newAnnouncement, ...state.announcements] }));

                const supabase = getSupabaseClient();
                if (supabase && get().isAdmin) {
                    const { data, error } = await supabase.from('announcements').insert({
                        message,
                        type,
                        is_active: true
                    }).select().single();

                    if (data && !error) {
                        // Update with real ID - functionality handled by subscription normally, 
                        // but we keep local update for immediate feedback if sub is slow
                        // Actually, let's rely on the subscription for the final state to avoid conflicts/dupes
                        // But we keep the optimistic update for UI responsiveness.

                        // The subscription will re-fetch properly.
                    }
                }
            },

            removeAnnouncement: async (id) => {
                set((state) => ({
                    announcements: state.announcements.filter((a) => a.id !== id),
                }));

                const supabase = getSupabaseClient();
                if (supabase && get().isAdmin) {
                    await supabase.from('announcements').update({ is_active: false }).eq('id', id);
                }
            },

            toggleProxySource: async (id) => {
                set((state) => ({
                    proxySources: state.proxySources.map((s) =>
                        s.id === id ? { ...s, enabled: !s.enabled } : s
                    ),
                }));
                // TODO: Wire this to Supabase when proxy_sources table is ready and populated
                const source = get().proxySources.find((s) => s.id === id);
                if (source) {
                    get().logActivity('PROXY_TOGGLED', `${source.name}: ${source.enabled ? 'Enabled' : 'Disabled'}`);
                }
            },

            logActivity: (action, details) => {
                console.log(`[Admin Activity] ${action}: ${details}`);
                set((state) => ({
                    activityLog: [
                        {
                            id: Math.random().toString(36).substring(7),
                            action,
                            details,
                            timestamp: new Date(),
                            adminId: 'current-user-id',
                        },
                        ...state.activityLog,
                    ].slice(0, 100),
                }));
            },

            clearActivityLog: () => set({ activityLog: [] }),
        }),
        {
            name: 'admin-storage',
            partialize: (state) => ({
                // Only persist activity log and maybe proxy sources locally for now
                activityLog: state.activityLog,
                proxySources: state.proxySources,
                // Do NOT persist lockdown/announcements as they should come from DB
            }),
        }
    )
);
