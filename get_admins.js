require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

try {
  let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (typeof serviceAccount === 'string') {
    serviceAccount = JSON.parse(serviceAccount);
  }

  initializeApp({
    credential: cert(serviceAccount)
  });

  const db = getFirestore();
  
  async function findAdmins() {
    console.log("Fetching admins...");
    const snapshot = await db.collection('profiles').where('role', '==', 'admin').get();
    if (snapshot.empty) {
      console.log('No admin users found.');
      return;
    }
    
    snapshot.forEach(doc => {
      console.log('Admin Profile Found:', doc.id, '=>', doc.data());
    });
  }
  
  findAdmins().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
} catch(e) {
  console.error("Initialization error:", e);
}
