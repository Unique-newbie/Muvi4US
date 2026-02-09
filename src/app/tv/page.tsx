import { Suspense } from 'react';
import { Tv } from 'lucide-react';
import { discoverTVShows, getTVGenres } from '@/lib/tmdb';
import { MediaCard } from '@/components/media/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { TVShow } from '@/types';

interface TVPageProps {
    searchParams: Promise<{ page?: string; genre?: string }>;
}

async function TVResults({ page, genreId }: { page: number; genreId?: string }) {
    const results = await discoverTVShows({
        sort_by: 'popularity.desc',
        with_genres: genreId,
        page,
    });

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {(results.results as TVShow[]).map((show) => (
                    <MediaCard key={show.id} item={show} type="tv" />
                ))}
            </div>

            {/* Pagination */}
            {results.total_pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    {page > 1 && (
                        <a
                            href={`/tv?page=${page - 1}${genreId ? `&genre=${genreId}` : ''}`}
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
                            href={`/tv?page=${page + 1}${genreId ? `&genre=${genreId}` : ''}`}
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

function TVSkeleton() {
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

export default async function TVPage({ searchParams }: TVPageProps) {
    const { page: pageStr = '1', genre } = await searchParams;
    const page = Math.max(1, parseInt(pageStr, 10) || 1);

    const { genres } = await getTVGenres();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                    <Tv className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">TV Shows</h1>
            </div>

            {/* Genre Filter */}
            <div className="mb-8">
                <div className="flex flex-wrap gap-2">
                    <a href="/tv">
                        <Badge
                            variant={!genre ? 'default' : 'secondary'}
                            className={!genre ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}
                        >
                            All
                        </Badge>
                    </a>
                    {genres.map((g) => (
                        <a key={g.id} href={`/tv?genre=${g.id}`}>
                            <Badge
                                variant={genre === String(g.id) ? 'default' : 'secondary'}
                                className={
                                    genre === String(g.id)
                                        ? 'bg-purple-500 text-white'
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
            <Suspense fallback={<TVSkeleton />}>
                <TVResults page={page} genreId={genre} />
            </Suspense>
        </div>
    );
}
