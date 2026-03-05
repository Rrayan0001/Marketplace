const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Read service account from .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT_KEY=(.*)/);

if (!match) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local');
    process.exit(1);
}

const serviceAccount = JSON.parse(match[1]);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const auth = admin.auth();

async function promoteFirstUser() {
    try {
        const listUsersResult = await auth.listUsers(10);
        if (listUsersResult.users.length === 0) {
            console.log('No users found in Firebase Auth.');
            return;
        }

        const user = listUsersResult.users[0]; // Promote the first one for now, or use an email
        console.log(`Promoting user: ${user.email} (${user.uid})`);

        await auth.setCustomUserClaims(user.uid, { role: 'admin' });

        await db.collection('profiles').doc(user.uid).set({
            email: user.email,
            role: 'admin',
            status: 'approved',
            full_name: 'Admin User',
            created_at: new Date().toISOString()
        }, { merge: true });

        console.log('Success! User promoted to admin.');
    } catch (error) {
        console.error('Error promoting user:', error);
    }
}

promoteFirstUser();
