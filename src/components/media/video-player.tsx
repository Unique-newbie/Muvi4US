'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, RefreshCw, ExternalLink, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { VideoSource } from '@/types';

interface VideoPlayerProps {
    sources: VideoSource[];
    title: string;
    // Metadata for fetching extra sources
    tmdbId?: string;
    type?: 'movie' | 'tv';
    year?: number;
    season?: number;
    episode?: number;
}

export function VideoPlayer({ sources: initialSources, title, tmdbId, type, year, season, episode }: VideoPlayerProps) {
    const [sources, setSources] = useState<VideoSource[]>(initialSources);
    const [activeSource, setActiveSource] = useState<VideoSource | null>(initialSources[0] || null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isScraping, setIsScraping] = useState(false);

    // Fetch extra sources on mount
    useEffect(() => {
        const fetchExtraSources = async () => {
            if (!tmdbId || !type) return;

            setIsScraping(true);
            try {
                const params = new URLSearchParams({
                    tmdbId,
                    title,
                    type,
                    year: year ? year.toString() : '',
                    season: season ? season.toString() : '',
                    episode: episode ? episode.toString() : ''
                });

                console.log('[VideoPlayer] Fetching extra sources:', `/api/sources?${params.toString()}`);
                const res = await fetch(`/api/sources?${params.toString()}`);
                const data = await res.json();
                console.log('[VideoPlayer] Scraper response:', data);

                if (data.sources && data.sources.length > 0) {
                    setSources(prev => {
                        // Avoid duplicates
                        const newSources = data.sources.filter((s: VideoSource) =>
                            !prev.some(p => p.id === s.id)
                        );
                        return [...prev, ...newSources];
                    });
                }
            } catch (error) {
                console.error('Failed to scrape extra sources:', error);
            } finally {
                setIsScraping(false);
            }
        };

        fetchExtraSources();
    }, [tmdbId, title, type, year, season, episode]);

    // Update active source if initial sources change (e.g. strict mode)
    useEffect(() => {
        if (initialSources.length > 0 && sources.length === 0) {
            setSources(initialSources);
            setActiveSource(initialSources[0]);
        }
    }, [initialSources]);


    const handleSourceChange = (source: VideoSource) => {
        setActiveSource(source);
        setIsLoading(true);
        setHasError(false);
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    if (!activeSource) {
        return (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-gray-900 text-center">
                <AlertCircle className="mb-4 h-12 w-12 text-gray-500" />
                <p className="text-lg font-medium text-gray-400">No sources available</p>
                <p className="mt-2 text-sm text-gray-500">
                    We couldn&apos;t find any video sources for &quot;{title}&quot;
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Player Container */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
                            <p className="text-sm text-gray-400">Loading video...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {hasError && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900 p-4 text-center">
                        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                        <p className="text-lg font-medium text-white">Failed to load video</p>
                        <p className="mt-2 text-sm text-gray-400">
                            This source may be unavailable. Try another source below.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4 gap-2"
                            onClick={() => {
                                setIsLoading(true);
                                setHasError(false);
                            }}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </Button>
                    </div>
                )}

                {/* Iframe Player */}
                <iframe
                    src={activeSource.embedUrl}
                    title={title}
                    className={cn(
                        'h-full w-full border-0',
                        (isLoading || hasError) && 'invisible'
                    )}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                    referrerPolicy="no-referrer"
                    onLoad={handleLoad}
                    onError={handleError}
                />
            </div>

            {/* Source Selector */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-400">Available Sources</p>
                    {isScraping && (
                        <div className="flex items-center gap-2 text-xs text-blue-400">
                            <Activity className="h-3 w-3 animate-pulse" />
                            Processing extra sources...
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {sources.map((source) => (
                        <Button
                            key={source.id}
                            variant={activeSource.id === source.id ? 'default' : 'outline'}
                            size="sm"
                            className={cn(
                                'gap-2',
                                activeSource.id === source.id
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'border-white/20 text-gray-300 hover:bg-white/10'
                            )}
                            onClick={() => handleSourceChange(source)}
                        >
                            {source.name}
                            <Badge
                                variant="secondary"
                                className="bg-black/30 text-xs"
                            >
                                {source.quality}
                            </Badge>
                        </Button>
                    ))}
                </div>
            </div>

            {/* External Link */}
            <div className="flex items-center justify-end">
                <a
                    href={activeSource.embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-300"
                >
                    Open in new tab
                    <ExternalLink className="h-3 w-3" />
                </a>
            </div>
        </div>
    );
}
