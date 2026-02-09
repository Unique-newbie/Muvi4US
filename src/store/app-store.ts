import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    MediaType,
    WatchlistItem,
    WatchHistory,
    Movie,
    TVShow,
    ContentInteraction,
    UserPreferences,
    InteractionType
} from '@/types';

// Default user preferences
const defaultPreferences: UserPreferences = {
    genreAffinities: {},
    decadePreferences: {},
    contentTypeBalance: 50,
    avgCompletionRate: 0,
    preferredLength: 'any',
    recentlyCompleted: [],
    lastUpdated: new Date(),
};

// Genre weights for different actions
const ACTION_WEIGHTS: Record<InteractionType, number> = {
    'complete': 10,
    'watch_progress': 5,
    'watch_start': 3,
    'add_watchlist': 4,
    'download': 6,
    'view': 1,
    'abandon': -3,
    'remove_watchlist': -2,
    'search': 2,
};

interface AppState {
    // Theme
    theme: 'dark' | 'light';
    setTheme: (theme: 'dark' | 'light') => void;

    // User Session
    user: any | null; // using any to avoid circular deps or complex type imports for now, or import User from supabase-js
    setUser: (user: any | null) => void;

    // Watchlist
    watchlist: WatchlistItem[];
    addToWatchlist: (id: number, type: MediaType, genreIds?: number[]) => void;
    removeFromWatchlist: (id: number, type: MediaType) => void;
    isInWatchlist: (id: number, type: MediaType) => boolean;

    // Watch History
    watchHistory: WatchHistory[];
    addToHistory: (item: Omit<WatchHistory, 'watchedAt'>) => void;
    getProgress: (id: number, type: MediaType, episodeId?: number) => number;
    clearWatchHistory: () => void;
    getContinueWatching: () => WatchHistory[];

    // Search
    recentSearches: string[];
    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;

    // Trending cache
    trendingMovies: Movie[];
    trendingShows: TVShow[];
    setTrendingMovies: (movies: Movie[]) => void;
    setTrendingShows: (shows: TVShow[]) => void;

    // User Behavior Tracking (NEW)
    contentInteractions: ContentInteraction[];
    userPreferences: UserPreferences;
    trackInteraction: (interaction: Omit<ContentInteraction, 'timestamp'>) => void;
    updatePreferences: () => void;
    getGenreAffinity: (genreId: number) => number;
    getTopGenres: (count?: number) => number[];
    markAsCompleted: (id: number, type: MediaType, genreIds: number[], title?: string) => void;
    markAsAbandoned: (id: number, type: MediaType, genreIds: number[]) => void;
    syncWithSupabase: (userId: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Theme
            theme: 'dark',
            setTheme: (theme) => set({ theme }),

            // User Session
            user: null,
            setUser: (user) => set({ user }),

            // Watchlist
            watchlist: [],
            addToWatchlist: (id, type, genreIds = []) => {
                const exists = get().watchlist.some((item) => item.id === id && item.type === type);
                if (!exists) {
                    set((state) => ({
                        watchlist: [...state.watchlist, { id, type, addedAt: new Date() }],
                    }));
                    // Track interaction
                    get().trackInteraction({ id, type, action: 'add_watchlist', genreIds });
                }
            },
            removeFromWatchlist: (id, type) => {
                const item = get().watchlist.find((item) => item.id === id && item.type === type);
                if (item) {
                    set((state) => ({
                        watchlist: state.watchlist.filter((item) => !(item.id === id && item.type === type)),
                    }));
                    // Track negative interaction
                    get().trackInteraction({ id, type, action: 'remove_watchlist', genreIds: [] });
                }
            },
            isInWatchlist: (id, type) => {
                return get().watchlist.some((item) => item.id === id && item.type === type);
            },

            // Watch History
            watchHistory: [],
            addToHistory: (item) => {
                set((state) => {
                    const filtered = state.watchHistory.filter(
                        (h) => !(h.id === item.id && h.type === item.type && h.episodeId === item.episodeId)
                    );
                    return {
                        watchHistory: [{ ...item, watchedAt: new Date() }, ...filtered].slice(0, 100),
                    };
                });

                // Track watch interaction
                if (item.progress > 0) {
                    const action: InteractionType = item.progress >= 90 ? 'complete' :
                        item.progress < 20 ? 'watch_start' : 'watch_progress';
                    get().trackInteraction({
                        id: item.id,
                        type: item.type,
                        action,
                        genreIds: item.genreIds || [],
                        progress: item.progress
                    });
                }
            },
            getProgress: (id, type, episodeId) => {
                const entry = get().watchHistory.find(
                    (h) => h.id === id && h.type === type && h.episodeId === episodeId
                );
                return entry?.progress ?? 0;
            },
            clearWatchHistory: () => set({ watchHistory: [] }),

            getContinueWatching: () => {
                return get().watchHistory
                    .filter((h) => h.progress > 5 && h.progress < 95)
                    .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
                    .slice(0, 20);
            },

            // Search
            recentSearches: [],
            addRecentSearch: (query) => {
                if (!query.trim()) return;
                set((state) => {
                    const filtered = state.recentSearches.filter((s) => s !== query);
                    return { recentSearches: [query, ...filtered].slice(0, 10) };
                });
            },
            clearRecentSearches: () => set({ recentSearches: [] }),

            // Trending cache
            trendingMovies: [],
            trendingShows: [],
            setTrendingMovies: (movies) => set({ trendingMovies: movies }),
            setTrendingShows: (shows) => set({ trendingShows: shows }),

            // User Behavior Tracking
            contentInteractions: [],
            userPreferences: defaultPreferences,

            trackInteraction: (interaction) => {
                const newInteraction: ContentInteraction = {
                    ...interaction,
                    timestamp: new Date(),
                };

                set((state) => ({
                    contentInteractions: [newInteraction, ...state.contentInteractions].slice(0, 500),
                }));

                // Update preferences after tracking
                get().updatePreferences();
            },

            updatePreferences: () => {
                const { contentInteractions, watchHistory } = get();
                const genreScores: Record<number, number> = {};
                const decadeScores: Record<string, number> = {};
                let movieCount = 0;
                let tvCount = 0;
                let totalCompletion = 0;
                let completedCount = 0;

                // Process interactions
                contentInteractions.forEach((interaction) => {
                    const weight = ACTION_WEIGHTS[interaction.action] || 0;

                    // Update genre scores
                    interaction.genreIds.forEach((genreId) => {
                        genreScores[genreId] = (genreScores[genreId] || 50) + weight;
                    });

                    // Track content type preference
                    if (interaction.action === 'complete' || interaction.action === 'watch_progress') {
                        if (interaction.type === 'movie') movieCount++;
                        else tvCount++;
                    }

                    // Track completion
                    if (interaction.action === 'complete') {
                        completedCount++;
                        totalCompletion += 100;
                    } else if (interaction.progress) {
                        completedCount++;
                        totalCompletion += interaction.progress;
                    }
                });

                // Normalize genre scores to 0-100
                Object.keys(genreScores).forEach((key) => {
                    const genreId = parseInt(key);
                    genreScores[genreId] = Math.max(0, Math.min(100, genreScores[genreId]));
                });

                // Calculate content type balance
                const total = movieCount + tvCount;
                const contentTypeBalance = total > 0 ? Math.round((tvCount / total) * 100) : 50;

                // Calculate average completion rate
                const avgCompletionRate = completedCount > 0 ? Math.round(totalCompletion / completedCount) : 0;

                // Get recently completed
                const recentlyCompleted = watchHistory
                    .filter((h) => h.progress >= 90)
                    .slice(0, 20)
                    .map((h) => ({ id: h.id, type: h.type, genreIds: h.genreIds || [] }));

                set({
                    userPreferences: {
                        genreAffinities: genreScores,
                        decadePreferences: decadeScores,
                        contentTypeBalance,
                        avgCompletionRate,
                        preferredLength: 'any',
                        recentlyCompleted,
                        lastUpdated: new Date(),
                    },
                });
            },

            getGenreAffinity: (genreId) => {
                return get().userPreferences.genreAffinities[genreId] ?? 50;
            },

            getTopGenres: (count = 5) => {
                const affinities = get().userPreferences.genreAffinities;
                return Object.entries(affinities)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, count)
                    .map(([id]) => parseInt(id));
            },

            markAsCompleted: (id, type, genreIds, title) => {
                get().trackInteraction({ id, type, action: 'complete', genreIds, title });
            },

            markAsAbandoned: (id, type, genreIds) => {
                get().trackInteraction({ id, type, action: 'abandon', genreIds });
            },

            syncWithSupabase: async (userId: string) => {
                const supabase = await import('@/lib/supabase').then(m => m.getSupabaseClient());
                if (!supabase) return;

                const state = get();
                const { watchlist, watchHistory, userPreferences } = state;

                // 1. Sync Watchlist
                const { data: remoteWatchlist } = await supabase
                    .from('watchlist')
                    .select('media_id, media_type, added_at');

                if (remoteWatchlist) {
                    // Merge: Combine local and remote, de-dupe by id+type
                    const combinedWatchlist = [...watchlist];
                    const localSet = new Set(watchlist.map(i => `${i.type}-${i.id}`));

                    const newFromRemote = remoteWatchlist
                        .filter((i: { media_type: string; media_id: number }) => !localSet.has(`${i.media_type}-${i.media_id}`))
                        .map((i: { media_id: number; media_type: string; added_at: string }) => ({
                            id: i.media_id,
                            type: i.media_type as MediaType,
                            addedAt: new Date(i.added_at)
                        }));

                    if (newFromRemote.length > 0) {
                        combinedWatchlist.push(...newFromRemote);
                    }

                    // Upload local items that aren't in remote
                    // Simple strategy: Upsert all local items to remote to be safe
                    const upsertData = combinedWatchlist.map(i => ({
                        user_id: userId,
                        media_id: i.id,
                        media_type: i.type,
                        added_at: i.addedAt.toISOString(),
                        genre_ids: [] // We don't strictly track genre_ids in watchlist item type yet
                    }));

                    if (upsertData.length > 0) {
                        await supabase.from('watchlist').upsert(upsertData, { onConflict: 'user_id, media_id, media_type' });
                    }

                    set({ watchlist: combinedWatchlist });
                }

                // 2. Sync History
                const { data: remoteHistory } = await supabase
                    .from('watch_history')
                    .select('*');

                if (remoteHistory) {
                    // Merge strategy: Keep the one with higher progress or more recent watchedAt
                    const historyMap = new Map<string, WatchHistory>();

                    // Add local first
                    watchHistory.forEach(h => {
                        historyMap.set(`${h.type}-${h.id}-${h.episodeId || '0'}`, h);
                    });

                    // Merge remote
                    remoteHistory.forEach((rh: any) => {
                        const key = `${rh.media_type}-${rh.media_id}-${rh.episode_id || '0'}`;
                        const existing = historyMap.get(key);
                        const remoteItem: WatchHistory = {
                            id: rh.media_id,
                            type: rh.media_type as MediaType,
                            episodeId: rh.episode_id,
                            progress: rh.progress,
                            watchedAt: new Date(rh.watched_at),
                            genreIds: typeof rh.genre_ids === 'string' ? JSON.parse(rh.genre_ids) : rh.genre_ids,
                            duration: rh.duration,
                        };

                        if (!existing || new Date(remoteItem.watchedAt) > new Date(existing.watchedAt)) {
                            historyMap.set(key, remoteItem);
                        }
                    });

                    const mergedHistory = Array.from(historyMap.values())
                        .sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())
                        .slice(0, 100);

                    // Upload merged history to remote
                    const historyUpserts = mergedHistory.map(h => ({
                        user_id: userId,
                        media_id: h.id,
                        media_type: h.type,
                        episode_id: h.episodeId,
                        progress: h.progress,
                        duration: h.duration,
                        watched_at: h.watchedAt.toISOString(),
                        genre_ids: h.genreIds
                    }));

                    if (historyUpserts.length > 0) {
                        await supabase.from('watch_history').upsert(historyUpserts, { onConflict: 'user_id, media_id, media_type, episode_id' });
                    }

                    set({ watchHistory: mergedHistory });
                }

                // 3. Sync Preferences
                const { data: remoteProfile } = await supabase
                    .from('profiles')
                    .select('preferences')
                    .eq('id', userId)
                    .single();

                if (remoteProfile && remoteProfile.preferences) {
                    const remotePrefs = remoteProfile.preferences as UserPreferences;
                    // Start with local, assume it might be fresher if lastUpdated is newer
                    const localIsNewer = new Date(userPreferences.lastUpdated) > new Date(remotePrefs.lastUpdated || 0);

                    if (!localIsNewer && Object.keys(remotePrefs).length > 0) {
                        // Remote is newer, take it
                        set({ userPreferences: remotePrefs });
                    } else {
                        // Local is newer, push to remote
                        await supabase.from('profiles').update({
                            preferences: userPreferences,
                            updated_at: new Date().toISOString()
                        }).eq('id', userId);
                    }
                }
            },
        }),
        {
            name: 'muvi4us-storage',
            partialize: (state) => ({
                theme: state.theme,
                watchlist: state.watchlist,
                watchHistory: state.watchHistory,
                recentSearches: state.recentSearches,
                contentInteractions: state.contentInteractions,
                userPreferences: state.userPreferences,
            }),
        }
    )
);
