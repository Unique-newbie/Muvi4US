'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Tv, Bookmark, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/movies', label: 'Movies', icon: Film },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/tv', label: 'TV', icon: Tv },
    { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
    const pathname = usePathname();

    // Check if current path matches nav item or is a sub-route
    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95 backdrop-blur-xl md:hidden safe-area-bottom">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-1 flex-col items-center gap-1 py-3 transition-colors',
                                active
                                    ? 'text-red-500'
                                    : 'text-gray-500 active:text-white'
                            )}
                        >
                            <Icon className={cn('h-5 w-5', active && 'scale-110')} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {active && (
                                <span className="absolute -top-0.5 h-0.5 w-8 rounded-full bg-red-500" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
