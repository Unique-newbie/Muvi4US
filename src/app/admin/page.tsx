'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/admin-store';
import { useAuth } from '@/components/auth/auth-provider';
import {
    Shield, Lock, Unlock, Bell, Radio, Activity, LogOut,
    AlertTriangle, Info, AlertCircle, Trash2, Power, Clock,
    RefreshCw, ChevronRight, Settings, Users, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

function AdminContent() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useAuth();
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

    const [announcementText, setAnnouncementText] = useState('');
    const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'danger'>('info');
    const [lockdownDuration, setLockdownDuration] = useState('');
    const [customLockdownMessage, setCustomLockdownMessage] = useState('');

    const {
        isAdmin,
        checkAdminStatus,
        logoutAdmin,
        isLocked,
        lockdownMessage,
        lockdownUntil,
        announcements,
        proxySources,
        activityLog,
        setLockdown,
        addAnnouncement,
        removeAnnouncement,
        toggleProxySource,
        clearActivityLog,
    } = useAdminStore();

    useEffect(() => {
        const verifyAdmin = async () => {
            if (isAuthLoading) return;

            if (!user) {
                setIsCheckingAdmin(false);
                return;
            }

            // Double check with store/db
            await checkAdminStatus();
            setIsCheckingAdmin(false);
        };
        verifyAdmin();
    }, [user, isAuthLoading, checkAdminStatus]);

    const handleLogout = async () => {
        await logoutAdmin();
        router.push('/');
    };

    const handleLockdownToggle = () => {
        if (isLocked) {
            setLockdown(false);
        } else {
            let until: Date | null = null;
            if (lockdownDuration) {
                until = new Date();
                until.setMinutes(until.getMinutes() + parseInt(lockdownDuration));
            }
            setLockdown(true, customLockdownMessage || undefined, until);
        }
    };

    const handleAddAnnouncement = () => {
        if (announcementText.trim()) {
            addAnnouncement(announcementText.trim(), announcementType);
            setAnnouncementText('');
        }
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isAuthLoading || isCheckingAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black p-4">
                <Card className="w-full max-w-md border-white/10 bg-gray-900">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 ring-2 ring-gray-700">
                            <Lock className="h-8 w-8 text-gray-400" />
                        </div>
                        <CardTitle className="text-2xl text-white">Admin Access</CardTitle>
                        <CardDescription className="text-gray-400">
                            You must be logged in to view this page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/auth?view=sign_in&next=/admin">
                            <Button className="w-full bg-red-600 hover:bg-red-700">Log In</Button>
                        </Link>
                        <Link href="/">
                            <Button variant="ghost" className="mt-2 w-full text-gray-400 hover:text-white">Back to Home</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black p-4">
                <Card className="w-full max-w-md border-red-500/20 bg-gray-900">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-2 ring-red-500/20">
                            <Shield className="h-8 w-8 text-red-500" />
                        </div>
                        <CardTitle className="text-2xl text-white">Access Denied</CardTitle>
                        <CardDescription className="text-red-300">
                            Your account does not have admin privileges.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button className="w-full bg-white text-black hover:bg-gray-200">Return Home</Button>
                        </Link>
                        <Button
                            variant="ghost"
                            className="mt-2 w-full text-gray-400 hover:text-white"
                            onClick={handleLogout}
                        >
                            Log Out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-4 pt-20 md:p-8 md:pt-24">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
                            <Shield className="h-8 w-8 text-red-500" />
                            Admin Dashboard
                        </h1>
                        <p className="mt-1 text-gray-400">Manage your Muvi4US instance</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/">
                            <Button variant="outline" className="gap-2 border-white/10 text-white hover:bg-white/10">
                                <ChevronRight className="h-4 w-4 rotate-180" />
                                Back to Site
                            </Button>
                        </Link>
                        <Button onClick={handleLogout} variant="ghost" className="gap-2 text-red-400 hover:bg-red-500/10">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Lockdown Control - Full Width on Mobile */}
                    <Card className={`border-2 lg:col-span-2 ${isLocked ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-gray-900'}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                {isLocked ? <Lock className="h-5 w-5 text-red-500" /> : <Unlock className="h-5 w-5 text-green-500" />}
                                Site Lockdown
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                {isLocked ? 'Site is currently locked' : 'Site is accessible to users'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/50 p-4">
                                <div>
                                    <p className="font-medium text-white">Lockdown Status</p>
                                    <p className="text-sm text-gray-400">
                                        {isLocked ? 'All users are blocked from accessing the site' : 'Site is fully operational'}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleLockdownToggle}
                                    className={isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                                >
                                    <Power className="mr-2 h-4 w-4" />
                                    {isLocked ? 'Unlock Site' : 'Lock Site'}
                                </Button>
                            </div>

                            {!isLocked && (
                                <div className="space-y-3 rounded-lg border border-white/10 bg-black/30 p-4">
                                    <p className="text-sm font-medium text-gray-300">Lockdown Options</p>
                                    <Input
                                        placeholder="Custom lockdown message..."
                                        value={customLockdownMessage}
                                        onChange={(e) => setCustomLockdownMessage(e.target.value)}
                                        className="border-white/10 bg-gray-800 text-white"
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Duration (minutes)"
                                            value={lockdownDuration}
                                            onChange={(e) => setLockdownDuration(e.target.value)}
                                            className="w-40 border-white/10 bg-gray-800 text-white"
                                        />
                                        <p className="flex items-center text-sm text-gray-400">
                                            <Clock className="mr-1 h-4 w-4" />
                                            Leave empty for indefinite
                                        </p>
                                    </div>
                                </div>
                            )}

                            {isLocked && lockdownUntil && (
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <Clock className="h-4 w-4" />
                                    <span>Unlocks at: {formatDate(lockdownUntil)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Guest Lockdown Control */}
                    <Card className="border-white/10 bg-gray-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Users className="h-5 w-5 text-orange-500" />
                                Guest Access
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Manage access for non-logged-in users
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-4">
                                <div>
                                    <p className="font-medium text-white">Guest Lockdown</p>
                                    <p className="text-xs text-gray-400">
                                        {useAdminStore.getState().isGuestLockdown
                                            ? 'Guests are redirected to login'
                                            : 'Guests can browse freely'}
                                    </p>
                                </div>
                                <Switch
                                    checked={useAdminStore.getState().isGuestLockdown}
                                    onCheckedChange={useAdminStore.getState().setGuestLockdown}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Featured Content Control */}
                    <Card className="border-white/10 bg-gray-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Sparkles className="h-5 w-5 text-pink-500" />
                                Featured Content
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Pin content to the home banner
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-white">TMDB ID</p>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g., 550"
                                        defaultValue={useAdminStore.getState().featuredContentId || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (!val) useAdminStore.getState().setFeaturedContentId(null);
                                        }}
                                        onBlur={(e) => {
                                            const val = e.target.value;
                                            useAdminStore.getState().setFeaturedContentId(val || null);
                                        }}
                                        className="border-white/10 bg-gray-800 text-white"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Enter a Movie or TV Show ID to override the hero banner. Leave empty for automatic trending content.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card className="border-white/10 bg-gray-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Quick Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Site Status</span>
                                <Badge className={isLocked ? 'bg-red-500' : 'bg-green-500'}>
                                    {isLocked ? 'Locked' : 'Online'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Active Announcements</span>
                                <span className="font-bold text-white">{announcements.filter(a => a.active).length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Proxy Sources</span>
                                <span className="font-bold text-white">
                                    {proxySources.filter(p => p.enabled).length}/{proxySources.length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Admin Actions</span>
                                <span className="font-bold text-white">{activityLog.length}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Announcements */}
                    <Card className="border-white/10 bg-gray-900 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Bell className="h-5 w-5 text-yellow-500" />
                                Announcements
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Display important messages to all users
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Announcement message..."
                                    value={announcementText}
                                    onChange={(e) => setAnnouncementText(e.target.value)}
                                    className="flex-1 border-white/10 bg-gray-800 text-white"
                                />
                                <select
                                    value={announcementType}
                                    onChange={(e) => setAnnouncementType(e.target.value as 'info' | 'warning' | 'danger')}
                                    className="rounded-md border border-white/10 bg-gray-800 px-3 text-white"
                                >
                                    <option value="info">Info</option>
                                    <option value="warning">Warning</option>
                                    <option value="danger">Danger</option>
                                </select>
                                <Button onClick={handleAddAnnouncement} className="bg-yellow-600 hover:bg-yellow-700">
                                    Add
                                </Button>
                            </div>

                            <div className="max-h-48 space-y-2 overflow-y-auto">
                                {announcements.length === 0 ? (
                                    <p className="py-4 text-center text-gray-500">No active announcements</p>
                                ) : (
                                    announcements.map((ann) => (
                                        <div
                                            key={ann.id}
                                            className={`flex items-center justify-between rounded-lg border p-3 ${ann.type === 'danger'
                                                ? 'border-red-500/30 bg-red-500/10'
                                                : ann.type === 'warning'
                                                    ? 'border-yellow-500/30 bg-yellow-500/10'
                                                    : 'border-blue-500/30 bg-blue-500/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {ann.type === 'danger' ? (
                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                ) : ann.type === 'warning' ? (
                                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                ) : (
                                                    <Info className="h-4 w-4 text-blue-500" />
                                                )}
                                                <span className="text-sm text-white">{ann.message}</span>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => removeAnnouncement(ann.id)}
                                                className="h-8 w-8 text-gray-400 hover:bg-white/10 hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Proxy Sources */}
                    <Card className="border-white/10 bg-gray-900">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                                <Radio className="h-5 w-5 text-purple-500" />
                                Proxy Sources
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Toggle streaming sources
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {proxySources.map((source) => (
                                <div
                                    key={source.id}
                                    className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 p-3"
                                >
                                    <div>
                                        <p className="font-medium text-white">{source.name}</p>
                                        <p className="text-xs text-gray-500">Priority: {source.priority}</p>
                                    </div>
                                    <Switch
                                        checked={source.enabled}
                                        onCheckedChange={() => toggleProxySource(source.id)}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Activity Log - Full Width */}
                    <Card className="border-white/10 bg-gray-900 lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Settings className="h-5 w-5 text-gray-500" />
                                    Activity Log
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Recent admin actions
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearActivityLog}
                                className="gap-2 text-gray-400 hover:text-white"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Clear
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-64 overflow-y-auto">
                                {activityLog.length === 0 ? (
                                    <p className="py-8 text-center text-gray-500">No activity logged yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {activityLog.slice(0, 20).map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="flex items-center justify-between rounded-lg border border-white/5 bg-black/30 px-4 py-2"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="border-white/20 text-xs">
                                                        {entry.action}
                                                    </Badge>
                                                    <span className="text-sm text-gray-300">{entry.details}</span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(entry.timestamp)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            </div>
        }>
            <AdminContent />
        </Suspense>
    );
}
