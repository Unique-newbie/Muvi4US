'use client';

import { useEffect, useState } from 'react';
import { HeroBanner } from './hero-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/app-store';
import { scoreContent } from '@/lib/recommendation-engine';
import { getTrendingMovies, getTrendingShows } from '@/lib/tmdb';
import type { Movie, TVShow, MediaType, UserPreferences } from '@/types';

interface ScoredItem {
    item: Movie | TVShow;
    type: MediaType;
    score: number;
}

/**
 * Time-of-day content preference
 * Based on viewing pattern research:
 * - Morning: Light, feel-good content
 * - Afternoon: Mixed content
 * - Evening/Night: Action, thriller, drama
 * - Weekend: Comedy, family
 */
function getTimeOfDayPreference(): number[] {
    const hour = new Date().getHours();
    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;

    // Comedy (35), Family (10751), Animation (16)
    if (isWeekend) {
        return [35, 10751, 16];
    }

    // Morning (6-12): Drama (18), Romance (10749)
    if (hour >= 6 && hour < 12) {
        return [18, 10749, 35];
    }

    // Afternoon (12-18): Adventure (12), Action (28)
    if (hour >= 12 && hour < 18) {
        return [12, 28, 878];
    }

    // Evening/Night (18-6): Thriller (53), Horror (27), Crime (80)
    return [53, 27, 80, 28];
}

/**
 * Score hero candidates based on user preferences + time of day
 */
function scoreHeroCandidate(
    item: Movie | TVShow,
    type: MediaType,
    preferences: UserPreferences | null,
    timeGenres: number[]
): number {
    let score = 0;

    // Base score from recommendation engine (if user has preferences)
    if (preferences && Object.keys(preferences.genreAffinities).length > 0) {
        const recScore = scoreContent(item, type, preferences);
        score += recScore.score * 0.6; // 60% weight for user preference
    } else {
        // New user - use popularity and rating
        score += (item.vote_average / 10) * 40;
        score += Math.min(item.popularity / 100, 40);
    }

    // Time of day bonus (20% weight)
    const itemGenres = item.genre_ids || [];
    const timeMatch = itemGenres.filter(g => timeGenres.includes(g)).length;
    score += timeMatch * 10;

    // High rating bonus
    if (item.vote_average >= 7.5) {
        score += 10;
    }

    // Has backdrop bonus (important for hero)
    if (item.backdrop_path) {
        score += 5;
    }

    // Good overview length (for display)
    if (item.overview && item.overview.length > 100 && item.overview.length < 400) {
        score += 5;
    }

    return Math.min(100, Math.max(0, score));
}

export function SmartHeroBanner() {
    const [heroItem, setHeroItem] = useState<{ item: Movie | TVShow; type: MediaType } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { userPreferences, watchHistory } = useAppStore();

    useEffect(() => {
        async function selectSmartHero() {
            setIsLoading(true);

            try {
                // 1. Check for Admin Featured Content
                const { featuredContentId } = await import('@/lib/admin-store').then(m => m.useAdminStore.getState());
                const { getMovieDetails, getTVShowDetails } = await import('@/lib/tmdb');

                if (featuredContentId) {
                    try {
                        try {
                            const movie = await getMovieDetails(parseInt(featuredContentId));
                            if (movie) {
                                setHeroItem({ item: movie, type: 'movie' });
                                setIsLoading(false);
                                return;
                            }
                        } catch (e) {
                            // Only ignore 404s, but here we just catch all and try TV
                        }

                        try {
                            const show = await getTVShowDetails(parseInt(featuredContentId));
                            if (show) {
                                setHeroItem({ item: show, type: 'tv' });
                                setIsLoading(false);
                                return;
                            }
                        } catch (e) {
                            console.warn('Featured content ID not found', featuredContentId);
                        }
                    } catch (err) {
                        console.error('Error fetching featured content', err);
                    }
                }

                // 2. Fallback to Smart Selection (Existing Logic)
                const [movies, shows] = await Promise.all([
                    getTrendingMovies().catch(() => []),
                    getTrendingShows().catch(() => []),
                ]);

                // Get time of day preference
                const timeGenres = getTimeOfDayPreference();

                // Score all candidates
                const candidates: ScoredItem[] = [];

                // Filter out recently watched from hero selection
                const recentlyWatchedIds = new Set(
                    watchHistory.slice(0, 10).map(h => `${h.type}-${h.id}`)
                );

                movies.forEach((movie: Movie) => {
                    if (!recentlyWatchedIds.has(`movie-${movie.id}`) && movie.backdrop_path) {
                        candidates.push({
                            item: movie,
                            type: 'movie',
                            score: scoreHeroCandidate(movie, 'movie', userPreferences, timeGenres),
                        });
                    }
                });

                shows.forEach((show: TVShow) => {
                    if (!recentlyWatchedIds.has(`tv-${show.id}`) && show.backdrop_path) {
                        candidates.push({
                            item: show,
                            type: 'tv',
                            score: scoreHeroCandidate(show, 'tv', userPreferences, timeGenres),
                        });
                    }
                });

                // Sort by score and pick the best
                candidates.sort((a, b) => b.score - a.score);

                if (candidates.length > 0) {
                    // Add small random factor to top 5 for variety
                    const topCandidates = candidates.slice(0, 5);
                    const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];
                    setHeroItem({ item: selected.item, type: selected.type });
                }
            } catch (error) {
                console.error('Error selecting smart hero:', error);
            } finally {
                setIsLoading(false);
            }
        }

        selectSmartHero();
    }, [userPreferences, watchHistory]);

    if (isLoading || !heroItem) {
        return (
            <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
                <Skeleton className="absolute inset-0 bg-gray-800" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="container relative mx-auto flex h-full items-end px-4 pb-16 md:items-center md:pb-0">
                    <div className="max-w-2xl space-y-4">
                        <Skeleton className="h-6 w-32 bg-gray-700" />
                        <Skeleton className="h-12 w-96 bg-gray-700" />
                        <Skeleton className="h-20 w-full bg-gray-700" />
                        <div className="flex gap-3">
                            <Skeleton className="h-12 w-36 bg-gray-700" />
                            <Skeleton className="h-12 w-36 bg-gray-700" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <HeroBanner item={heroItem.item} type={heroItem.type} />;
}
