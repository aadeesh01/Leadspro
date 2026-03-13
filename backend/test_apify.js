const { ApifyClient } = require('apify-client');
require('dotenv').config();

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

async function test() {
    try {
        console.log("Fetching runs...");
        const runs = await client.runs().list({ limit: 5, desc: true });
        console.log("Recent Runs:", JSON.stringify(runs.items, null, 2));
        
        // Also check actor-specific runs
        const actorId = "contacts-api/indeed-email-scraper-fast-advanced-and-cheapest";
        console.log(`\nFetching runs for actor: ${actorId}`);
        const actorRuns = await client.actor(actorId).runs().list({ limit: 5, desc: true });
        console.log("Actor Runs:", JSON.stringify(actorRuns.items, null, 2));

        // Get account usage/stats if possible
        console.log("\nFetching account info...");
        const user = await client.user().get();
        console.log("User Info:", JSON.stringify(user, null, 2));

    } catch (error) {
        console.error("Error:", error);
    }
}

test();
