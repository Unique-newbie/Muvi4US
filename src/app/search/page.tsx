import { Suspense } from 'react';
import { Search } from 'lucide-react';
import { searchMulti } from '@/lib/tmdb';
import { MediaCard } from '@/components/media/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Movie, TVShow } from '@/types';

interface SearchPageProps {
    searchParams: Promise<{ q?: string; page?: string }>;
}

function isMovie(item: Movie | TVShow): item is Movie {
    return 'title' in item;
}

async function SearchResults({ query, page }: { query: string; page: number }) {
    if (!query) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="mb-4 h-16 w-16 text-gray-600" />
                <h2 className="text-xl font-semibold text-white">Search for movies & TV shows</h2>
                <p className="mt-2 text-gray-400">Enter a title in the search bar above</p>
            </div>
        );
    }

    const results = await searchMulti(query, page);

    // Filter to only movies and TV shows
    const items = results.results.filter(
        (item): item is Movie | TVShow =>
            ('title' in item || 'name' in item) && ('poster_path' in item)
    );

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="mb-4 h-16 w-16 text-gray-600" />
                <h2 className="text-xl font-semibold text-white">No results found</h2>
                <p className="mt-2 text-gray-400">
                    Try searching for something else or check your spelling
                </p>
            </div>
        );
    }

    return (
        <div>
            <p className="mb-6 text-sm text-gray-400">
                Found {results.total_results.toLocaleString()} results for &quot;{query}&quot;
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {items.map((item) => (
                    <MediaCard
                        key={item.id}
                        item={item}
                        type={isMovie(item) ? 'movie' : 'tv'}
                    />
                ))}
            </div>

            {/* Pagination */}
            {results.total_pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    {page > 1 && (
                        <a
                            href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition-colors hover:bg-white/20"
                        >
                            Previous
                        </a>
                    )}
                    <span className="flex items-center px-4 text-sm text-gray-400">
                        Page {page} of {results.total_pages}
                    </span>
                    {page < results.total_pages && (
                        <a
                            href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
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

function SearchSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[2/3] rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            ))}
        </div>
    );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q: query = '', page: pageStr = '1' } = await searchParams;
    const page = Math.max(1, parseInt(pageStr, 10) || 1);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Search</h1>
                {query && (
                    <p className="mt-2 text-gray-400">
                        Results for: <span className="text-white">&quot;{query}&quot;</span>
                    </p>
                )}
            </div>

            {/* Search Form */}
            <form action="/search" method="get" className="mb-8">
                <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="search"
                        name="q"
                        defaultValue={query}
                        placeholder="Search for movies, TV shows, anime..."
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                </div>
            </form>

            {/* Results */}
            <Suspense fallback={<SearchSkeleton />}>
                <SearchResults query={query} page={page} />
            </Suspense>
        </div>
    );
}
