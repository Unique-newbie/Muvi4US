
import { NextResponse } from 'next/server';
import { scraperEngine } from '@/lib/scraper/engine';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tmdbId = searchParams.get('tmdbId');
    const title = searchParams.get('title');
    const year = searchParams.get('year');
    const type = searchParams.get('type') as 'movie' | 'tv';

    // For now, only movies are supported by our simple scraper example
    if (!tmdbId || !title || type !== 'movie') {
        // Return empty if not supported yet to avoid breaking playback
        return NextResponse.json({ sources: [] });
    }

    try {
        console.log(`[Scraper] Searching for: ${title} (${year})`);

        // 1. Search for the movie
        // We append year to query for better accuracy
        const query = `${title} ${year || ''}`;
        const searchResults = await scraperEngine.providers[0].search(query);

        if (searchResults.length === 0) {
            return NextResponse.json({ sources: [] });
        }

        // 2. Resolve the first result (basic logic)
        // In a real app, you'd match years/titles more strictly
        const bestMatch = searchResults[0];
        console.log(`[Scraper] Best match: ${bestMatch.title}`);

        if (!bestMatch.id) {
            return NextResponse.json({ sources: [] });
        }

        const sourceUrl = await scraperEngine.providers[0].getStreamUrl(bestMatch.id);

        if (sourceUrl) {
            return NextResponse.json({
                sources: [{
                    id: `archive-${bestMatch.id}`,
                    name: 'Archive.org (Public Domain)',
                    embedUrl: sourceUrl,
                    quality: '1080p',
                    language: 'English',
                    isWorking: true,
                    lastChecked: new Date()
                }]
            });
        }

        return NextResponse.json({ sources: [] });

    } catch (error: any) {
        console.error('[Scraper API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
