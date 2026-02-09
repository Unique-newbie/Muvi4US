'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { MediaRow } from './media-row';
import { getImageUrl } from '@/lib/tmdb';
import {
    getForYouRecommendations,
    getBecauseYouWatched,
    getTrendingInGenre,
    getHiddenGems,
    getMatchPercentage,
    GENRE_NAMES,
} from '@/lib/recommendation-engine';
import type { Movie, TVShow, UserPreferences } from '@/types';
import Link from 'next/link';
import { Play, Clock, Sparkles, TrendingUp, Gem } from 'lucide-react';

// Continue Watching Row Component
function ContinueWatchingRow() {
    const { watchHistory, getContinueWatching } = useAppStore();
    const continueWatching = getContinueWatching();

    if (continueWatching.length === 0) return null;

    return (
        <section className="px-4 md:px-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white md:text-2xl">
                <Clock className="h-5 w-5 text-yellow-500" />
                Continue Watching
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {continueWatching.map((item) => (
                    <Link
                        key={`${item.type}-${item.id}-${item.episodeId || ''}`}
                        href={`/${item.type}/${item.id}`}
                        className="group relative flex-shrink-0"
                    >
                        <div className="relative h-32 w-56 overflow-hidden rounded-lg bg-gray-800">
                            {/* Progress bar */}
                            <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-gray-700">
                                <div
                                    className="h-full bg-red-500 transition-all"
                                    style={{ width: `${item.progress}%` }}
                                />
                            </div>
                            {/* Overlay */}
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                <Play className="h-12 w-12 text-white" fill="white" />
                            </div>
                            {/* Episode info */}
                            {item.seasonNumber && item.episodeNumber && (
                                <div className="absolute bottom-2 left-2 z-10 rounded bg-black/70 px-2 py-1 text-xs text-white">
                                    S{item.seasonNumber} E{item.episodeNumber}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

// Top Picks For You Row
function TopPicksRow({
    movies,
    shows,
    preferences
}: {
    movies: Movie[];
    shows: TVShow[];
    preferences: UserPreferences;
}) {
    // Interleave movies and shows, preferring user's content type balance
    const combined = [...movies, ...shows]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 20);

    if (combined.length === 0) return null;

    return (
        <section className="px-4 md:px-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white md:text-2xl">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Top Picks For You
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {combined.map((item) => {
                    const isMovie = 'title' in item;
                    const type = isMovie ? 'movie' : 'tv';
                    const title = isMovie ? item.title : item.name;
                    const matchPercent = getMatchPercentage(item, type, preferences);

                    return (
                        <Link
                            key={`${type}-${item.id}`}
                            href={`/${type}/${item.id}`}
                            className="group relative flex-shrink-0"
                        >
                            <div className="relative h-64 w-44 overflow-hidden rounded-lg">
                                <img
                                    src={getImageUrl(item.poster_path, 'w300')}
                                    alt={title}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                {/* Match percentage */}
                                <div className="absolute left-2 top-2 rounded bg-green-600 px-2 py-1 text-xs font-bold text-white">
                                    {matchPercent}% Match
                                </div>
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="line-clamp-2 text-sm font-medium text-white">{title}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

// Because You Watched Row
function BecauseYouWatchedRow({
    sourceTitle,
    items,
    type,
    preferences,
}: {
    sourceTitle: string;
    items: (Movie | TVShow)[];
    type: 'movie' | 'tv';
    preferences: UserPreferences;
}) {
    if (items.length === 0) return null;

    return (
        <section className="px-4 md:px-8">
            <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">
                Because You Watched <span className="text-red-500">{sourceTitle}</span>
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {items.map((item) => {
                    const isMovie = 'title' in item;
                    const itemType = isMovie ? 'movie' : 'tv';
                    const title = isMovie ? item.title : item.name;
                    const matchPercent = getMatchPercentage(item, itemType, preferences);

                    return (
                        <Link
                            key={`${itemType}-${item.id}`}
                            href={`/${itemType}/${item.id}`}
                            className="group relative flex-shrink-0"
                        >
                            <div className="relative h-56 w-40 overflow-hidden rounded-lg">
                                <img
                                    src={getImageUrl(item.poster_path, 'w300')}
                                    alt={title}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                {matchPercent >= 80 && (
                                    <div className="absolute left-2 top-2 rounded bg-green-600 px-2 py-1 text-xs font-bold text-white">
                                        {matchPercent}% Match
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="line-clamp-2 text-sm font-medium text-white">{title}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

// Trending In Genre Row
function TrendingInGenreRow({
    genreId,
    items,
    preferences
}: {
    genreId: number;
    items: (Movie | TVShow)[];
    preferences: UserPreferences;
}) {
    const genreName = GENRE_NAMES[genreId] || 'Your Favorites';

    if (items.length === 0) return null;

    return (
        <section className="px-4 md:px-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white md:text-2xl">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Trending in {genreName}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {items.slice(0, 15).map((item, index) => {
                    const isMovie = 'title' in item;
                    const type = isMovie ? 'movie' : 'tv';
                    const title = isMovie ? item.title : item.name;

                    return (
                        <Link
                            key={`${type}-${item.id}`}
                            href={`/${type}/${item.id}`}
                            className="group relative flex-shrink-0"
                        >
                            <div className="relative h-56 w-40 overflow-hidden rounded-lg">
                                {/* Rank number */}
                                {index < 10 && (
                                    <div className="absolute -left-1 bottom-8 z-20 text-6xl font-black text-white drop-shadow-lg" style={{ textShadow: '2px 2px 0 #000, -2px 2px 0 #000' }}>
                                        {index + 1}
                                    </div>
                                )}
                                <img
                                    src={getImageUrl(item.poster_path, 'w300')}
                                    alt={title}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="line-clamp-2 text-sm font-medium text-white">{title}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

// Hidden Gems Row
function HiddenGemsRow({
    movies,
    shows,
    preferences,
}: {
    movies: Movie[];
    shows: TVShow[];
    preferences: UserPreferences;
}) {
    const combined = [...movies, ...shows].slice(0, 15);

    if (combined.length === 0) return null;

    return (
        <section className="px-4 md:px-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white md:text-2xl">
                <Gem className="h-5 w-5 text-cyan-500" />
                Hidden Gems For You
            </h2>
            <p className="mb-4 text-sm text-gray-400">
                Highly rated content you might have missed
            </p>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {combined.map((item) => {
                    const isMovie = 'title' in item;
                    const type = isMovie ? 'movie' : 'tv';
                    const title = isMovie ? item.title : item.name;

                    return (
                        <Link
                            key={`${type}-${item.id}`}
                            href={`/${type}/${item.id}`}
                            className="group relative flex-shrink-0"
                        >
                            <div className="relative h-56 w-40 overflow-hidden rounded-lg">
                                <img
                                    src={getImageUrl(item.poster_path, 'w300')}
                                    alt={title}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                {/* Rating badge */}
                                <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-yellow-500/90 px-2 py-1 text-xs font-bold text-black">
                                    ★ {item.vote_average.toFixed(1)}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                    <p className="line-clamp-2 text-sm font-medium text-white">{title}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

// Main Personalized Rows Component
export function PersonalizedRows() {
    const { userPreferences, watchHistory, contentInteractions } = useAppStore();
    const [forYouData, setForYouData] = useState<{ movies: Movie[]; shows: TVShow[] }>({ movies: [], shows: [] });
    const [becauseYouWatched, setBecauseYouWatched] = useState<{ items: (Movie | TVShow)[]; title: string } | null>(null);
    const [trendingGenre, setTrendingGenre] = useState<{ items: (Movie | TVShow)[]; genreId: number } | null>(null);
    const [hiddenGems, setHiddenGems] = useState<{ movies: Movie[]; shows: TVShow[] }>({ movies: [], shows: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadRecommendations() {
            setIsLoading(true);

            try {
                // Get recently watched for filtering
                const recentlyWatched = watchHistory.slice(0, 20).map((h) => ({ id: h.id, type: h.type }));

                // Parallel fetch all recommendation types
                const [forYou, gems] = await Promise.all([
                    getForYouRecommendations(userPreferences, recentlyWatched),
                    getHiddenGems(userPreferences),
                ]);

                setForYouData(forYou);
                setHiddenGems(gems);

                // Get "Because You Watched" from most recent completed item
                const lastCompleted = contentInteractions.find(
                    (i) => i.action === 'complete' && i.title
                );
                if (lastCompleted) {
                    const becauseData = await getBecauseYouWatched(
                        { id: lastCompleted.id, type: lastCompleted.type, title: lastCompleted.title || '' },
                        userPreferences
                    );
                    setBecauseYouWatched(becauseData);
                }

                // Get trending in top genre
                const topGenres = Object.entries(userPreferences.genreAffinities)
                    .sort(([, a], [, b]) => b - a)
                    .map(([id]) => parseInt(id));

                if (topGenres.length > 0) {
                    const trending = await getTrendingInGenre(
                        topGenres[0],
                        'movie',
                        userPreferences
                    );
                    setTrendingGenre({ items: trending.items, genreId: topGenres[0] });
                }
            } catch (error) {
                console.error('Failed to load recommendations:', error);
            }

            setIsLoading(false);
        }

        loadRecommendations();
    }, [userPreferences, watchHistory, contentInteractions]);

    if (isLoading) {
        return (
            <div className="space-y-8 py-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="px-4 md:px-8">
                        <div className="mb-4 h-8 w-48 animate-pulse rounded bg-gray-800" />
                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map((j) => (
                                <div key={j} className="h-56 w-40 flex-shrink-0 animate-pulse rounded-lg bg-gray-800" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Continue Watching - Always first if available */}
            <ContinueWatchingRow />

            {/* Top Picks For You */}
            {(forYouData.movies.length > 0 || forYouData.shows.length > 0) && (
                <TopPicksRow
                    movies={forYouData.movies}
                    shows={forYouData.shows}
                    preferences={userPreferences}
                />
            )}

            {/* Because You Watched */}
            {becauseYouWatched && becauseYouWatched.items.length > 0 && (
                <BecauseYouWatchedRow
                    sourceTitle={becauseYouWatched.title.replace('Because You Watched ', '')}
                    items={becauseYouWatched.items}
                    type="movie"
                    preferences={userPreferences}
                />
            )}

            {/* Trending in Genre */}
            {trendingGenre && trendingGenre.items.length > 0 && (
                <TrendingInGenreRow
                    genreId={trendingGenre.genreId}
                    items={trendingGenre.items}
                    preferences={userPreferences}
                />
            )}

            {/* Hidden Gems */}
            {(hiddenGems.movies.length > 0 || hiddenGems.shows.length > 0) && (
                <HiddenGemsRow
                    movies={hiddenGems.movies}
                    shows={hiddenGems.shows}
                    preferences={userPreferences}
                />
            )}
        </div>
    );
}
