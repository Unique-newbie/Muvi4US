'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Trash2, Film, Tv, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/app-store';
import { getMovieDetails, getTVShowDetails } from '@/lib/tmdb';
import type { Movie, TVShow } from '@/types';

interface WatchlistItemWithDetails {
    id: number;
    type: 'movie' | 'tv';
    addedAt: Date;
    details: Movie | TVShow | null;
}

export default function WatchlistPage() {
    const { watchlist, removeFromWatchlist } = useAppStore();
    const [items, setItems] = useState<WatchlistItemWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDetails() {
            setLoading(true);
            const itemsWithDetails = await Promise.all(
                watchlist.map(async (item) => {
                    try {
                        const details = item.type === 'movie'
                            ? await getMovieDetails(item.id)
                            : await getTVShowDetails(item.id);
                        return { ...item, details };
                    } catch {
                        return { ...item, details: null };
                    }
                })
            );
            setItems(itemsWithDetails);
            setLoading(false);
        }

        fetchDetails();
    }, [watchlist]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-4 md:py-8">
                <h1 className="mb-4 md:mb-8 text-xl md:text-3xl font-bold text-white">My Watchlist</h1>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-white/10" />
                    ))}
                </div>
            </div>
        );
    }

    if (watchlist.length === 0) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 md:mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <Bookmark className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <h1 className="mb-2 md:mb-4 text-xl md:text-3xl font-bold text-white">Your Watchlist is Empty</h1>
                <p className="mb-6 md:mb-8 max-w-md text-sm md:text-base text-gray-400">
                    Start adding movies and TV shows to your watchlist to keep track of what you want to watch.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button asChild className="bg-red-600 hover:bg-red-700">
                        <Link href="/movies">
                            <Film className="mr-2 h-4 w-4" />
                            Browse Movies
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white/20">
                        <Link href="/tv">
                            <Tv className="mr-2 h-4 w-4" />
                            Browse TV Shows
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-4 md:py-8">
            <div className="mb-4 md:mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-white">My Watchlist</h1>
                    <p className="mt-0.5 md:mt-1 text-xs md:text-base text-gray-400">{watchlist.length} items saved</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {items.map((item) => {
                    if (!item.details) {
                        return (
                            <div key={`${item.type}-${item.id}`} className="relative aspect-[2/3] rounded-lg bg-white/5 p-4">
                                <AlertCircle className="mx-auto mb-2 h-6 w-6 md:h-8 md:w-8 text-gray-500" />
                                <p className="text-center text-xs text-gray-500">Failed to load</p>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute right-1 top-1 h-7 w-7 p-0 text-red-500 hover:bg-red-500/20"
                                    onClick={() => removeFromWatchlist(item.id, item.type)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        );
                    }

                    const title = 'title' in item.details ? item.details.title : item.details.name;
                    const date = 'release_date' in item.details ? item.details.release_date : item.details.first_air_date;
                    const year = date ? new Date(date).getFullYear() : null;
                    const posterPath = item.details.poster_path;

                    return (
                        <div
                            key={`${item.type}-${item.id}`}
                            className="group relative overflow-hidden rounded-lg bg-white/5 transition-transform hover:scale-105"
                        >
                            <Link href={`/${item.type === 'movie' ? 'movie' : 'tv'}/${item.id}`}>
                                <div className="aspect-[2/3]">
                                    {posterPath ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                                            alt={title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-gray-800">
                                            {item.type === 'movie' ? (
                                                <Film className="h-8 w-8 md:h-12 md:w-12 text-gray-600" />
                                            ) : (
                                                <Tv className="h-8 w-8 md:h-12 md:w-12 text-gray-600" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Always visible info on mobile, hover on desktop */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 md:p-3 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                                    <h3 className="line-clamp-1 text-[10px] md:text-sm font-medium text-white">{title}</h3>
                                    <div className="mt-0.5 flex items-center gap-1 md:gap-2">
                                        {year && <span className="text-[8px] md:text-xs text-gray-400">{year}</span>}
                                        <Badge variant="secondary" className="text-[8px] md:text-[10px] px-1 py-0 h-4">
                                            {item.type === 'movie' ? 'Movie' : 'TV'}
                                        </Badge>
                                    </div>
                                </div>
                            </Link>
                            {/* Remove button - always visible on mobile */}
                            <Button
                                size="sm"
                                variant="ghost"
                                className="absolute right-1 top-1 h-6 w-6 md:h-8 md:w-8 bg-black/50 p-0 text-red-500 md:opacity-0 backdrop-blur-sm transition-opacity hover:bg-red-500/20 md:group-hover:opacity-100"
                                onClick={(e) => {
                                    e.preventDefault();
                                    removeFromWatchlist(item.id, item.type);
                                }}
                            >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
