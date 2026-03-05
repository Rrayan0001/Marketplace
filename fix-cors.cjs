const { Storage } = require('@google-cloud/storage');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

const storage = new Storage({
    credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key,
    },
    projectId: serviceAccount.project_id
});

async function findBuckets() {
    console.log(`Looking up buckets for project: ${serviceAccount.project_id}...`);

    const [buckets] = await storage.getBuckets();

    if (buckets.length === 0) {
        console.log("❌ No buckets found in this project.");
        return;
    }

    console.log("✅ Found the following buckets:");
    buckets.forEach(b => console.log(`- ${b.name}`));

    const bucket = buckets[0];
    console.log(`\nSetting CORS config for bucket: ${bucket.name}`);

    await bucket.setCorsConfiguration([
        {
            origin: ["https://marketplace.margros.in", "http://localhost:3000"],
            method: ["GET", "POST", "PUT", "DELETE", "HEAD"],
            maxAgeSeconds: 3600,
            responseHeader: [
                "Content-Type",
                "Authorization",
                "Content-Length",
                "X-Requested-With",
                "x-goog-resumable"
            ]
        }
    ]);

    console.log("✅ CORS configuration successfully updated!");
}

findBuckets().catch(console.error);
