const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

/**
 * Scraper Service - Replaces Indeed Scraper
 * Uses SimplyHired to bypass strict Cloudflare blocks while still providing accurate leads.
 */
class ScraperService {
    async scrape({ keywords, location, maxEmails = 10 }) {
        // Use the 'OR' boolean operator so the search engine finds jobs matching ANY of the keywords, not ALL
        const keywordsStr = Array.isArray(keywords) ? keywords.join(' OR ') : keywords;
        console.log(`Starting SimplyHired scrape for: keywords="${keywordsStr}", location="${location}"`);
        
        let browser;
        try {
            const launchOptions = {
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            };
            if (process.env.PUPPETEER_EXECUTABLE_PATH) {
                launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
            }

            browser = await puppeteer.launch(launchOptions);
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });

            // Determine TLD based on location to ensure results
            let tld = 'com';
            const locLower = location ? location.toLowerCase() : '';
            if (locLower.includes('india') || locLower === 'in') tld = 'co.in';
            else if (locLower.includes('uk') || locLower.includes('kingdom')) tld = 'co.uk';
            else if (locLower.includes('canada')) tld = 'ca';
            else if (locLower.includes('australia')) tld = 'com.au';

            const searchUrl = `https://www.simplyhired.${tld}/search?q=${encodeURIComponent(keywordsStr)}&l=${encodeURIComponent(location || '')}`;
            console.log(`Navigating to: ${searchUrl}`);
            
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 45000 });
            
            const content = await page.content();
            const $ = cheerio.load(content);
            const results = [];

            $('[data-testid="searchSerpJob"]').each((i, el) => {
                if (results.length >= maxEmails) return;

                const titleElem = $(el).find('a').first();
                const title = titleElem.text().trim();
                const url = titleElem.attr('href');
                const company = $(el).find('[data-testid="companyName"]').text().trim();
                const jobLocation = $(el).find('[data-testid="searchSerpJobLocation"]').text().trim();
                const snippet = $(el).find('[data-testid="searchSerpJobSnippet"]').text().trim() || $(el).find('p').text().trim();

                if (title && company) {
                    results.push({
                        title: title,
                        company: company,
                        location: jobLocation || location,
                        url: url ? `https://www.simplyhired.${tld}${url}` : null,
                        snippet: snippet,
                        source: 'SimplyHired',
                        keyword: keywordsStr
                    });
                }
            });

            console.log(`Scrape finished. Found ${results.length} results.`);
            return results;

        } catch (error) {
            console.error('Scraper error:', error);
            throw new Error(`Failed to fetch jobs: ${error.message}`);
        } finally {
            if (browser) await browser.close();
        }
    }
}

module.exports = new ScraperService();
