const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.*)/);
const serviceAccount = JSON.parse(match[1]);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function inspectCollections() {
    const collections = ['jobs', 'restaurant_profiles', 'applications'];
    for (const col of collections) {
        console.log(`--- Collection: ${col} ---`);
        const snap = await db.collection(col).limit(1).get();
        if (snap.empty) {
            console.log('Empty');
        } else {
            console.log(JSON.stringify(snap.docs[0].data(), null, 2));
        }
    }
}

inspectCollections();
