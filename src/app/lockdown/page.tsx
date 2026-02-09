'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAdminStore } from '@/lib/admin-store';
import { AlertTriangle, Lock, Shield, Clock, LogIn, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { useAuth } from '@/components/auth/auth-provider';

function LockdownContent() {
    const { lockdownMessage, lockdownUntil, isAdmin } = useAdminStore();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
    const [showAuthDialog, setShowAuthDialog] = useState(false);

    const isGuestFile = searchParams.get('mode') === 'guest';

    // Countdown timer for temporary lockdown
    useEffect(() => {
        if (!lockdownUntil) return;

        const updateTimer = () => {
            const now = new Date();
            const until = new Date(lockdownUntil);
            const diff = until.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining(null);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [lockdownUntil]);

    // If user logs in during guest lockdown, redirect to home
    useEffect(() => {
        if (isGuestFile && user) {
            window.location.href = '/';
        }
    }, [isGuestFile, user]);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-1/4 -top-1/4 h-96 w-96 animate-pulse rounded-full bg-red-500/10 blur-3xl" />
                <div className="absolute -bottom-1/4 -right-1/4 h-96 w-96 animate-pulse rounded-full bg-orange-500/10 blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-4 max-w-lg text-center">
                {/* Icon */}
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 ring-2 ring-red-500/50">
                    {isGuestFile ? (
                        <Users className="h-12 w-12 text-red-500" />
                    ) : (
                        <Lock className="h-12 w-12 text-red-500" />
                    )}
                </div>

                {/* Title */}
                <h1 className="mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-4xl font-bold text-transparent">
                    {isGuestFile ? 'Members Only' : 'Site Locked Down'}
                </h1>

                {/* Message */}
                <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center justify-center gap-2 text-yellow-500">
                        {isGuestFile ? (
                            <LogIn className="h-5 w-5" />
                        ) : (
                            <AlertTriangle className="h-5 w-5" />
                        )}
                        <span className="font-semibold uppercase tracking-wide">
                            {isGuestFile ? 'Authentication Required' : 'Notice'}
                        </span>
                    </div>
                    <p className="text-lg text-gray-300">
                        {isGuestFile
                            ? 'Muvi4US is currently accessible to members only. Please sign in to continue.'
                            : lockdownMessage}
                    </p>
                </div>

                {/* Guest Login Action */}
                {isGuestFile && (
                    <div className="mb-8">
                        <Button
                            size="lg"
                            className="w-full gap-2 bg-red-500 text-lg hover:bg-red-600"
                            onClick={() => setShowAuthDialog(true)}
                        >
                            <LogIn className="h-5 w-5" />
                            Sign In / Sign Up
                        </Button>
                    </div>
                )}

                {/* Countdown Timer (Only for full lockdown) */}
                {!isGuestFile && timeRemaining && (
                    <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">Estimated time remaining:</span>
                        </div>
                        <div className="mt-2 font-mono text-3xl font-bold text-white">
                            {timeRemaining}
                        </div>
                    </div>
                )}

                {/* Admin Bypass */}
                {isAdmin && (
                    <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                        <div className="flex items-center justify-center gap-2 text-green-400">
                            <Shield className="h-4 w-4" />
                            <span className="text-sm font-medium">Admin Access Detected</span>
                        </div>
                        <div className="mt-3 flex gap-3 justify-center">
                            <Link href="/admin">
                                <Button className="bg-green-600 hover:bg-green-700">
                                    Go to Admin Panel
                                </Button>
                            </Link>
                            <Link href="/?bypass=true">
                                <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
                                    Bypass Lockdown
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <p className="mt-8 text-sm text-gray-500">
                    Muvi4US • {isGuestFile ? 'Join the community' : "We'll be back soon"}
                </p>
            </div>

            <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
        </div>
    );
}

export default function LockdownPage() {
    return (
        <Suspense fallback={null}>
            <LockdownContent />
        </Suspense>
    );
}
