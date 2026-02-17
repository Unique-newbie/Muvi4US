
import * as cheerio from 'cheerio';
import axios from 'axios';
import { VideoSource } from '@/types';

// Define the interface for a scraper provider
export interface ScraperProvider {
    name: string;
    baseUrl: string;
    isEnabled: boolean;
    search(query: string): Promise<SearchResult[]>;
    getStreamUrl(id: string): Promise<string | null>;
}

export interface SearchResult {
    title: string;
    url: string;
    year?: string;
    poster?: string;
    id?: string;
}

// Example Provider: Archive.org (Classic/Public Domain Movies)
// This is a safe example to demonstrate the pattern.
export const ArchiveOrgProvider: ScraperProvider = {
    name: 'Archive.org',
    baseUrl: 'https://archive.org',
    isEnabled: true,

    async search(query: string): Promise<SearchResult[]> {
        try {
            const searchUrl = `${this.baseUrl}/advancedsearch.php?q=${encodeURIComponent(query + ' AND mediatype:(movies)')}&fl[]=identifier&fl[]=title&fl[]=year&sort[]=downloads+desc&rows=5&page=1&output=json`;
            const response = await axios.get(searchUrl);
            const docs = response.data.response.docs;

            return docs.map((doc: any) => ({
                title: doc.title,
                url: `${this.baseUrl}/details/${doc.identifier}`,
                year: doc.year,
                id: doc.identifier
            }));
        } catch (error) {
            console.error(`[Archive.org] Search failed:`, error);
            return [];
        }
    },

    async getStreamUrl(id: string): Promise<string | null> {
        try {
            // Find the mp4 file in the metadata
            const metaUrl = `${this.baseUrl}/metadata/${id}`;
            const response = await axios.get(metaUrl);
            const files = response.data.files;

            const mp4File = files.find((f: any) => f.format === 'MPEG4' || f.name.endsWith('.mp4'));

            if (mp4File) {
                return `https://${response.data.d1}${response.data.dir}/${mp4File.name}`;
            }
            return null;
        } catch (error) {
            console.error(`[Archive.org] Stream fetch failed:`, error);
            return null;
        }
    }
};

// Test Provider: Big Buck Bunny (Always works for testing)
export const TestProvider: ScraperProvider = {
    name: 'Test Source (Big Buck Bunny)',
    baseUrl: 'https://test.com',
    isEnabled: true,

    async search(query: string): Promise<SearchResult[]> {
        // Always return a result for testing
        return [{
            title: 'Big Buck Bunny (Test)',
            url: 'https://test.com/bbb',
            year: '2008',
            id: 'bbb-test'
        }];
    },

    async getStreamUrl(id: string): Promise<string | null> {
        return 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    }
};

// Main Scraper Engine
export class ScraperEngine {
    providers: ScraperProvider[] = [ArchiveOrgProvider, TestProvider];

    async searchAll(query: string): Promise<SearchResult[]> {
        const results: SearchResult[] = [];

        // Run providers in parallel
        await Promise.all(this.providers.map(async (provider) => {
            if (!provider.isEnabled) return;
            try {
                const providerResults = await provider.search(query);
                results.push(...providerResults);
            } catch (e) {
                console.error(`Failed to search ${provider.name}`, e);
            }
        }));

        return results;
    }

    async getSource(providerName: string, id: string): Promise<VideoSource | null> {
        const provider = this.providers.find(p => p.name === providerName);
        if (!provider) return null;

        const streamUrl = await provider.getStreamUrl(id);
        if (!streamUrl) return null;

        return {
            id: `${providerName}-${id}`,
            name: provider.name,
            embedUrl: streamUrl,
            quality: 'HD', // Assume HD for MP4s
            language: 'English',
            isWorking: true,
            lastChecked: new Date()
        } as any; // Type assertion since 'HD' vs '1080p' mismatch might exist, need to align types
    }
}

export const scraperEngine = new ScraperEngine();
