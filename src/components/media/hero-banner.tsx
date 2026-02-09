'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Star, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBackdropUrl } from '@/lib/tmdb';
import type { Movie, TVShow, MediaType } from '@/types';

interface HeroBannerProps {
    item: Movie | TVShow;
    type: MediaType;
}

function isMovie(item: Movie | TVShow): item is Movie {
    return 'title' in item;
}

export function HeroBanner({ item, type }: HeroBannerProps) {
    const title = isMovie(item) ? item.title : item.name;
    const releaseDate = isMovie(item) ? item.release_date : item.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

    return (
        <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={getBackdropUrl(item.backdrop_path)}
                    alt={title}
                    fill
                    className="object-cover"
                    priority
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="container relative mx-auto flex h-full items-end px-4 pb-16 md:items-center md:pb-0">
                <div className="max-w-2xl space-y-4">
                    {/* Type Badge */}
                    <Badge className="bg-red-500/90 text-sm uppercase tracking-wide text-white">
                        {type === 'movie' ? 'Featured Movie' : 'Featured Series'}
                    </Badge>

                    {/* Title */}
                    <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                        {title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                        {year && <span>{year}</span>}
                        {item.vote_average > 0 && (
                            <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                {item.vote_average.toFixed(1)}
                            </span>
                        )}
                    </div>

                    {/* Overview */}
                    <p className="line-clamp-3 text-base text-gray-300 md:text-lg">
                        {item.overview}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Link href={`/${type}/${item.id}`}>
                            <Button
                                size="lg"
                                className="gap-2 bg-red-500 text-white hover:bg-red-600"
                            >
                                <Play className="h-5 w-5 fill-current" />
                                Watch Now
                            </Button>
                        </Link>
                        <Link href={`/${type}/${item.id}`}>
                            <Button
                                size="lg"
                                variant="outline"
                                className="gap-2 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                            >
                                <Info className="h-5 w-5" />
                                More Info
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="ghost"
                            className="gap-2 text-white hover:bg-white/10"
                        >
                            <Plus className="h-5 w-5" />
                            Watchlist
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
