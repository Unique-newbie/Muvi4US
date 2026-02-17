
import { scraperEngine } from '../lib/scraper/engine';

async function checkApiLogic() {
    console.log('Checking API Logic Simulation...');

    // Simulate query parameters
    const title = 'Fight Club';
    const year = '1999';

    console.log(`[Scraper] Searching for: ${title} (${year})`);

    // 1. Search for the movie using ALL providers
    const query = `${title} ${year || ''}`;
    const searchResults = await scraperEngine.searchAll(query);

    console.log(`Found ${searchResults.length} search results.`);
    console.log('Results:', JSON.stringify(searchResults, null, 2));

    if (searchResults.length === 0) {
        console.log('No results found.');
        return;
    }

    // 2. Loop through results to find the first working stream
    for (const result of searchResults) {
        if (!result.id) continue;

        // Determine provider from ID prefix or metadata. 
        let providerName = 'Archive.org';
        if (result.id === 'bbb-test') providerName = 'Test Source (Big Buck Bunny)';

        console.log(`[Scraper] Checking stream for: ${result.title} (${providerName})`);

        try {
            const source = await scraperEngine.getSource(providerName, result.id);
            if (source) {
                console.log('SUCCESS! Found source:', source);
                return;
            } else {
                console.log('Source returned null.');
            }
        } catch (e) {
            console.error(`[Scraper] Failed to get stream from ${providerName}`, e);
        }
    }

    console.log('Finished loop without returning a source.');
}

checkApiLogic().catch(console.error);
