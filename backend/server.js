const express = require('express');
const cors = require('cors');
const { ApifyClient } = require('apify-client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const multer = require('multer');
const pdfParse = require('pdf-parse-fork');
const upload = multer({ storage: multer.memoryStorage() });

let client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

const updateClient = (newToken) => {
    client = new ApifyClient({
        token: newToken,
    });
    process.env.APIFY_API_TOKEN = newToken;
};

// Real-time Activity Log (In-memory)
let activityLog = [];
const addActivity = (type, summary, details = {}) => {
    const activity = {
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toISOString(),
        type,
        summary,
        ...details
    };
    activityLog.unshift(activity);
    if (activityLog.length > 50) activityLog.pop();
};

// Keyword map for extraction
const TECH_KEYWORDS = [
    'frontend', 'backend', 'fullstack', 'react', 'nextjs', 'node', 'python', 'java', 'javascript',
    'typescript', 'aws', 'cloud', 'devops', 'manager', 'lead', 'ios', 'android', 'go', 'php',
    'ruby', 'c++', 'c#', 'dotnet', 'engineer', 'developer', 'hiring', 'recruiter'
];

app.post('/parse-resume', upload.single('resume'), async (req, res) => {
    if (!req.file) {
        addActivity('ERROR', 'Resume parse attempt with no file');
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const data = await pdfParse(req.file.buffer);
        const text = data.text.toLowerCase();
        
        // Simple keyword extraction
        const foundKeywords = TECH_KEYWORDS.filter(kw => text.includes(kw));
        
        console.log(`Parsed resume. Found keywords: ${foundKeywords.join(', ')}`);
        addActivity('RESUME_PARSE', `Resume parsed: ${foundKeywords.length} keywords found`, { keywords: foundKeywords });
        res.json({ keywords: foundKeywords });
    } catch (error) {
        console.error('Error parsing resume:', error);
        addActivity('ERROR', `Resume parse failed: ${error.message}`);
        res.status(500).json({ error: "Failed to parse resume: " + error.message });
    }
});

app.post('/scrape', async (req, res) => {
    const { keywords, location, customDomains, maxEmails } = req.body;

    if (!process.env.APIFY_API_TOKEN) {
        addActivity('ERROR', 'Scrape failed: APIFY_API_TOKEN not configured');
        return res.status(500).json({ error: "APIFY_API_TOKEN not configured" });
    }

    try {
        console.log(`Starting Apify Actor run with input:`, { keywords, location, customDomains, maxEmails });

        // Start the actor and wait for it to finish
        const run = await client.actor("contacts-api/indeed-email-scraper-fast-advanced-and-cheapest").call({
            keywords,
            location,
            customDomains,
            maxEmails,
        });

        console.log(`Apify run finished. Run ID: ${run.id}. Fetching dataset items...`);

        // Fetch results from the dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log(`Successfully fetched ${items.length} items from dataset.`);
        addActivity('SCRAPE_COMPLETE', `Scrape finished for "${keywords}": ${items.length} leads found`, { runId: run.id, itemCount: items.length });

        res.json({ results: items });
    } catch (error) {
        console.error('Error during scrape:', error);
        addActivity('ERROR', `Scrape failed for "${req.body.keywords}": ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/admin/runs', async (req, res) => {
    try {
        const runs = await client.runs().list({ limit: 10, desc: true });
        res.json({ runs: runs.items });
    } catch (error) {
        console.error('Error fetching runs:', error);
        res.status(500).json({ error: "Failed to fetch runs: " + error.message });
    }
});

app.get('/admin/stats', async (req, res) => {
    try {
        const user = await client.user().get();
        res.json({ 
            usage: {
                creditsUsed: user.plan.maxMonthlyUsageUsd - 0, // Simplified for now
                maxCredits: user.plan.maxMonthlyUsageUsd,
                dataRetentionDays: user.plan.dataRetentionDays
            },
            userInfo: {
                username: user.username,
                email: user.email,
                plan: user.plan.id
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: "Failed to fetch stats: " + error.message });
    }
});

app.get('/admin/activity', (req, res) => {
    res.json({ activity: activityLog });
});

app.post('/admin/config', async (req, res) => {
    const { apifyToken } = req.body;

    if (!apifyToken) {
        return res.status(400).json({ error: "Missing apifyToken" });
    }

    try {
        // 1. Update in-memory client
        updateClient(apifyToken);

        // 2. Persist to .env
        const envPath = path.join(__dirname, '.env');
        let envContent = '';
        
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
            const regex = /^APIFY_API_TOKEN=.*$/m;
            if (regex.test(envContent)) {
                envContent = envContent.replace(regex, `APIFY_API_TOKEN=${apifyToken}`);
            } else {
                envContent += `\nAPIFY_API_TOKEN=${apifyToken}`;
            }
        } else {
            envContent = `APIFY_API_TOKEN=${apifyToken}`;
        }
        
        fs.writeFileSync(envPath, envContent);

        addActivity('CONFIG_CHANGE', 'Apify API Token updated and persisted');
        res.json({ success: true, message: "API Token updated successfully" });
    } catch (error) {
        console.error('Error updating config:', error);
        addActivity('ERROR', `Failed to update API Token: ${error.message}`);
        res.status(500).json({ error: "Failed to update configuration: " + error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
