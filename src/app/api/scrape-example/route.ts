
import { NextResponse } from 'next/server';
// import * as cheerio from 'cheerio'; // Uncommon: You would need to install this: npm install cheerio

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        // 1. Fetch the target page
        // Note: Real scraping often needs custom headers (User-Agent, etc.) to look like a browser.
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch site: ${response.statusText}`);
        }

        const html = await response.text();

        // 2. Parse HTML (Theoretical Example)
        // const $ = cheerio.load(html);
        // const pageTitle = $('title').text();
        // const iframeSrc = $('iframe').first().attr('src');

        // For demonstration without installing cheerio yet:
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        const pageTitle = titleMatch ? titleMatch[1] : 'Unknown Title';

        return NextResponse.json({
            success: true,
            data: {
                url: targetUrl,
                title: pageTitle,
                // iframe: iframeSrc
                message: "To parse more complex data, run 'npm install cheerio' and uncomment the code in this route."
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
