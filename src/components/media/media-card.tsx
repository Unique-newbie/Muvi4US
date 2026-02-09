'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/tmdb';
import type { Movie, TVShow, MediaType } from '@/types';

interface MediaCardProps {
    item: Movie | TVShow;
    type: MediaType;
    priority?: boolean;
}

function isMovie(item: Movie | TVShow): item is Movie {
    return 'title' in item;
}

export function MediaCard({ item, type, priority = false }: MediaCardProps) {
    const title = isMovie(item) ? item.title : item.name;
    const releaseDate = isMovie(item) ? item.release_date : item.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    const href = `/${type}/${item.id}`;

    return (
        <Link href={href} className="group block">
            <Card className="relative overflow-hidden border-0 bg-transparent transition-transform duration-300 hover:scale-105">
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-800">
                    <Image
                        src={getImageUrl(item.poster_path)}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-all duration-300 group-hover:brightness-75"
                        priority={priority}
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/90 text-white transition-transform duration-300 group-hover:scale-110">
                            <Play className="h-6 w-6 fill-current" />
                        </div>
                    </div>

                    {/* Rating Badge */}
                    {item.vote_average > 0 && (
                        <Badge className="absolute left-2 top-2 gap-1 bg-black/70 text-xs font-semibold text-white backdrop-blur-sm">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {item.vote_average.toFixed(1)}
                        </Badge>
                    )}

                    {/* Type Badge */}
                    <Badge className="absolute right-2 top-2 bg-red-500/90 text-xs font-semibold uppercase text-white">
                        {type === 'movie' ? 'Movie' : 'TV'}
                    </Badge>
                </div>

                {/* Info */}
                <div className="mt-3 px-1">
                    <h3 className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-red-400">
                        {title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-400">{year}</p>
                </div>
            </Card>
        </Link>
    );
}
