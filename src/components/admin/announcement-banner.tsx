'use client';

import { useAdminStore } from '@/lib/admin-store';
import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AnnouncementBanner() {
    const { announcements } = useAdminStore();
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load dismissed announcements from session storage
        const stored = sessionStorage.getItem('dismissed-announcements');
        if (stored) {
            setDismissed(new Set(JSON.parse(stored)));
        }
    }, []);

    const handleDismiss = (id: string) => {
        const newDismissed = new Set(dismissed);
        newDismissed.add(id);
        setDismissed(newDismissed);
        sessionStorage.setItem('dismissed-announcements', JSON.stringify([...newDismissed]));
    };

    if (!mounted) return null;

    const activeAnnouncements = announcements.filter(
        (a) => a.active && !dismissed.has(a.id)
    );

    if (activeAnnouncements.length === 0) return null;

    return (
        <div className="fixed top-16 left-0 right-0 z-40 space-y-1">
            {activeAnnouncements.map((announcement) => (
                <div
                    key={announcement.id}
                    className={`flex items-center justify-between px-4 py-2 text-sm ${announcement.type === 'danger'
                            ? 'bg-red-600 text-white'
                            : announcement.type === 'warning'
                                ? 'bg-yellow-500 text-black'
                                : 'bg-blue-600 text-white'
                        }`}
                >
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {announcement.type === 'danger' ? (
                                <AlertCircle className="h-4 w-4" />
                            ) : announcement.type === 'warning' ? (
                                <AlertTriangle className="h-4 w-4" />
                            ) : (
                                <Info className="h-4 w-4" />
                            )}
                            <span>{announcement.message}</span>
                        </div>
                        <button
                            onClick={() => handleDismiss(announcement.id)}
                            className="rounded p-1 transition-colors hover:bg-white/20"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
