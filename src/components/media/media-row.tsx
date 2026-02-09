'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MediaCard } from './media-card';
import type { Movie, TVShow, MediaType } from '@/types';

interface MediaRowProps {
    title: string;
    items: (Movie | TVShow)[];
    type: MediaType;
    viewAllHref?: string;
}

export function MediaRow({ title, items, type, viewAllHref }: MediaRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.clientWidth * 0.8;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    if (items.length === 0) return null;

    return (
        <section className="relative py-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between px-4">
                <h2 className="text-xl font-bold text-white md:text-2xl">{title}</h2>
                <div className="flex items-center gap-2">
                    {viewAllHref && (
                        <a
                            href={viewAllHref}
                            className="text-sm text-gray-400 transition-colors hover:text-red-400"
                        >
                            View All
                        </a>
                    )}
                    <div className="hidden gap-1 sm:flex">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/20"
                            onClick={() => scroll('left')}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white/10 text-white hover:bg-white/20"
                            onClick={() => scroll('right')}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Scrollable Row */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth px-4 pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item, index) => (
                    <div key={item.id} className="w-[140px] flex-shrink-0 sm:w-[160px] md:w-[180px]">
                        <MediaCard item={item} type={type} priority={index < 5} />
                    </div>
                ))}
            </div>
        </section>
    );
}
