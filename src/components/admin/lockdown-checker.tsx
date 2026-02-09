'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAdminStore } from '@/lib/admin-store';

// Routes that bypass lockdown
const BYPASS_ROUTES = ['/lockdown', '/admin'];

export function LockdownChecker() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLocked, lockdownUntil, isAdmin } = useAdminStore();

    useEffect(() => {
        // Skip if on bypass routes
        if (BYPASS_ROUTES.some(route => pathname.startsWith(route))) {
            return;
        }

        // Check for bypass parameter (for admins)
        if (searchParams.get('bypass') === 'true' && isAdmin) {
            return;
        }

        // Check if lockdown has expired
        if (lockdownUntil) {
            const until = new Date(lockdownUntil);
            if (until < new Date()) {
                // Lockdown expired, update state
                useAdminStore.getState().setLockdown(false);
                return;
            }
        }

        // Check for Guest Lockdown
        const isGuestLockdown = useAdminStore.getState().isGuestLockdown;
        if (isGuestLockdown) {
            // Check if user is authenticated (using supabase session from local storage as a quick check)
            // We'll let the actual page handle full auth verification, but this is a quick client-side check
            const hasSession = localStorage.getItem('sb-grsrbooimievyeuxzxpb-auth-token');
            if (!hasSession && !isAdmin) {
                router.replace('/lockdown?mode=guest');
                return;
            }
        }

        // Redirect to lockdown page if site is fully locked
        if (isLocked) {
            router.replace('/lockdown');
        }
    }, [isLocked, lockdownUntil, pathname, router, searchParams]);

    return null;
}
