import { Suspense } from 'react';
import { Film } from 'lucide-react';
import { discoverMovies, getMovieGenres } from '@/lib/tmdb';
import { MediaCard } from '@/components/media/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { Movie } from '@/types';

interface MoviesPageProps {
    searchParams: Promise<{ page?: string; genre?: string }>;
}

async function MovieResults({ page, genreId }: { page: number; genreId?: string }) {
    const results = await discoverMovies({
        sort_by: 'popularity.desc',
        with_genres: genreId,
        page,
    });

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {(results.results as Movie[]).map((movie) => (
                    <MediaCard key={movie.id} item={movie} type="movie" />
                ))}
            </div>

            {/* Pagination */}
            {results.total_pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    {page > 1 && (
                        <a
                            href={`/movies?page=${page - 1}${genreId ? `&genre=${genreId}` : ''}`}
                            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
                        >
                            Previous
                        </a>
                    )}
                    <span className="flex items-center px-4 text-sm text-gray-400">
                        Page {page} of {Math.min(results.total_pages, 500)}
                    </span>
                    {page < Math.min(results.total_pages, 500) && (
                        <a
                            href={`/movies?page=${page + 1}${genreId ? `&genre=${genreId}` : ''}`}
                            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
                        >
                            Next
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

function MoviesSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[2/3] rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            ))}
        </div>
    );
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
    const { page: pageStr = '1', genre } = await searchParams;
    const page = Math.max(1, parseInt(pageStr, 10) || 1);

    const { genres } = await getMovieGenres();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
                    <Film className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">Movies</h1>
            </div>

            {/* Genre Filter */}
            <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                    <a href="/movies">
                        <Badge
                            variant={!genre ? 'default' : 'secondary'}
                            className={!genre ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}
                        >
                            All
                        </Badge>
                    </a>
                    {genres.map((g) => (
                        <a key={g.id} href={`/movies?genre=${g.id}`}>
                            <Badge
                                variant={genre === String(g.id) ? 'default' : 'secondary'}
                                className={
                                    genre === String(g.id)
                                        ? 'bg-red-500 text-white'
                                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }
                            >
                                {g.name}
                            </Badge>
                        </a>
                    ))}
                </div>
            </div>

            {/* Results */}
            <Suspense fallback={<MoviesSkeleton />}>
                <MovieResults page={page} genreId={genre} />
            </Suspense>
        </div>
    );
}
