'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Clock, Trash2, Sun, Moon, History, Bookmark, Settings, ChevronRight, Film, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAppStore } from '@/store/app-store';

export default function ProfilePage() {
    const { theme, setTheme, watchlist, watchHistory, clearWatchHistory, recentSearches, clearRecentSearches } = useAppStore();
    const [clearHistoryOpen, setClearHistoryOpen] = useState(false);
    const [clearSearchesOpen, setClearSearchesOpen] = useState(false);

    const stats = {
        watchlist: watchlist.length,
        movies: watchlist.filter(w => w.type === 'movie').length,
        shows: watchlist.filter(w => w.type === 'tv').length,
        history: watchHistory.length,
        searches: recentSearches.length,
    };

    const handleClearHistory = () => {
        clearWatchHistory();
        setClearHistoryOpen(false);
    };

    const handleClearSearches = () => {
        clearRecentSearches();
        setClearSearchesOpen(false);
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-4 md:py-8">
            {/* Profile Header - Compact on mobile */}
            <div className="mb-6 md:mb-8 flex items-center gap-4 md:gap-6">
                <div className="flex h-16 w-16 md:h-24 md:w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex-shrink-0">
                    <User className="h-8 w-8 md:h-12 md:w-12 text-white" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-xl md:text-3xl font-bold text-white">Your Profile</h1>
                    <p className="mt-0.5 md:mt-1 text-xs md:text-base text-gray-400 truncate">Manage your preferences</p>
                </div>
            </div>

            {/* Stats Grid - 2x2 on mobile */}
            <div className="mb-6 md:mb-8 grid grid-cols-2 gap-2 md:gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-white/5 p-3 md:p-4 text-center">
                    <p className="text-xl md:text-3xl font-bold text-white">{stats.watchlist}</p>
                    <p className="text-[10px] md:text-sm text-gray-400">In Watchlist</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3 md:p-4 text-center">
                    <p className="text-xl md:text-3xl font-bold text-white">{stats.movies}</p>
                    <p className="text-[10px] md:text-sm text-gray-400">Movies</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3 md:p-4 text-center">
                    <p className="text-xl md:text-3xl font-bold text-white">{stats.shows}</p>
                    <p className="text-[10px] md:text-sm text-gray-400">Shows</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3 md:p-4 text-center">
                    <p className="text-xl md:text-3xl font-bold text-white">{stats.history}</p>
                    <p className="text-[10px] md:text-sm text-gray-400">Watched</p>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-4 md:space-y-6">
                {/* Appearance */}
                <div className="rounded-xl bg-white/5 p-4 md:p-6">
                    <h2 className="mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-lg font-semibold text-white">
                        <Settings className="h-4 w-4 md:h-5 md:w-5" />
                        Appearance
                    </h2>
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-sm md:font-medium text-white">Theme</p>
                            <p className="text-xs md:text-sm text-gray-400 truncate">Dark or light mode</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 md:gap-2 border-white/10 flex-shrink-0"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Moon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    <span className="hidden sm:inline">Dark</span>
                                </>
                            ) : (
                                <>
                                    <Sun className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    <span className="hidden sm:inline">Light</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="rounded-xl bg-white/5 p-4 md:p-6">
                    <h2 className="mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-lg font-semibold text-white">
                        <Bookmark className="h-4 w-4 md:h-5 md:w-5" />
                        Quick Links
                    </h2>
                    <div className="space-y-1.5 md:space-y-2">
                        <Link
                            href="/watchlist"
                            className="flex items-center justify-between rounded-lg bg-white/5 p-3 md:p-4 transition-colors hover:bg-white/10"
                        >
                            <div className="flex items-center gap-2.5 md:gap-3">
                                <Bookmark className="h-4 w-4 md:h-5 md:w-5 text-red-500" />
                                <div>
                                    <p className="text-sm font-medium text-white">My Watchlist</p>
                                    <p className="text-xs text-gray-400">{stats.watchlist} items</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                        </Link>
                        <Link
                            href="/movies"
                            className="flex items-center justify-between rounded-lg bg-white/5 p-3 md:p-4 transition-colors hover:bg-white/10"
                        >
                            <div className="flex items-center gap-2.5 md:gap-3">
                                <Film className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-white">Browse Movies</p>
                                    <p className="text-xs text-gray-400">Discover films</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                        </Link>
                        <Link
                            href="/tv"
                            className="flex items-center justify-between rounded-lg bg-white/5 p-3 md:p-4 transition-colors hover:bg-white/10"
                        >
                            <div className="flex items-center gap-2.5 md:gap-3">
                                <Tv className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium text-white">Browse TV Shows</p>
                                    <p className="text-xs text-gray-400">Find series</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                        </Link>
                    </div>
                </div>

                {/* Watch History */}
                <div className="rounded-xl bg-white/5 p-4 md:p-6">
                    <h2 className="mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-lg font-semibold text-white">
                        <History className="h-4 w-4 md:h-5 md:w-5" />
                        Watch History
                    </h2>
                    {watchHistory.length > 0 ? (
                        <>
                            <div className="mb-3 md:mb-4 space-y-1.5 md:space-y-2">
                                {watchHistory.slice(0, 5).map((item, index) => (
                                    <div key={index} className="flex items-center gap-2.5 md:gap-3 rounded-lg bg-white/5 p-2.5 md:p-3">
                                        <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs md:text-sm font-medium text-white truncate">
                                                {item.type === 'movie' ? 'Movie' : 'TV Show'} #{item.id}
                                                {item.episodeId && ` - E${item.episodeId}`}
                                            </p>
                                            <p className="text-[10px] md:text-xs text-gray-500">
                                                {new Date(item.watchedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="text-[10px] md:text-xs flex-shrink-0">
                                            {Math.round(item.progress)}%
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-3 md:my-4 bg-white/10" />
                            <Dialog open={clearHistoryOpen} onOpenChange={setClearHistoryOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="gap-1.5 md:gap-2 text-xs md:text-sm">
                                        <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                        Clear History
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="mx-4 border-white/10 bg-black/95 text-white max-w-[calc(100%-2rem)] sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Clear Watch History?</DialogTitle>
                                        <DialogDescription className="text-gray-400">
                                            This will permanently delete your entire watch history.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="flex-row gap-2 sm:justify-end">
                                        <Button variant="ghost" onClick={() => setClearHistoryOpen(false)} className="flex-1 sm:flex-none">
                                            Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={handleClearHistory} className="flex-1 sm:flex-none">
                                            Clear
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    ) : (
                        <p className="text-xs md:text-base text-gray-400">No watch history yet. Start watching!</p>
                    )}
                </div>

                {/* Recent Searches */}
                <div className="rounded-xl bg-white/5 p-4 md:p-6">
                    <h2 className="mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-lg font-semibold text-white">
                        <Clock className="h-4 w-4 md:h-5 md:w-5" />
                        Recent Searches
                    </h2>
                    {recentSearches.length > 0 ? (
                        <>
                            <div className="mb-3 md:mb-4 flex flex-wrap gap-1.5 md:gap-2">
                                {recentSearches.map((search, index) => (
                                    <Link key={index} href={`/search?q=${encodeURIComponent(search)}`}>
                                        <Badge variant="secondary" className="cursor-pointer text-xs hover:bg-white/20">
                                            {search}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                            <Dialog open={clearSearchesOpen} onOpenChange={setClearSearchesOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1.5 md:gap-2 border-white/10 text-xs md:text-sm">
                                        <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                        Clear Searches
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="mx-4 border-white/10 bg-black/95 text-white max-w-[calc(100%-2rem)] sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Clear Recent Searches?</DialogTitle>
                                        <DialogDescription className="text-gray-400">
                                            This will clear all your recent search history.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="flex-row gap-2 sm:justify-end">
                                        <Button variant="ghost" onClick={() => setClearSearchesOpen(false)} className="flex-1 sm:flex-none">
                                            Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={handleClearSearches} className="flex-1 sm:flex-none">
                                            Clear
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    ) : (
                        <p className="text-xs md:text-base text-gray-400">No recent searches. Use the search bar!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
