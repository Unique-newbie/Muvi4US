'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from './auth-provider';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
    const { signIn, signUp, isConfigured } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message);
        } else {
            onOpenChange(false);
            resetForm();
        }

        setIsLoading(false);
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        const { error } = await signUp(email, password);

        if (error) {
            setError(error.message);
        } else {
            setSuccess('Check your email to verify your account!');
            resetForm();
        }

        setIsLoading(false);
    };



    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError(null);
    };

    if (!isConfigured) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="border-white/10 bg-gray-900 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Authentication Not Configured</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            To enable authentication, configure Supabase:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="rounded-lg bg-yellow-500/10 p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-500" />
                                <div className="text-sm">
                                    <p className="font-medium text-yellow-500">Add to .env.local:</p>
                                    <code className="mt-2 block rounded bg-black/50 p-2 text-xs">
                                        NEXT_PUBLIC_SUPABASE_URL=your_url<br />
                                        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
                                    </code>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-500">
                            Your watchlist and preferences are saved locally.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="border-white/10 bg-gray-900 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Welcome to Muvi4US</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Sign in to sync your watchlist across devices
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                        <TabsTrigger value="signin" onClick={() => { setError(null); setSuccess(null); }}>
                            Sign In
                        </TabsTrigger>
                        <TabsTrigger value="signup" onClick={() => { setError(null); setSuccess(null); }}>
                            Sign Up
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="space-y-4 pt-4">
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="border-white/10 bg-gray-800 pl-10 text-white"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="border-white/10 bg-gray-800 pl-10 pr-10 text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-red-500 text-white hover:bg-red-600"
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>


                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4 pt-4">
                        {success ? (
                            <div className="flex flex-col items-center gap-3 py-6 text-center">
                                <CheckCircle className="h-12 w-12 text-green-500" />
                                <p className="text-green-400">{success}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="border-white/10 bg-gray-800 pl-10 text-white"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="border-white/10 bg-gray-800 pl-10 pr-10 text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="border-white/10 bg-gray-800 pl-10 text-white"
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-sm text-red-400">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-red-500 text-white hover:bg-red-600"
                                >
                                    {isLoading ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </form>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
