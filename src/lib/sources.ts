import { createClient } from '@supabase/supabase-js';
import type { VideoSource } from '@/types';

// Fallback sources if DB is empty or fails
export const FALLBACK_SOURCES = [
    {
        id: 'vidsrc',
        name: 'VidSrc',
        url: 'https://vidsrc.xyz/embed', // Base URL
        priority: 1,
        enabled: true,
        type: 'iframe'
    },
    {
        id: 'vidsrcpro',
        name: 'VidSrc Pro',
        url: 'https://vidsrc.pro/embed',
        priority: 2,
        enabled: true,
        type: 'iframe'
    },
    {
        id: 'superembed',
        name: 'SuperEmbed',
        url: 'https://multiembed.mov/directstream.php?video_id={id}&tmdb=1',
        priority: 3,
        enabled: true,
        type: 'iframe'
    },
    {
        id: 'smashystream',
        name: 'SmashyStream',
        url: 'https://player.smashy.stream',
        priority: 4,
        enabled: true,
        type: 'iframe'
    },
    {
        id: 'autoembed',
        name: 'AutoEmbed',
        url: 'https://autoembed.co',
        priority: 5,
        enabled: true,
        type: 'iframe'
    },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Use a singleton client if possible, but createClient is lightweight
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getSources(
    tmdbId: string,
    type: 'movie' | 'tv',
    season?: number,
    episode?: number
): Promise<VideoSource[]> {
    let proxySources: any[] = [];

    try {
        const { data, error } = await supabase
            .from('proxy_sources')
            .select('*')
            .eq('is_active', true);
        // .order('created_at', { ascending: true }); // Use created_at as proxy for priority if needed

        if (data && data.length > 0) {
            proxySources = data;
        } else {
            // console.log('No sources found in DB, using fallback.');
            proxySources = FALLBACK_SOURCES;
        }
    } catch (error) {
        console.error('Failed to fetch sources:', error);
        proxySources = FALLBACK_SOURCES;
    }

    // Transform to VideoSource format
    return proxySources.map((source) => {
        let embedUrl = source.url || '';

        // URL Processing Logic
        // VidSrc & VidSrc Pro
        if (source.id === 'vidsrc' || source.id?.includes('vidsrc')) {
            // Remove trailing slashes if any
            const base = embedUrl.replace(/\/$/, '');
            if (type === 'movie') {
                embedUrl = `${base}/movie/${tmdbId}`;
            } else {
                embedUrl = `${base}/tv/${tmdbId}/${season}/${episode}`;
            }
        }

        // SuperEmbed / MultiEmbed
        else if (source.id === 'superembed' || embedUrl.includes('multiembed')) {
            // https://multiembed.mov/directstream.php?video_id={id}&tmdb=1
            embedUrl = embedUrl.replace('{id}', tmdbId);
            if (type === 'tv') {
                embedUrl += `&s=${season}&e=${episode}`;
            }
        }

        // SmashyStream
        else if (source.id === 'smashystream' || embedUrl.includes('smashy.stream')) {
            // https://player.smashy.stream/movie/{id}
            const base = embedUrl.replace(/\/$/, '');
            if (type === 'movie') {
                embedUrl = `${base}/movie/${tmdbId}`;
            } else {
                embedUrl = `${base}/tv/${tmdbId}/${season}/${episode}`;
            }
        }

        // AutoEmbed
        else if (source.id === 'autoembed' || embedUrl.includes('autoembed')) {
            // https://autoembed.co/movie/tmdb/{id}
            const base = embedUrl.replace(/\/$/, '');
            if (type === 'movie') {
                embedUrl = `${base}/movie/tmdb/${tmdbId}`;
            } else {
                embedUrl = `${base}/tv/tmdb/${tmdbId}-${season}-${episode}`;
            }
        }

        // 2Embed (Legacy/Fallback)
        else if (source.id === '2embed' || embedUrl.includes('2embed')) {
            if (type === 'movie') {
                embedUrl = `https://www.2embed.cc/embed/${tmdbId}`;
            } else {
                embedUrl = `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
            }
        }

        return {
            id: `${source.id}-${tmdbId}-${season || ''}-${episode || ''}`,
            name: source.name,
            embedUrl,
            quality: '1080p', // Default assumption
            language: 'English', // Default assumption
            isWorking: true,
            lastChecked: new Date(),
        };
    });
}
