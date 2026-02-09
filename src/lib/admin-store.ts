import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabaseClient } from '@/lib/supabase';

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
    adminId: string; // Added adminId to track who performed the action
}

interface ProxySource {
    id: string;
    name: string;
    priority: number;
    enabled: boolean;
}

interface AdminState {
    // Auth
    isAdmin: boolean;
    checkAdminStatus: () => Promise<boolean>;
    logoutAdmin: () => Promise<void>;

    // Site Lockdown
    isLocked: boolean;
    lockdownMessage: string;
    lockdownUntil: Date | null;
    isGuestLockdown: boolean; // New: Restrict access for non-logged-in users only

    // Featured Content Control
    featuredContentId: string | null; // TMDB ID to PIN to hero
    setFeaturedContentId: (id: string | null) => void;

    // Announcements
    announcements: Announcement[];
    addAnnouncement: (message: string, type: 'info' | 'warning' | 'danger') => void;
    removeAnnouncement: (id: string) => void;

    // Proxy Management
    proxySources: ProxySource[];
    toggleProxySource: (id: string) => void;

    // Activity Log
    activityLog: ActivityLog[];
    logActivity: (action: string, details: string) => void;
    clearActivityLog: () => void;

    // Actions
    setLockdown: (locked: boolean, message?: string, until?: Date | null) => void;
    setGuestLockdown: (locked: boolean) => void;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            // Auth
            isAdmin: false,

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

            // Site Lockdown
            isLocked: false,
            lockdownMessage: 'Establishment is under heavy raid. Come back later.', // Pirate themed
            lockdownUntil: null,
            isGuestLockdown: false,

            // Featured Content
            featuredContentId: null,
            setFeaturedContentId: (id) => set({ featuredContentId: id }),

            // Announcements
            announcements: [],

            // Proxy Management
            proxySources: [
                { id: 'vidsrc', name: 'VidSrc', priority: 1, enabled: true },
                { id: 'superembed', name: 'SuperEmbed', priority: 2, enabled: true },
                { id: '2embed', name: '2Embed', priority: 3, enabled: false },
            ],

            // Activity Log
            activityLog: [],

            // Actions
            setLockdown: (locked, message, until) => {
                set({
                    isLocked: locked,
                    lockdownMessage: message || get().lockdownMessage,
                    lockdownUntil: until || null
                });
                get().logActivity('LOCKDOWN', `Site ${locked ? 'locked' : 'unlocked'}`);
            },

            setGuestLockdown: (locked) => {
                set({ isGuestLockdown: locked });
                get().logActivity('GUEST_LOCKDOWN', `Guest access ${locked ? 'restricted' : 'allowed'}`);
            },

            addAnnouncement: (message, type) => set((state) => ({
                announcements: [
                    {
                        id: Math.random().toString(36).substring(7),
                        message,
                        type,
                        active: true,
                        createdAt: new Date(),
                    },
                    ...state.announcements,
                ],
            })),

            removeAnnouncement: (id) => set((state) => ({
                announcements: state.announcements.filter((a) => a.id !== id),
            })),

            toggleProxySource: (id) => {
                set((state) => ({
                    proxySources: state.proxySources.map((s) =>
                        s.id === id ? { ...s, enabled: !s.enabled } : s
                    ),
                }));
                const source = get().proxySources.find((s) => s.id === id);
                if (source) {
                    get().logActivity('PROXY_TOGGLED', `${source.name}: ${source.enabled ? 'Enabled' : 'Disabled'}`);
                }
            },

            logActivity: (action, details) => {
                // In a real app, you would log this to the DB
                console.log(`[Admin Activity] ${action}: ${details}`);
                set((state) => ({
                    activityLog: [
                        {
                            id: Math.random().toString(36).substring(7),
                            action,
                            details,
                            timestamp: new Date(),
                            adminId: 'current-user-id', // Placeholder, ideally get from auth
                        },
                        ...state.activityLog,
                    ].slice(0, 100), // Keep last 100 actions
                }));
            },

            clearActivityLog: () => set({ activityLog: [] }),
        }),
        {
            name: 'admin-storage',
            partialize: (state) => ({
                isLocked: state.isLocked,
                lockdownMessage: state.lockdownMessage,
                lockdownUntil: state.lockdownUntil,
                isGuestLockdown: state.isGuestLockdown,
                featuredContentId: state.featuredContentId,
                announcements: state.announcements,
                proxySources: state.proxySources,
                activityLog: state.activityLog,
                // Don't persist isAdmin for security, re-check on load
            }),
        }
    )
);
