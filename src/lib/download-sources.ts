/**
 * Download Sources Resolver
 * Generates download links from various hosting providers
 */

export interface DownloadSource {
    name: string;
    quality: string;
    size?: string;
    url: string;
    provider: string;
}

export interface DownloadOptions {
    tmdbId: number;
    type: 'movie' | 'tv';
    title: string;
    year?: number;
    season?: number;
    episode?: number;
}

// Generate download sources for a movie or episode
export function getDownloadSources(options: DownloadOptions): DownloadSource[] {
    const { tmdbId, type, title, year, season, episode } = options;

    // Encode the title for URLs
    const encodedTitle = encodeURIComponent(title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

    // For movies
    if (type === 'movie') {
        return [
            {
                name: 'Direct Download',
                quality: '1080p',
                size: '~2.5 GB',
                url: `https://dl.vidsrc.vip/movie/${tmdbId}`,
                provider: 'VidSrc',
            },
            {
                name: 'Direct Download',
                quality: '720p',
                size: '~1.2 GB',
                url: `https://dl.vidsrc.vip/movie/${tmdbId}?quality=720`,
                provider: 'VidSrc',
            },
            {
                name: 'Direct Download',
                quality: '480p',
                size: '~600 MB',
                url: `https://dl.vidsrc.vip/movie/${tmdbId}?quality=480`,
                provider: 'VidSrc',
            },
            {
                name: 'Alternative',
                quality: '1080p',
                size: '~2.8 GB',
                url: `https://embed.su/download/${tmdbId}`,
                provider: 'EmbedSu',
            },
            {
                name: 'Torrent/Magnet',
                quality: 'Various',
                url: `https://yts.mx/movies/${encodedTitle}${year ? `-${year}` : ''}`,
                provider: 'YTS',
            },
        ];
    }

    // For TV episodes
    return [
        {
            name: 'Direct Download',
            quality: '1080p',
            size: '~1.2 GB',
            url: `https://dl.vidsrc.vip/tv/${tmdbId}/${season}/${episode}`,
            provider: 'VidSrc',
        },
        {
            name: 'Direct Download',
            quality: '720p',
            size: '~600 MB',
            url: `https://dl.vidsrc.vip/tv/${tmdbId}/${season}/${episode}?quality=720`,
            provider: 'VidSrc',
        },
        {
            name: 'Direct Download',
            quality: '480p',
            size: '~300 MB',
            url: `https://dl.vidsrc.vip/tv/${tmdbId}/${season}/${episode}?quality=480`,
            provider: 'VidSrc',
        },
        {
            name: 'Alternative',
            quality: '1080p',
            url: `https://embed.su/download/tv/${tmdbId}/${season}/${episode}`,
            provider: 'EmbedSu',
        },
    ];
}

// Get external download search links
export function getExternalDownloadLinks(title: string, year?: number): { name: string; url: string }[] {
    const query = encodeURIComponent(`${title}${year ? ` ${year}` : ''}`);

    return [
        { name: '1337x', url: `https://1337x.to/search/${query}/1/` },
        { name: 'RARBG', url: `https://rarbg.to/torrents.php?search=${query}` },
        { name: 'Piratebay Proxy', url: `https://thepiratebay.party/search/${query}` },
    ];
}
