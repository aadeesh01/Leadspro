const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');

puppeteer.use(StealthPlugin());

/**
 * Scraper Service - Replaces Apify Indeed Scraper
 * Uses Puppeteer to find leads based on keywords and location.
 */
class ScraperService {
    async scrape({ keywords, location, maxEmails = 10 }) {
        console.log(`Starting local scrape: keywords="${keywords}", location="${location}"`);
        
        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            
            // Set a realistic User Agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

            const searchUrl = `https://www.indeed.com/`;
            console.log(`Navigating to: ${searchUrl}`);
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

            // Diagnostic: save page if expected selector is missing
            const whatSelector = '#text-input-what';
            const inputExists = await page.$(whatSelector);
            
            if (!inputExists) {
                console.log('Main search selector not found. Saving diagnostic HTML.');
                const content = await page.content();
                const fs = require('fs');
                const path = require('path');
                fs.writeFileSync(path.join(process.cwd(), 'debug_indeed_fail.html'), content);
                
                const title = await page.title();
                console.log(`Page title: ${title}`);
                if (title.includes('hCaptcha') || title.includes('CAPTCHA') || title.includes('Human')) {
                    throw new Error('Indeed triggered a CAPTCHA/Challenge page. Please try again later or use a proxy.');
                }
                throw new Error(`Expected search selector ${whatSelector} not found on page.`);
            }

            // Type keywords and location
            console.log('Typing search query...');
            await page.type(whatSelector, keywords, { delay: 100 });
            
            // Clear default location and type new one
            await page.click('#text-input-where');
            await page.keyboard.down('Control');
            await page.keyboard.press('A');
            await page.keyboard.up('Control');
            await page.keyboard.press('Backspace');
            await page.type('#text-input-where', location, { delay: 100 });

            await Promise.all([
                page.click('button[type="submit"]'),
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
            ]);

            // Check for results
            const content = await page.content();
            const $ = cheerio.load(content);
            const results = [];
            
            // Indeed Job Card selectors (they update frequently, let's try common ones)
            $('.job_seen_beacon, .result').each((i, el) => {
                if (results.length >= maxEmails) return;

                const resultTitle = $(el).find('h2.jobTitle, .jobTitle').text().trim();
                const companyName = $(el).find('[data-testid="company-name"], .companyName').text().trim();
                const jobLocation = $(el).find('[data-testid="text-location"], .companyLocation').text().trim();
                const url = $(el).find('a').attr('href');
                const snippet = $(el).find('.job-snippet, .summary').text().trim();

                if (resultTitle && companyName) {
                    results.push({
                        title: resultTitle,
                        company: companyName,
                        location: jobLocation || location,
                        url: url ? `https://www.indeed.com${url}` : null,
                        snippet: snippet,
                        source: 'Indeed'
                    });
                }
            });

            console.log(`Scrape finished. Found ${results.length} results.`);
            return results;

        } catch (error) {
            console.error('Scraper error:', error);
            throw error;
        } finally {
            await browser.close();
        }
    }
}

module.exports = new ScraperService();
