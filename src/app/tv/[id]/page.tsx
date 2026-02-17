import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Star, Calendar, Play, Plus, Share2, Download } from 'lucide-react';
import { getTVShowDetails, getSeasonDetails, getImageUrl, getBackdropUrl } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoPlayer } from '@/components/media/video-player';
import { DownloadDialog } from '@/components/media/download-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { VideoSource, Episode } from '@/types';

interface TVShowPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ season?: string; episode?: string }>;
}

import { getSources } from '@/lib/sources';

interface TVShowPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ season?: string; episode?: string }>;
}

export default async function TVShowPage({ params, searchParams }: TVShowPageProps) {
    const { id } = await params;
    const { season: seasonParam, episode: episodeParam } = await searchParams;

    const showId = parseInt(id, 10);
    if (isNaN(showId)) {
        notFound();
    }

    let show;
    try {
        show = await getTVShowDetails(showId);
    } catch {
        notFound();
    }

    // Parse season and episode from query params, default to S1E1
    const currentSeason = parseInt(seasonParam || '1', 10);
    const currentEpisode = parseInt(episodeParam || '1', 10);

    // Get episodes for the current season
    let episodes: Episode[] = [];
    try {
        const seasonData = await getSeasonDetails(showId, currentSeason);
        episodes = seasonData.episodes || [];
    } catch {
        episodes = [];
    }

    const sources = await getSources(id, 'tv', currentSeason, currentEpisode);
    const year = show.first_air_date ? new Date(show.first_air_date).getFullYear() : undefined;
    const currentEpisodeData = episodes.find(ep => ep.episode_number === currentEpisode);

    return (
        <div className="min-h-screen">
            {/* Backdrop */}
            <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[50vh] overflow-hidden">
                <Image
                    src={getBackdropUrl(show.backdrop_path)}
                    alt={show.name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="container relative mx-auto px-4 pt-20 md:pt-24">
                <div className="grid gap-6 md:gap-8 lg:grid-cols-[280px_1fr]">
                    {/* Mobile Header with Poster */}
                    <div className="flex gap-4 lg:hidden">
                        <div className="relative aspect-[2/3] w-28 flex-shrink-0 overflow-hidden rounded-lg shadow-xl">
                            <Image
                                src={getImageUrl(show.poster_path)}
                                alt={show.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="flex flex-col justify-end min-w-0">
                            {show.tagline && (
                                <p className="text-xs italic text-gray-400 line-clamp-1">&quot;{show.tagline}&quot;</p>
                            )}
                            <h1 className="text-lg font-bold text-white line-clamp-2">{show.name}</h1>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                                <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {show.vote_average.toFixed(1)}
                                </span>
                                <span>{year || 'N/A'}</span>
                                <span>{show.number_of_seasons}S</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {show.genres.slice(0, 2).map((genre) => (
                                    <Badge key={genre.id} variant="secondary" className="text-[10px] bg-white/10">
                                        {genre.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Poster */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24">
                            <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-2xl">
                                <Image
                                    src={getImageUrl(show.poster_path)}
                                    alt={show.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Desktop Title & Meta */}
                        <div className="hidden space-y-4 lg:block">
                            {show.tagline && (
                                <p className="text-sm italic text-gray-400">&quot;{show.tagline}&quot;</p>
                            )}
                            <h1 className="text-3xl font-bold text-white md:text-4xl">{show.name}</h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                                <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    {show.vote_average.toFixed(1)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {year || 'N/A'}
                                </span>
                                <span>{show.number_of_seasons} Seasons</span>
                                <span>{show.number_of_episodes} Episodes</span>
                                <Badge variant="secondary" className="bg-white/10">
                                    {show.status}
                                </Badge>
                            </div>

                            {/* Genres */}
                            <div className="flex flex-wrap gap-2">
                                {show.genres.map((genre) => (
                                    <Badge key={genre.id} variant="secondary" className="bg-white/10 text-gray-300">
                                        {genre.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Actions - Mobile-first responsive */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            <Button size="default" className="gap-2 bg-red-500 text-white hover:bg-red-600 flex-1 md:flex-none">
                                <Play className="h-4 w-4 fill-current" />
                                Watch Now
                            </Button>
                            <DownloadDialog
                                options={{
                                    tmdbId: showId,
                                    type: 'tv',
                                    title: show.name,
                                    year: year,
                                    season: currentSeason,
                                    episode: currentEpisode,
                                }}
                                trigger={
                                    <Button size="default" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 flex-1 md:flex-none">
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                }
                            />
                            <Button size="default" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hidden sm:flex">
                                <Plus className="h-4 w-4" />
                                Watchlist
                            </Button>
                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-10 w-10">
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Overview - hidden on mobile for space */}
                        <div className="hidden md:block space-y-2">
                            <h2 className="text-lg font-semibold text-white">Overview</h2>
                            <p className="leading-relaxed text-gray-300">{show.overview}</p>
                        </div>

                        {/* Current Episode */}
                        {currentEpisodeData && (
                            <div className="rounded-lg bg-white/5 p-3 md:p-4">
                                <p className="text-xs md:text-sm text-gray-400">Now Playing</p>
                                <p className="mt-1 text-sm md:text-lg font-semibold text-white">
                                    S{currentSeason}E{currentEpisode}: {currentEpisodeData.name}
                                </p>
                                {currentEpisodeData.overview && (
                                    <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-400 line-clamp-2">{currentEpisodeData.overview}</p>
                                )}
                            </div>
                        )}

                        {/* Video Player */}
                        <VideoPlayer
                            sources={sources}
                            title={`${show.name} S${currentSeason}E${currentEpisode}`}
                        />

                        {/* Season & Episode Selector */}
                        <div className="space-y-3 md:space-y-4">
                            <h2 className="text-base md:text-lg font-semibold text-white">Episodes</h2>

                            <Tabs defaultValue={`season-${currentSeason}`} className="w-full">
                                {/* Season tabs - horizontal scroll on mobile */}
                                <ScrollArea className="w-full pb-2">
                                    <TabsList className="mb-3 md:mb-4 h-auto inline-flex gap-2 bg-transparent p-0 w-max">
                                        {show.seasons
                                            .filter((s) => s.season_number > 0)
                                            .map((season) => (
                                                <TabsTrigger
                                                    key={season.id}
                                                    value={`season-${season.season_number}`}
                                                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm whitespace-nowrap data-[state=active]:border-red-500 data-[state=active]:bg-red-500/20"
                                                    asChild
                                                >
                                                    <a href={`/tv/${showId}?season=${season.season_number}&episode=1`}>
                                                        S{season.season_number}
                                                    </a>
                                                </TabsTrigger>
                                            ))}
                                    </TabsList>
                                </ScrollArea>

                                <TabsContent value={`season-${currentSeason}`}>
                                    <ScrollArea className="h-[300px] md:h-[400px] rounded-lg border border-white/10 bg-white/5">
                                        <div className="space-y-1 p-2">
                                            {episodes.map((episode) => (
                                                <div
                                                    key={episode.id}
                                                    className={`group rounded-lg p-2 md:p-3 transition-colors hover:bg-white/10 ${episode.episode_number === currentEpisode
                                                        ? 'bg-red-500/20 border border-red-500/50'
                                                        : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {/* Episode thumbnail */}
                                                        <a
                                                            href={`/tv/${showId}?season=${currentSeason}&episode=${episode.episode_number}`}
                                                            className="relative h-12 w-20 md:h-16 md:w-28 flex-shrink-0 overflow-hidden rounded bg-gray-800"
                                                        >
                                                            {episode.still_path && (
                                                                <Image
                                                                    src={getImageUrl(episode.still_path, 'w300')}
                                                                    alt={episode.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            )}
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                                <Play className="h-4 w-4 md:h-6 md:w-6 text-white" />
                                                            </div>
                                                        </a>

                                                        {/* Episode info */}
                                                        <a
                                                            href={`/tv/${showId}?season=${currentSeason}&episode=${episode.episode_number}`}
                                                            className="flex-1 min-w-0"
                                                        >
                                                            <p className="text-xs md:text-sm font-medium text-white line-clamp-1">
                                                                {episode.episode_number}. {episode.name}
                                                            </p>
                                                            {episode.overview && (
                                                                <p className="mt-0.5 md:mt-1 text-[10px] md:text-xs text-gray-400 line-clamp-1 md:line-clamp-2">
                                                                    {episode.overview}
                                                                </p>
                                                            )}
                                                            <div className="mt-0.5 md:mt-1 flex items-center gap-2 text-[10px] md:text-xs text-gray-500">
                                                                {episode.runtime && <span>{episode.runtime}m</span>}
                                                            </div>
                                                        </a>

                                                        {/* Download button for each episode */}
                                                        <DownloadDialog
                                                            options={{
                                                                tmdbId: showId,
                                                                type: 'tv',
                                                                title: show.name,
                                                                year: year,
                                                                season: currentSeason,
                                                                episode: episode.episode_number,
                                                            }}
                                                            trigger={
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 flex-shrink-0 p-0 opacity-60 md:opacity-0 group-hover:opacity-100"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
