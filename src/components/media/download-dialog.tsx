'use client';

import { useState } from 'react';
import { Download, Copy, Check, ExternalLink, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/use-media-query';
import { getDownloadSources, getExternalDownloadLinks, type DownloadOptions } from '@/lib/download-sources';

interface DownloadDialogProps {
    options: DownloadOptions;
    trigger?: React.ReactNode;
}

export function DownloadDialog({ options, trigger }: DownloadDialogProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 768px)');

    const sources = getDownloadSources(options);
    const externalLinks = getExternalDownloadLinks(options.title, options.year);

    const handleCopy = async (url: string, index: number) => {
        await navigator.clipboard.writeText(url);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const episodeInfo = options.type === 'tv' && options.season && options.episode
        ? ` - S${String(options.season).padStart(2, '0')}E${String(options.episode).padStart(2, '0')}`
        : '';

    const content = (
        <div className="space-y-4">
            {/* Direct Downloads */}
            <div>
                <h4 className="mb-3 text-sm font-medium text-gray-300">Direct Downloads</h4>
                <div className="space-y-2">
                    {sources.map((source, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
                        >
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                                    {source.quality}
                                </Badge>
                                <div>
                                    <p className="text-sm font-medium">{source.provider}</p>
                                    {source.size && (
                                        <p className="text-xs text-gray-500">{source.size}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-9 w-9 p-0"
                                    onClick={() => handleCopy(source.url, index)}
                                >
                                    {copiedIndex === index ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-9 w-9 p-0"
                                    asChild
                                >
                                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Separator className="bg-white/10" />

            {/* External Search Links */}
            <div>
                <h4 className="mb-3 text-sm font-medium text-gray-300">Search on Torrent Sites</h4>
                <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
                    {externalLinks.map((link, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="gap-1 border-white/10 bg-white/5 hover:bg-white/10 text-xs"
                            asChild
                        >
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                {link.name}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </Button>
                    ))}
                </div>
            </div>

            <p className="text-xs text-gray-500">
                💡 Tip: Use a VPN when downloading. Links may not always be available.
            </p>
        </div>
    );

    // Use Drawer on mobile, Dialog on desktop
    if (!isDesktop) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    {trigger || (
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Download
                        </Button>
                    )}
                </DrawerTrigger>
                <DrawerContent className="border-white/10 bg-black/95 text-white max-h-[85vh]">
                    <DrawerHeader className="text-left">
                        <DrawerTitle className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-red-500" />
                            Download Options
                        </DrawerTitle>
                        <DrawerDescription className="text-gray-400">
                            {options.title}{episodeInfo}
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 overflow-y-auto">
                        {content}
                    </div>
                    <DrawerFooter className="pt-2">
                        <DrawerClose asChild>
                            <Button variant="outline" className="border-white/10">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md border-white/10 bg-black/95 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-red-500" />
                        Download Options
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {options.title}{episodeInfo}
                    </DialogDescription>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
}
