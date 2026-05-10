const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

// Secure key for AES-256-GCM.
const KEY_PATH = path.join(__dirname, 'encryption_key.key');
let ENCRYPTION_KEY;
if (fs.existsSync(KEY_PATH)) {
    ENCRYPTION_KEY = fs.readFileSync(KEY_PATH);
} else {
    ENCRYPTION_KEY = crypto.randomBytes(32);
    fs.writeFileSync(KEY_PATH, ENCRYPTION_KEY);
}

const app = express();
const port = process.env.PORT || 8000;;

app.use(cors({
  origin: "*",
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

// Helper functions for Cryptography
const encrypt = (text) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return { encrypted, iv: iv.toString('hex'), authTag };
};

const decrypt = (encObj) => {
    try {
        const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, Buffer.from(encObj.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(encObj.authTag, 'hex'));
        let decrypted = decipher.update(encObj.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (err) {
        return "Decryption Failed";
    }
};

const hashPassword = (password, salt) => {
    return crypto.scryptSync(password, salt, 64).toString('hex');
};

// User Database (File-backed)
const DB_PATH = path.join(__dirname, 'database.json');
let usersDB = {};

const saveDatabase = () => {
    // Encrypt the entire database structure for maximum security at rest
    const encryptedData = encrypt(JSON.stringify(usersDB));
    fs.writeFileSync(DB_PATH, JSON.stringify(encryptedData, null, 2));
};

if (fs.existsSync(DB_PATH)) {
    try {
        const rawData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        if (rawData.encrypted) {
            const decryptedString = decrypt(rawData);
            if (decryptedString === "Decryption Failed") throw new Error("Decryption Failed");
            usersDB = JSON.parse(decryptedString);
        } else {
            // Backwards compatibility: if it's plain text, load it and encrypt it immediately
            usersDB = rawData;
            saveDatabase();
        }
    } catch (err) {
        console.error("Failed to load or decrypt database:", err);
        usersDB = {};
    }
} else {
    // Mock initial Admin user
    const adminSalt = crypto.randomBytes(16).toString('hex');
    usersDB["admin@pro.com"] = {
        passwordHash: hashPassword('admin123', adminSalt),
        salt: adminSalt,
        role: 'admin',
        credits: 999999,
        searches: [],
        name: 'Admin User'
    };

    // Mock initial standard user
    const userSalt = crypto.randomBytes(16).toString('hex');
    usersDB["user@pro.com"] = {
        passwordHash: hashPassword('user123', userSalt),
        salt: userSalt,
        role: 'user',
        credits: 50,
        searches: [
            {
                keywords: encrypt(JSON.stringify(["React Developer"])),
                location: encrypt("New York"),
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                resultsCount: 10
            }
        ],
        name: 'Standard User'
    };
    saveDatabase();
}

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

app.post('/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    if (usersDB[email]) return res.status(400).json({ error: "User already exists" });

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    usersDB[email] = {
        passwordHash,
        salt,
        role: 'user',
        credits: 50,
        searches: [],
        name
    };
    
    saveDatabase();
    
    addActivity('USER_REGISTERED', `New user registered: ${email}`);
    res.json({ message: "Registration successful", user: { email, role: 'user', credits: 50 } });
});

app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = usersDB[email];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const hash = hashPassword(password, user.salt);
    if (hash !== user.passwordHash) return res.status(401).json({ error: "Invalid credentials" });

    res.json({ user: { email, role: user.role, credits: user.credits } });
});

app.get('/auth/me', (req, res) => {
    const { email } = req.query;
    const user = usersDB[email];
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ credits: user.credits });
});

app.post('/scrape', async (req, res) => {
    const { keywords, location, customDomains, maxEmails, userEmail } = req.body;
    
    // Check Authentication & Credits
    if (!userEmail || !usersDB[userEmail]) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }
    if (usersDB[userEmail].credits < 5) {
        addActivity('CREDITS_EXHAUSTED', `User ${userEmail} attempted to scrape without enough credits.`);
        return res.status(402).json({ error: "Insufficient credits. A search costs 5 credits." });
    }

    try {
        console.log(`Starting local scrape with input:`, { keywords, location, maxEmails });

        const items = await scraperService.scrape({
            keywords,
            location,
            maxEmails: parseInt(maxEmails) || 10
        });

        console.log(`Successfully fetched ${items.length} items.`);
        
        // Deduct exactly 5 credits per search query
        usersDB[userEmail].credits -= 5;

        addActivity('SCRAPE_COMPLETE', `Scrape finished for "${keywords}": ${items.length} leads found. Credits left: ${usersDB[userEmail].credits}`, { itemCount: items.length });

        // Record Encrypted Search History
        usersDB[userEmail].searches.unshift({
            keywords: encrypt(JSON.stringify(keywords)),
            location: encrypt(location || 'Anywhere'),
            timestamp: new Date().toISOString(),
            resultsCount: items.length
        });
        
        saveDatabase();

        res.json({ results: items, remainingCredits: usersDB[userEmail].credits });
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

app.get('/admin/users', (req, res) => {
    // Convert to array format and decrypt searches for the admin
    const usersList = Object.keys(usersDB).map(email => {
        const u = usersDB[email];
        const decryptedSearches = u.searches.map(s => {
            let decryptedKeywords = ["Decryption Failed"];
            try { decryptedKeywords = JSON.parse(decrypt(s.keywords)); } catch(e){}
            return {
                ...s,
                keywords: decryptedKeywords,
                location: decrypt(s.location)
            };
        });
        return {
            email,
            role: u.role,
            credits: u.credits,
            searches: decryptedSearches
        };
    });
    res.json({ users: usersList });
});

app.get('/admin/stats', async (req, res) => {
    // Calculate actual credits used across all users
    let totalCreditsUsed = 0;
    Object.values(usersDB).forEach(user => {
        totalCreditsUsed += (user.searches.length * 5);
    });

    res.json({ 
        usage: {
            creditsUsed: totalCreditsUsed,
            maxCredits: 'Unlimited'
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
