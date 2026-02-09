'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, Film, Tv, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { searchMulti, getImageUrl } from '@/lib/tmdb';
import { Movie, TVShow } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SearchBarProps {
    className?: string;
    onSearchSubmit?: () => void;
}

export function SearchBar({ className, onSearchSubmit }: SearchBarProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<(Movie | TVShow)[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (!query.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setIsOpen(true);

        debounceTimeout.current = setTimeout(async () => {
            try {
                const data = await searchMulti(query);
                // Filter out people and keep only movies/tv
                const filtered = data.results.filter(
                    (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
                );
                setResults(filtered);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300); // 300ms debounce

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            setIsOpen(false);
            if (onSearchSubmit) onSearchSubmit();
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={cn('relative w-full', className)}>
            <form onSubmit={handleSubmit} className="relative z-50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search movies, TV shows..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            if (query.trim().length > 0) setIsOpen(true);
                        }}
                        className="w-full border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20 rounded-full h-10 transition-all duration-300 backdrop-blur-sm"
                    />
                    {isLoading ? (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                        </div>
                    ) : query ? (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    ) : null}
                </div>
            </form>

            {/* Results Dropdown */}
            {isOpen && (query.trim().length > 0) && (
                <div className="absolute top-full left-0 mt-2 w-full origin-top transform rounded-xl border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in zoom-in-95 duration-200 z-40">
                    <ScrollArea className="max-h-[60vh] rounded-lg">
                        {results.length > 0 ? (
                            <div className="space-y-1">
                                {results.slice(0, 5).map((item) => {
                                    const isMovie = 'title' in item;
                                    const title = isMovie ? (item as Movie).title : (item as TVShow).name;
                                    const date = isMovie ? (item as Movie).release_date : (item as TVShow).first_air_date;
                                    const year = date ? new Date(date).getFullYear() : 'N/A';
                                    const link = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;

                                    return (
                                        <Link
                                            key={item.id}
                                            href={link}
                                            onClick={() => {
                                                setIsOpen(false);
                                                if (onSearchSubmit) onSearchSubmit();
                                            }}
                                            className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-white/10 group"
                                        >
                                            {/* Poster */}
                                            <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-800">
                                                <img
                                                    src={getImageUrl(item.poster_path, 'w200')}
                                                    alt={title}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 py-1">
                                                <h4 className="font-medium text-white truncate text-sm group-hover:text-red-500 transition-colors">
                                                    {title}
                                                </h4>
                                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        {isMovie ? <Film className="h-3 w-3" /> : <Tv className="h-3 w-3" />}
                                                        {isMovie ? 'Movie' : 'TV'}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {year}
                                                    </span>
                                                    {item.vote_average > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-yellow-500">★ {item.vote_average.toFixed(1)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                                <Button
                                    variant="ghost"
                                    className="mt-2 w-full justify-center text-xs text-gray-400 hover:text-white h-auto py-2"
                                    onClick={(e) => handleSubmit(e)}
                                >
                                    View all results for "{query}"
                                </Button>
                            </div>
                        ) : !isLoading && (
                            <div className="p-4 text-center text-sm text-gray-400">
                                No results found for "{query}"
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
