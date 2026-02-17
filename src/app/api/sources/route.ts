
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

        // 1. Search for the movie using ALL providers
        // We append year to query for better accuracy
        const query = `${title} ${year || ''}`;
        const searchResults = await scraperEngine.searchAll(query);

        if (searchResults.length === 0) {
            return NextResponse.json({ sources: [] });
        }

        // 2. Loop through results to find the first working stream
        for (const result of searchResults) {
            if (!result.id) continue;

            // Determine provider from ID prefix or metadata. 
            // Our engine examples are simple, so we check if ID implies test or archive
            let providerName = 'Archive.org';
            if (result.id === 'bbb-test') providerName = 'Test Source (Big Buck Bunny)';

            console.log(`[Scraper] Checking stream for: ${result.title} (${providerName})`);

            try {
                const source = await scraperEngine.getSource(providerName, result.id);
                if (source) {
                    return NextResponse.json({
                        sources: [source]
                    });
                }
            } catch (e) {
                console.error(`[Scraper] Failed to get stream from ${providerName}`, e);
            }
        }

        return NextResponse.json({ sources: [] });

    } catch (error: any) {
        console.error('[Scraper API] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
