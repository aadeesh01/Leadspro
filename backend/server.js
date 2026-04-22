const express = require('express');
const cors = require('cors');
const { ApifyClient } = require('apify-client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;;

app.use(cors({
  origin: [
    "https://leadspro-major.vercel.app",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const multer = require('multer');
const pdfParse = require('pdf-parse-fork');
const upload = multer({ storage: multer.memoryStorage() });

const scraperService = require('./services/scraperService');

// const client = new ApifyClient({
//     token: process.env.APIFY_API_TOKEN,
// });

// const updateClient = (newToken) => {
//     client = new ApifyClient({
//         token: newToken,
//     });
//     process.env.APIFY_API_TOKEN = newToken;
// };

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
    'ruby', 'c++', 'c#', 'dotnet', 'engineer', 'developer', 'hiring', 'recruiter',
    'vue', 'angular', 'svelte', 'tailwind', 'bootstrap', 'sass', 'less', 'express',
    'postgresql', 'mongodb', 'sql', 'nosql', 'docker', 'kubernetes', 'terraform',
    'ansible', 'jenkins', 'circleci', 'graphql', 'apollo', 'redux', 'mobx', 'jest',
    'cypress', 'selenium', 'figma', 'git', 'agile', 'scrum', 'machine learning', 'ai',
    'data science', 'blockchain', 'solidity', 'rust', 'cybersecurity', 'security',
    'qa', 'testing', 'product manager', 'project manager', 'ui', 'ux', 'design',
    'rest api', 'microservices', 'serverless', 'azure', 'gcp', 'firebase', 'linux',
    'bash', 'powershell'
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
    try {
        console.log(`Starting local scrape with input:`, { keywords, location, maxEmails });

        const items = await scraperService.scrape({
            keywords,
            location,
            maxEmails: parseInt(maxEmails) || 10
        });

        console.log(`Successfully fetched ${items.length} items.`);
        addActivity('SCRAPE_COMPLETE', `Scrape finished for "${keywords}": ${items.length} leads found`, { itemCount: items.length });

        res.json({ results: items });
    } catch (error) {
        console.error('Error during scrape:', error);
        addActivity('ERROR', `Scrape failed for "${req.body.keywords}": ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/admin/runs', async (req, res) => {
    // Placeholder for local runs log if implemented later
    res.json({ runs: [] });
});

app.get('/admin/stats', async (req, res) => {
    res.json({ 
        usage: {
            creditsUsed: 0,
            maxCredits: 'Unlimited (Local)',
            dataRetentionDays: 'Local'
        },
        userInfo: {
            username: 'Local Admin',
            email: 'admin@local',
            plan: 'Self-Hosted'
        }
    });
});

app.get('/admin/activity', (req, res) => {
    res.json({ activity: activityLog });
});

app.post('/admin/config', async (req, res) => {
    res.status(400).json({ error: "External API Token configuration is no longer needed for the local scraper." });
});

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
