'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface MediaCardSkeletonProps {
    count?: number;
}

export function MediaCardSkeleton({ count = 1 }: MediaCardSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <Card
                    key={i}
                    className="relative overflow-hidden border-0 bg-transparent animate-pulse"
                >
                    {/* Poster Skeleton */}
                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                        <Skeleton className="h-full w-full bg-gray-800" />

                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>

                    {/* Info Skeleton */}
                    <div className="mt-3 px-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 bg-gray-800" />
                        <Skeleton className="h-3 w-1/3 bg-gray-800" />
                    </div>
                </Card>
            ))}
        </>
    );
}

export function MediaRowSkeleton() {
    return (
        <div className="space-y-4 px-4 md:px-8">
            {/* Title Skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48 bg-gray-800" />
                <Skeleton className="h-4 w-20 bg-gray-800" />
            </div>

            {/* Cards Grid */}
            <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-[180px] flex-shrink-0">
                        <MediaCardSkeleton />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function HeroBannerSkeleton() {
    return (
        <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
            <Skeleton className="absolute inset-0 bg-gray-800" />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            {/* Content skeleton */}
            <div className="container relative mx-auto flex h-full items-end px-4 pb-16 md:items-center md:pb-0">
                <div className="max-w-2xl space-y-4">
                    <Skeleton className="h-6 w-32 bg-gray-700" />
                    <Skeleton className="h-14 w-96 bg-gray-700" />
                    <div className="flex gap-3">
                        <Skeleton className="h-4 w-16 bg-gray-700" />
                        <Skeleton className="h-4 w-20 bg-gray-700" />
                    </div>
                    <Skeleton className="h-20 w-full bg-gray-700" />
                    <div className="flex gap-3 pt-2">
                        <Skeleton className="h-12 w-36 rounded-lg bg-gray-700" />
                        <Skeleton className="h-12 w-32 rounded-lg bg-gray-700" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PageSkeleton() {
    return (
        <div className="min-h-screen">
            <HeroBannerSkeleton />
            <div className="relative z-10 -mt-20 space-y-8 pb-12">
                <MediaRowSkeleton />
                <MediaRowSkeleton />
                <MediaRowSkeleton />
            </div>
        </div>
    );
}
