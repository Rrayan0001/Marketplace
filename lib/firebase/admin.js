import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    try {
        const serviceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
        );

        // Ensure literal \n are converted to actual newlines if present
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        return initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (error) {
        console.error('Firebase Admin Init Error:', error);
        // Fallback to application default credentials if available, or just throw
        throw error;
    }
}

const adminApp = getAdminApp();
const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };
