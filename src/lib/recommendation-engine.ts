/**
 * Netflix-Style Recommendation Engine
 * 
 * Combines multiple signals to generate personalized content recommendations:
 * - Genre affinity matching (35%)
 * - Popularity boost (20%)
 * - Recency boost (15%)
 * - Similarity to watched content (20%)
 * - Serendipity factor (10%)
 */

import type { Movie, TVShow, MediaType, UserPreferences, RecommendationScore } from '@/types';
import {
    getMovieRecommendations,
    getTVRecommendations,
    getSimilarMovies,
    getSimilarTV,
    getMoviesByGenre,
    getTVByGenre,
    getHiddenGemMovies,
    getHiddenGemTV,
    getTrendingMovies,
    getTrendingShows,
    getPopularMovies,
    getPopularTV,
    getTopRatedMovies,
    getTopRatedTV,
} from './tmdb';

// Scoring weights
const WEIGHTS = {
    genreMatch: 0.35,
    popularity: 0.20,
    recency: 0.15,
    similarity: 0.20,
    serendipity: 0.10,
};

// Genre name mapping (TMDB genre IDs)
export const GENRE_NAMES: Record<number, string> = {
    // Movie genres
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
    // TV genres
    10759: 'Action & Adventure',
    10762: 'Kids',
    10763: 'News',
    10764: 'Reality',
    10765: 'Sci-Fi & Fantasy',
    10766: 'Soap',
    10767: 'Talk',
    10768: 'War & Politics',
};

// Calculate genre match score
function calculateGenreScore(itemGenres: number[], preferences: UserPreferences): number {
    if (!itemGenres.length) return 50;

    let totalScore = 0;
    let matchCount = 0;

    itemGenres.forEach((genreId) => {
        const affinity = preferences.genreAffinities[genreId];
        if (affinity !== undefined) {
            totalScore += affinity;
            matchCount++;
        }
    });

    if (matchCount === 0) return 50; // neutral score for unknown genres
    return Math.round(totalScore / matchCount);
}

// Calculate popularity boost (log scale normalization)
function calculatePopularityBoost(popularity: number): number {
    // TMDB popularity ranges from ~0 to ~10000+
    // Normalize to 0-100 using log scale
    return Math.min(100, Math.round(Math.log10(popularity + 1) * 25));
}

// Calculate recency boost based on release date
function calculateRecencyBoost(releaseDate: string | undefined): number {
    if (!releaseDate) return 50;

    const release = new Date(releaseDate);
    const now = new Date();
    const monthsAgo = (now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsAgo < 1) return 100; // Brand new
    if (monthsAgo < 3) return 90;
    if (monthsAgo < 6) return 80;
    if (monthsAgo < 12) return 70;
    if (monthsAgo < 24) return 60;
    if (monthsAgo < 60) return 50;
    return 40; // Older content
}

// Calculate similarity to recently watched content
function calculateSimilarityScore(
    itemGenres: number[],
    recentlyCompleted: { genreIds: number[] }[]
): number {
    if (!recentlyCompleted.length || !itemGenres.length) return 50;

    // Count how many genres overlap with recently watched
    const recentGenres = new Set<number>();
    recentlyCompleted.forEach((item) => {
        item.genreIds.forEach((g) => recentGenres.add(g));
    });

    const overlap = itemGenres.filter((g) => recentGenres.has(g)).length;
    const overlapRatio = overlap / itemGenres.length;

    return Math.round(overlapRatio * 100);
}

// Add random serendipity factor for discovery
function calculateSerendipityBonus(genreScore: number): number {
    // Higher bonus for content outside comfort zone
    const explorationFactor = 100 - genreScore;
    return Math.round(explorationFactor * 0.3 + Math.random() * 20);
}

// Get release date from movie or TV show
function getReleaseDate(item: Movie | TVShow): string {
    return 'release_date' in item ? item.release_date : item.first_air_date;
}

// Main scoring function
export function scoreContent(
    item: Movie | TVShow,
    type: MediaType,
    preferences: UserPreferences
): RecommendationScore {
    const genreIds = item.genre_ids || [];
    const releaseDate = getReleaseDate(item);

    const genreMatch = calculateGenreScore(genreIds, preferences);
    const popularityBoost = calculatePopularityBoost(item.popularity);
    const recencyBoost = calculateRecencyBoost(releaseDate);
    const similarityScore = calculateSimilarityScore(genreIds, preferences.recentlyCompleted);
    const serendipityBonus = calculateSerendipityBonus(genreMatch);

    // Weighted score
    const score = Math.round(
        genreMatch * WEIGHTS.genreMatch +
        popularityBoost * WEIGHTS.popularity +
        recencyBoost * WEIGHTS.recency +
        similarityScore * WEIGHTS.similarity +
        serendipityBonus * WEIGHTS.serendipity
    );

    // Generate reason strings
    const reasons: string[] = [];
    if (genreMatch >= 70) {
        const matchingGenres = genreIds
            .filter((g) => (preferences.genreAffinities[g] || 0) >= 60)
            .map((g) => GENRE_NAMES[g])
            .filter(Boolean);
        if (matchingGenres.length) {
            reasons.push(`Matches your taste in ${matchingGenres.slice(0, 2).join(' & ')}`);
        }
    }
    if (recencyBoost >= 80) reasons.push('Recently released');
    if (popularityBoost >= 70) reasons.push('Trending now');
    if (similarityScore >= 60) reasons.push('Similar to shows you loved');

    return {
        id: item.id,
        type,
        score: Math.min(100, Math.max(0, score)),
        reasons,
        genreMatch,
        popularityBoost,
        recencyBoost,
        similarityScore,
    };
}

// Score and sort a list of items
export function scoreAndSort<T extends Movie | TVShow>(
    items: T[],
    type: MediaType,
    preferences: UserPreferences
): (T & { recommendation: RecommendationScore })[] {
    return items
        .map((item) => ({
            ...item,
            recommendation: scoreContent(item, type, preferences),
        }))
        .sort((a, b) => b.recommendation.score - a.recommendation.score);
}

// === RECOMMENDATION GENERATORS ===

// Get personalized "For You" recommendations
export async function getForYouRecommendations(
    preferences: UserPreferences,
    recentlyWatchedIds: { id: number; type: MediaType }[],
    limit = 20
): Promise<{ movies: Movie[]; shows: TVShow[] }> {
    const topGenres = Object.entries(preferences.genreAffinities)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id]) => parseInt(id));

    // Parallel fetch from multiple sources
    const [
        genreMovies,
        genreShows,
        trendingMovies,
        trendingShows,
    ] = await Promise.all([
        topGenres.length > 0
            ? getMoviesByGenre(topGenres[0]).catch(() => [])
            : Promise.resolve([]),
        topGenres.length > 0
            ? getTVByGenre(topGenres[0]).catch(() => [])
            : Promise.resolve([]),
        getTrendingMovies().catch(() => []),
        getTrendingShows().catch(() => []),
    ]);

    // Combine and dedupe
    const allMovies = [...genreMovies, ...trendingMovies];
    const allShows = [...genreShows, ...trendingShows];

    const uniqueMovies = Array.from(new Map(allMovies.map((m) => [m.id, m])).values());
    const uniqueShows = Array.from(new Map(allShows.map((s) => [s.id, s])).values());

    // Exclude recently watched
    const watchedIds = new Set(recentlyWatchedIds.map((w) => `${w.type}-${w.id}`));
    const filteredMovies = uniqueMovies.filter((m) => !watchedIds.has(`movie-${m.id}`));
    const filteredShows = uniqueShows.filter((s) => !watchedIds.has(`tv-${s.id}`));

    // Score and sort
    const scoredMovies = scoreAndSort(filteredMovies, 'movie', preferences);
    const scoredShows = scoreAndSort(filteredShows, 'tv', preferences);

    return {
        movies: scoredMovies.slice(0, limit),
        shows: scoredShows.slice(0, limit),
    };
}

// Get "Because You Watched" recommendations
export async function getBecauseYouWatched(
    watchedItem: { id: number; type: MediaType; title: string },
    preferences: UserPreferences,
    limit = 10
): Promise<{ items: (Movie | TVShow)[]; title: string }> {
    const recommendations = watchedItem.type === 'movie'
        ? await getMovieRecommendations(watchedItem.id).catch(() => [])
        : await getTVRecommendations(watchedItem.id).catch(() => []);

    if (!recommendations.length) {
        // Fallback to similar content
        const similar: (Movie | TVShow)[] = watchedItem.type === 'movie'
            ? await getSimilarMovies(watchedItem.id).catch(() => [])
            : await getSimilarTV(watchedItem.id).catch(() => []);

        const scored = scoreAndSort(similar as (Movie | TVShow)[], watchedItem.type, preferences);
        return {
            items: scored.slice(0, limit),
            title: `Because You Watched ${watchedItem.title}`,
        };
    }

    const scored = scoreAndSort(recommendations as (Movie | TVShow)[], watchedItem.type, preferences);
    return {
        items: scored.slice(0, limit),
        title: `Because You Watched ${watchedItem.title}`,
    };
}

// Get "Trending in [Genre]" recommendations
export async function getTrendingInGenre(
    genreId: number,
    type: MediaType,
    preferences: UserPreferences,
    limit = 10
): Promise<{ items: (Movie | TVShow)[]; title: string }> {
    const genreName = GENRE_NAMES[genreId] || 'Your Favorites';

    const items: (Movie | TVShow)[] = type === 'movie'
        ? await getMoviesByGenre(genreId).catch(() => [])
        : await getTVByGenre(genreId).catch(() => []);

    const scored = scoreAndSort(items as (Movie | TVShow)[], type, preferences);

    return {
        items: scored.slice(0, limit),
        title: `Trending in ${genreName}`,
    };
}

// Get "Hidden Gems" recommendations
export async function getHiddenGems(
    preferences: UserPreferences,
    limit = 10
): Promise<{ movies: Movie[]; shows: TVShow[] }> {
    const topGenres = Object.entries(preferences.genreAffinities)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([id]) => parseInt(id));

    const [movies, shows] = await Promise.all([
        getHiddenGemMovies(topGenres).catch(() => []),
        getHiddenGemTV(topGenres).catch(() => []),
    ]);

    const scoredMovies = scoreAndSort(movies, 'movie', preferences);
    const scoredShows = scoreAndSort(shows, 'tv', preferences);

    return {
        movies: scoredMovies.slice(0, limit),
        shows: scoredShows.slice(0, limit),
    };
}

// Get match percentage for display (e.g., "95% Match")
export function getMatchPercentage(
    item: Movie | TVShow,
    type: MediaType,
    preferences: UserPreferences
): number {
    const score = scoreContent(item, type, preferences);
    return score.score;
}

// Get recommendation reason for display
export function getRecommendationReason(
    item: Movie | TVShow,
    type: MediaType,
    preferences: UserPreferences
): string {
    const score = scoreContent(item, type, preferences);
    return score.reasons[0] || 'Popular choice';
}
