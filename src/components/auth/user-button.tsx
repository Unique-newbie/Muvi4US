'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from './auth-provider';
import { AuthDialog } from './auth-dialog';
import { User, LogOut, Settings, BookmarkCheck, Cloud, CloudOff } from 'lucide-react';

export function UserButton() {
    const { user, isLoading, isConfigured, signOut } = useAuth();
    const [authDialogOpen, setAuthDialogOpen] = useState(false);

    if (isLoading) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:bg-white/10"
                disabled
            >
                <User className="h-5 w-5 animate-pulse" />
            </Button>
        );
    }

    // Not signed in
    if (!user) {
        return (
            <>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAuthDialogOpen(true)}
                    className="gap-2 text-white/70 hover:bg-white/10 hover:text-white"
                >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign In</span>
                </Button>
                <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
            </>
        );
    }

    // Signed in
    const initials = user.email
        ? user.email.slice(0, 2).toUpperCase()
        : 'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                >
                    <Avatar className="h-9 w-9 border-2 border-red-500">
                        <AvatarImage
                            src={user.user_metadata?.avatar_url}
                            alt={user.email || 'User'}
                        />
                        <AvatarFallback className="bg-red-500 text-white">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 border-white/10 bg-gray-900 text-white"
            >
                <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-red-500 text-sm text-white">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">
                            {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="truncate text-xs text-gray-400">
                            {user.email}
                        </p>
                    </div>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-white/10">
                    <BookmarkCheck className="h-4 w-4" />
                    My Watchlist
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-white/10">
                    {isConfigured ? (
                        <>
                            <Cloud className="h-4 w-4 text-green-500" />
                            <span>Cloud Sync Active</span>
                        </>
                    ) : (
                        <>
                            <CloudOff className="h-4 w-4 text-yellow-500" />
                            <span>Local Only</span>
                        </>
                    )}
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-white/10">
                    <Settings className="h-4 w-4" />
                    Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
