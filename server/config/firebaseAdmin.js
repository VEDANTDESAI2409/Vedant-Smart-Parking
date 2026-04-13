const admin = require('firebase-admin');

let firebaseApp;

const buildCredential = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    return admin.credential.cert(parsed);
  }

  if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }

  return null;
};

const getFirebaseAdminApp = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  const credential = buildCredential();

  if (!credential) {
    throw new Error(
      'Firebase Admin credentials are missing. Set FIREBASE_SERVICE_ACCOUNT_JSON or the FIREBASE_ADMIN_* variables.',
    );
  }

  firebaseApp = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential,
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID,
      });

  return firebaseApp;
};

const getFirebaseAdminAuth = () => admin.auth(getFirebaseAdminApp());

const getFirestore = () => admin.firestore(getFirebaseAdminApp());

module.exports = {
  getFirebaseAdminApp,
  getFirebaseAdminAuth,
  getFirestore,
};
