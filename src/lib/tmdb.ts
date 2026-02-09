import type { Movie, TVShow, MediaDetails, TVShowDetails, SearchResult, Season } from '@/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Get API key from environment variable
const getApiKey = () => {
    const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!key) {
        console.warn('TMDB API key not configured. Set NEXT_PUBLIC_TMDB_API_KEY in .env.local');
    }
    return key || '';
};

// Helper to build image URLs
export const getImageUrl = (path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500') => {
    if (!path) return '/placeholder-poster.jpg';
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280') => {
    if (!path) return '/placeholder-backdrop.jpg';
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

// Fetch helper
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const apiKey = getApiKey();
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', apiKey);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });

    if (!res.ok) {
        throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

// Trending
export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> {
    const data = await tmdbFetch<{ results: Movie[] }>(`/trending/movie/${timeWindow}`);
    return data.results;
}

export async function getTrendingShows(timeWindow: 'day' | 'week' = 'week'): Promise<TVShow[]> {
    const data = await tmdbFetch<{ results: TVShow[] }>(`/trending/tv/${timeWindow}`);
    return data.results;
}

// Search
export async function searchMulti(query: string, page = 1): Promise<SearchResult> {
    return tmdbFetch<SearchResult>('/search/multi', { query, page: page.toString() });
}

export async function searchMovies(query: string, page = 1): Promise<SearchResult> {
    return tmdbFetch<SearchResult>('/search/movie', { query, page: page.toString() });
}

export async function searchTVShows(query: string, page = 1): Promise<SearchResult> {
    return tmdbFetch<SearchResult>('/search/tv', { query, page: page.toString() });
}

// Details
export async function getMovieDetails(id: number): Promise<MediaDetails> {
    return tmdbFetch<MediaDetails>(`/movie/${id}`);
}

export async function getTVShowDetails(id: number): Promise<TVShowDetails> {
    return tmdbFetch<TVShowDetails>(`/tv/${id}`);
}

export async function getSeasonDetails(showId: number, seasonNumber: number): Promise<Season> {
    return tmdbFetch<Season>(`/tv/${showId}/season/${seasonNumber}`);
}

// Discover
export async function discoverMovies(params: {
    sort_by?: string;
    with_genres?: string;
    year?: string;
    page?: number;
}): Promise<SearchResult> {
    const queryParams: Record<string, string> = {};
    if (params.sort_by) queryParams.sort_by = params.sort_by;
    if (params.with_genres) queryParams.with_genres = params.with_genres;
    if (params.year) queryParams.year = params.year;
    if (params.page) queryParams.page = params.page.toString();

    return tmdbFetch<SearchResult>('/discover/movie', queryParams);
}

export async function discoverTVShows(params: {
    sort_by?: string;
    with_genres?: string;
    first_air_date_year?: string;
    page?: number;
}): Promise<SearchResult> {
    const queryParams: Record<string, string> = {};
    if (params.sort_by) queryParams.sort_by = params.sort_by;
    if (params.with_genres) queryParams.with_genres = params.with_genres;
    if (params.first_air_date_year) queryParams.first_air_date_year = params.first_air_date_year;
    if (params.page) queryParams.page = params.page.toString();

    return tmdbFetch<SearchResult>('/discover/tv', queryParams);
}

// Get genre lists
export async function getMovieGenres(): Promise<{ genres: { id: number; name: string }[] }> {
    return tmdbFetch('/genre/movie/list');
}

export async function getTVGenres(): Promise<{ genres: { id: number; name: string }[] }> {
    return tmdbFetch('/genre/tv/list');
}

// === RECOMMENDATION ENDPOINTS ===

// Get TMDB recommendations based on a specific movie/show
export async function getMovieRecommendations(movieId: number, page = 1): Promise<Movie[]> {
    const data = await tmdbFetch<{ results: Movie[] }>(`/movie/${movieId}/recommendations`, { page: page.toString() });
    return data.results;
}

export async function getTVRecommendations(showId: number, page = 1): Promise<TVShow[]> {
    const data = await tmdbFetch<{ results: TVShow[] }>(`/tv/${showId}/recommendations`, { page: page.toString() });
    return data.results;
}

// Get similar content (based on keywords and genres)
export async function getSimilarMovies(movieId: number, page = 1): Promise<Movie[]> {
    const data = await tmdbFetch<{ results: Movie[] }>(`/movie/${movieId}/similar`, { page: page.toString() });
    return data.results;
}

export async function getSimilarTV(showId: number, page = 1): Promise<TVShow[]> {
    const data = await tmdbFetch<{ results: TVShow[] }>(`/tv/${showId}/similar`, { page: page.toString() });
    return data.results;
}

// Popular content
export async function getPopularMovies(page = 1): Promise<Movie[]> {
    const data = await tmdbFetch<{ results: Movie[] }>('/movie/popular', { page: page.toString() });
    return data.results;
}

export async function getPopularTV(page = 1): Promise<TVShow[]> {
    const data = await tmdbFetch<{ results: TVShow[] }>('/tv/popular', { page: page.toString() });
    return data.results;
}

// Top rated content
export async function getTopRatedMovies(page = 1): Promise<Movie[]> {
    const data = await tmdbFetch<{ results: Movie[] }>('/movie/top_rated', { page: page.toString() });
    return data.results;
}

export async function getTopRatedTV(page = 1): Promise<TVShow[]> {
    const data = await tmdbFetch<{ results: TVShow[] }>('/tv/top_rated', { page: page.toString() });
    return data.results;
}

// Now playing / On the air
export async function getNowPlayingMovies(page = 1): Promise<Movie[]> {
    const data = await tmdbFetch<{ results: Movie[] }>('/movie/now_playing', { page: page.toString() });
    return data.results;
}

export async function getOnTheAirTV(page = 1): Promise<TVShow[]> {
    const data = await tmdbFetch<{ results: TVShow[] }>('/tv/on_the_air', { page: page.toString() });
    return data.results;
}

// Upcoming / Airing today
export async function getUpcomingMovies(page = 1): Promise<Movie[]> {
    const data = await tmdbFetch<{ results: Movie[] }>('/movie/upcoming', { page: page.toString() });
    return data.results;
}

export async function getAiringTodayTV(page = 1): Promise<TVShow[]> {
    const data = await tmdbFetch<{ results: TVShow[] }>('/tv/airing_today', { page: page.toString() });
    return data.results;
}

// Get content by genre with additional filters
export async function getMoviesByGenre(genreId: number, sortBy = 'popularity.desc', page = 1): Promise<Movie[]> {
    const data = await tmdbFetch<{ results: Movie[] }>('/discover/movie', {
        with_genres: genreId.toString(),
        sort_by: sortBy,
        page: page.toString(),
    });
    return data.results;
}

export async function getTVByGenre(genreId: number, sortBy = 'popularity.desc', page = 1): Promise<TVShow[]> {
    const data = await tmdbFetch<{ results: TVShow[] }>('/discover/tv', {
        with_genres: genreId.toString(),
        sort_by: sortBy,
        page: page.toString(),
    });
    return data.results;
}

// High-rated undiscovered content (for "Hidden Gems" feature)
export async function getHiddenGemMovies(genreIds?: number[], page = 1): Promise<Movie[]> {
    const params: Record<string, string> = {
        sort_by: 'vote_average.desc',
        'vote_count.gte': '100',
        'vote_count.lte': '1000',
        'vote_average.gte': '7.5',
        page: page.toString(),
    };
    if (genreIds?.length) params.with_genres = genreIds.join(',');

    const data = await tmdbFetch<{ results: Movie[] }>('/discover/movie', params);
    return data.results;
}

export async function getHiddenGemTV(genreIds?: number[], page = 1): Promise<TVShow[]> {
    const params: Record<string, string> = {
        sort_by: 'vote_average.desc',
        'vote_count.gte': '50',
        'vote_count.lte': '500',
        'vote_average.gte': '7.5',
        page: page.toString(),
    };
    if (genreIds?.length) params.with_genres = genreIds.join(',');

    const data = await tmdbFetch<{ results: TVShow[] }>('/discover/tv', params);
    return data.results;
}
