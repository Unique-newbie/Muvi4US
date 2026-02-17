
# How to Scrape Content for MoviePirate 🏴‍☠️

"Scraping" content usually means writing code to visit another website, read its HTML, and extract specific data (like video links, titles, or posters).

## ⚠️ Important Legal & Ethical Warning
Scraping copyrighted content is a legal grey area and often violates Terms of Service. 
- **Respect `robots.txt`**: Check if the site allows bots.
- **Don't DDoS**: Rate limit your requests.
- **Embeds are safer**: The method we currently use (loading `vidsrc` in an iframe) is generally safer because we aren't hosting or "stealing" the content file itself, just pointing to it.

---

## Method 1: The "Embed" Method (Current & Recommended)
This isn't true scraping. You construct a URL based on a known pattern.
**Example:** `https://vidsrc.xyz/embed/movie/{tmdb_id}`

**Pros:**
- FAST (No server processing)
- Easy to implement
- Minimal server cost

**Cons:**
- Relies on the provider staying alive
- You can't control ads

---

## Method 2: Server-Side Scraping (API Routes)
If you want to extract a specific link from a page (e.g., getting a direct `.mp4` link from a site), you need a **Server-Side Scraper**.

**Why Server-Side?**
- **CORS**: Browsers block you from fetching `google.com` from `your-site.com`. Servers don't have this restriction.
- **Hiding IP**: You can use proxies.
- **Performance**: You can cache the results.

### Recommended Stack
1.  **Cheerio** (`npm install cheerio`): Fast, parses HTML like jQuery. Good for static sites.
2.  **Puppeteer/Playwright**: Runs a full headless browser. Good for sites that require JavaScript to load (e.g., React sites).

### Example Workflow
1.  Create an API route: `src/app/api/scrape/route.ts`
2.  Fetch the target URL.
3.  Load HTML into Cheerio.
4.  Select the element (e.g., `$('iframe').attr('src')`).
5.  Return the data.

---

## Method 3: Client-Side Scraping (Not Recommended)
Trying to `fetch('https://other-site.com')` in your frontend React components.
**Why it fails**:
- **CORS Errors**: The other site will block you.
- **Insecure**: Exposes your logic and keys.

---
