
import { scraperEngine } from '../lib/scraper/engine';

async function testScraper() {
    console.log('Testing Scraper Engine...');

    // Test 1: Search for a known public domain movie
    const query = 'Night of the Living Dead 1968';
    console.log(`\nSearching for: "${query}"`);

    // Mock the engine to ensure providers are loaded if needed (though they are static)

    const results = await scraperEngine.searchAll(query);
    console.log(`Found ${results.length} results.`);

    if (results.length > 0) {
        console.log('First Result:', results[0]);

        // Test 2: Get Stream URL
        if (results[0].id) {
            console.log(`\nFetching stream for ID: ${results[0].id}`);
            const source = await scraperEngine.getSource('Archive.org', results[0].id);
            console.log('Stream Source:', source);
        }
    } else {
        console.log('No results found. Archive.org might be blocking or query is bad.');
    }
}

testScraper().catch(console.error);
