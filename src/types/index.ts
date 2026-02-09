// Types for Movie, TV Show, and Episode data

export interface Movie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    popularity: number;
    adult: boolean;
    original_language: string;
    original_title: string;
}

export interface TVShow {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    genre_ids: number[];
    popularity: number;
    origin_country: string[];
    original_language: string;
    original_name: string;
}

export interface Episode {
    id: number;
    name: string;
    overview: string;
    air_date: string;
    episode_number: number;
    season_number: number;
    still_path: string | null;
    vote_average: number;
    vote_count: number;
    runtime: number | null;
}

export interface Season {
    id: number;
    name: string;
    overview: string;
    air_date: string;
    episode_count: number;
    poster_path: string | null;
    season_number: number;
    episodes?: Episode[];
}

export interface Genre {
    id: number;
    name: string;
}

export interface VideoSource {
    id: string;
    name: string;
    embedUrl: string;
    quality: '360p' | '480p' | '720p' | '1080p' | '4K' | 'unknown';
    language: string;
    isWorking: boolean;
    lastChecked: Date;
}

export interface MediaDetails extends Movie {
    genres: Genre[];
    runtime: number | null;
    status: string;
    tagline: string;
    budget: number;
    revenue: number;
    imdb_id: string | null;
    homepage: string | null;
    production_companies: { id: number; name: string; logo_path: string | null }[];
    production_countries: { iso_3166_1: string; name: string }[];
    spoken_languages: { iso_639_1: string; name: string }[];
    sources?: VideoSource[];
}

export interface TVShowDetails extends TVShow {
    genres: Genre[];
    episode_run_time: number[];
    status: string;
    tagline: string;
    type: string;
    seasons: Season[];
    number_of_episodes: number;
    number_of_seasons: number;
    created_by: { id: number; name: string; profile_path: string | null }[];
    networks: { id: number; name: string; logo_path: string | null }[];
    sources?: VideoSource[];
}

export interface SearchResult {
    page: number;
    results: (Movie | TVShow)[];
    total_pages: number;
    total_results: number;
}

export type MediaType = 'movie' | 'tv';

export interface WatchlistItem {
    id: number;
    type: MediaType;
    addedAt: Date;
}

export interface WatchHistory {
    id: number;
    type: MediaType;
    episodeId?: number;
    seasonNumber?: number;
    episodeNumber?: number;
    progress: number; // 0-100
    watchedAt: Date;
    genreIds?: number[];
    duration?: number; // total runtime in minutes
}

// Recommendation System Types
export type InteractionType = 'view' | 'watch_start' | 'watch_progress' | 'complete' | 'abandon' | 'add_watchlist' | 'remove_watchlist' | 'download' | 'search';

export interface ContentInteraction {
    id: number;
    type: MediaType;
    action: InteractionType;
    timestamp: Date;
    duration?: number; // seconds spent
    genreIds: number[];
    progress?: number; // 0-100 for watch actions
    title?: string;
}

export interface UserPreferences {
    // Genre preferences (genreId -> affinity score 0-100)
    genreAffinities: Record<number, number>;

    // Decade preferences ("2020s" -> score)
    decadePreferences: Record<string, number>;

    // Content type preference (0 = movies only, 100 = TV only, 50 = balanced)
    contentTypeBalance: number;

    // Average watch completion rate
    avgCompletionRate: number;

    // Preferred content length (in minutes)
    preferredLength: 'short' | 'medium' | 'long' | 'any';

    // Last 20 completed content IDs for similarity
    recentlyCompleted: { id: number; type: MediaType; genreIds: number[] }[];

    // Calculated at update time
    lastUpdated: Date;
}

export interface RecommendationScore {
    id: number;
    type: MediaType;
    score: number; // 0-100
    reasons: string[];
    genreMatch: number;
    popularityBoost: number;
    recencyBoost: number;
    similarityScore: number;
}
