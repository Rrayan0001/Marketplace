const admin = require('firebase-admin');
const serviceAccount = require('./sa.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function run() {
  const docs = await db.collection('documents').get();
  console.log('All documents:', docs.docs.map(d => ({id: d.id, ...d.data()})));
  
  const profiles = await db.collection('restaurant_profiles').get();
  console.log('All restaurant profiles:', profiles.docs.map(d => ({id: d.id, ...d.data()})));
}

run().catch(console.error);
