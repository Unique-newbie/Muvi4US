import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Star, Calendar, Clock, Play, Plus, Share2, ChevronDown, Download } from 'lucide-react';
import { getMovieDetails, getImageUrl, getBackdropUrl } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from '@/components/media/video-player';
import { DownloadDialog } from '@/components/media/download-dialog';
import type { VideoSource } from '@/types';

interface MoviePageProps {
    params: Promise<{ id: string }>;
}

import { getSources } from '@/lib/sources';

interface MoviePageProps {
    params: Promise<{ id: string }>;
}

export default async function MoviePage({ params }: MoviePageProps) {
    const { id } = await params;
    const movieId = parseInt(id, 10);

    if (isNaN(movieId)) {
        notFound();
    }

    let movie;
    try {
        movie = await getMovieDetails(movieId);
    } catch {
        notFound();
    }

    const sources = await getSources(id, 'movie');
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
    const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';

    return (
        <div className="min-h-screen">
            {/* Backdrop */}
            <div className="absolute inset-x-0 top-0 h-[50vh] md:h-[60vh] overflow-hidden">
                <Image
                    src={getBackdropUrl(movie.backdrop_path)}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="container relative mx-auto px-4 pt-24 md:pt-32">
                <div className="grid gap-6 md:gap-8 lg:grid-cols-[300px_1fr]">
                    {/* Mobile Poster - shown on small screens */}
                    <div className="flex gap-4 lg:hidden">
                        <div className="relative aspect-[2/3] w-32 flex-shrink-0 overflow-hidden rounded-lg shadow-xl">
                            <Image
                                src={getImageUrl(movie.poster_path)}
                                alt={movie.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="flex flex-col justify-end">
                            {movie.tagline && (
                                <p className="text-xs italic text-gray-400 line-clamp-1">&quot;{movie.tagline}&quot;</p>
                            )}
                            <h1 className="text-xl font-bold text-white line-clamp-2">{movie.title}</h1>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                                <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {movie.vote_average.toFixed(1)}
                                </span>
                                <span>{year || 'N/A'}</span>
                                <span>{runtime}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {movie.genres.slice(0, 3).map((genre) => (
                                    <Badge key={genre.id} variant="secondary" className="text-[10px] bg-white/10">
                                        {genre.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Poster - hidden on mobile */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24">
                            <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-2xl">
                                <Image
                                    src={getImageUrl(movie.poster_path)}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-5 md:space-y-6">
                        {/* Desktop Title & Meta - hidden on mobile */}
                        <div className="hidden space-y-4 lg:block">
                            {movie.tagline && (
                                <p className="text-sm italic text-gray-400">&quot;{movie.tagline}&quot;</p>
                            )}
                            <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                                {movie.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                                <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    {movie.vote_average.toFixed(1)} ({movie.vote_count.toLocaleString()} votes)
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {year || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {runtime}
                                </span>
                            </div>

                            {/* Genres */}
                            <div className="flex flex-wrap gap-2">
                                {movie.genres.map((genre) => (
                                    <Badge key={genre.id} variant="secondary" className="bg-white/10 text-gray-300">
                                        {genre.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Actions - responsive sizing */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-2">
                            <Button size="default" className="gap-2 bg-red-500 text-white hover:bg-red-600 flex-1 md:flex-none md:size-lg">
                                <Play className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                                <span className="md:inline">Watch Now</span>
                            </Button>
                            <DownloadDialog
                                options={{
                                    tmdbId: movieId,
                                    type: 'movie',
                                    title: movie.title,
                                    year: year,
                                }}
                                trigger={
                                    <Button size="default" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 flex-1 md:flex-none">
                                        <Download className="h-4 w-4 md:h-5 md:w-5" />
                                        <span className="md:inline">Download</span>
                                    </Button>
                                }
                            />
                            <Button size="default" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hidden sm:flex">
                                <Plus className="h-4 w-4 md:h-5 md:w-5" />
                                Watchlist
                            </Button>
                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-10 w-10">
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Overview */}
                        <div className="space-y-2">
                            <h2 className="text-base md:text-lg font-semibold text-white">Overview</h2>
                            <p className="text-sm md:text-base leading-relaxed text-gray-300">{movie.overview}</p>
                        </div>

                        {/* Video Player */}
                        <div className="space-y-3 md:space-y-4 pt-2 md:pt-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base md:text-lg font-semibold text-white">Watch {movie.title}</h2>
                                <Button variant="ghost" size="sm" className="gap-1 text-gray-400 text-xs md:text-sm">
                                    <ChevronDown className="h-4 w-4" />
                                    More Sources
                                </Button>
                            </div>
                            <VideoPlayer
                                sources={sources}
                                title={movie.title}
                                tmdbId={id}
                                type="movie"
                                year={year}
                            />
                        </div>

                        {/* Additional Info */}
                        <div className="grid gap-4 md:gap-6 border-t border-white/10 pt-4 md:pt-6 sm:grid-cols-2">
                            <div>
                                <h3 className="mb-2 text-xs md:text-sm font-medium text-gray-400">Production Companies</h3>
                                <div className="flex flex-wrap gap-2">
                                    {movie.production_companies.slice(0, 3).map((company) => (
                                        <Badge key={company.id} variant="outline" className="border-white/20 text-gray-300 text-xs">
                                            {company.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-2 text-xs md:text-sm font-medium text-gray-400">Spoken Languages</h3>
                                <div className="flex flex-wrap gap-2">
                                    {movie.spoken_languages.map((lang) => (
                                        <Badge key={lang.iso_639_1} variant="outline" className="border-white/20 text-gray-300 text-xs">
                                            {lang.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
