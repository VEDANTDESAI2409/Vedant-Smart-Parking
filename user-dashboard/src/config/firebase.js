import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAurkly0AqXxGqmB9m1gl3IzEMRJfKPt0w',
  authDomain: 'parkngo-51eb0.firebaseapp.com',
  projectId: 'parkngo-51eb0',
  appId: '1:330699603111:web:79615a466eabba983e6f82',
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);

const app = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
const firebaseAuth = app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });

export { firebaseAuth, googleProvider, hasFirebaseConfig };
