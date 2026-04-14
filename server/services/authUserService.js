const crypto = require('crypto');
const User = require('../models/User');
const { getFirestore } = require('../config/firebaseAdmin');

const usersCollection = () => getFirestore().collection('users');

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
};

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email || null,
  phone: user.phone || null,
  role: user.role,
  firebaseUid: user.firebaseUid || null,
  emailVerified: Boolean(user.emailVerified),
  phoneVerified: Boolean(user.phoneVerified),
  authProviders: user.authProviders,
  lastLogin: user.lastLogin,
});

const buildFirestoreUser = (user) => ({
  appUserId: user._id.toString(),
  name: user.name,
  email: user.email || null,
  phone: user.phone || null,
  role: user.role,
  firebaseUid: user.firebaseUid || null,
  emailVerified: Boolean(user.emailVerified),
  phoneVerified: Boolean(user.phoneVerified),
  authProviders: user.authProviders,
  lastLogin: user.lastLogin || new Date(),
  updatedAt: new Date(),
});

const getSyntheticPassword = () => crypto.randomBytes(24).toString('hex');

const resolveUserLookup = async ({ firebaseUid, email, phone }) => {
  if (firebaseUid) {
    const byFirebaseUid = await User.findOne({ firebaseUid });
    if (byFirebaseUid) return byFirebaseUid;
  }

  if (email) {
    const byEmail = await User.findOne({ email: email.toLowerCase() });
    if (byEmail) return byEmail;
  }

  if (phone) {
    const byPhone = await User.findOne({ phone });
    if (byPhone) return byPhone;
  }

  return null;
};

const syncUserRecord = async ({
  firebaseUid = null,
  name,
  email = null,
  phone = null,
  emailVerified = false,
  phoneVerified = false,
  provider,
}) => {
  const normalizedEmail = email ? email.toLowerCase() : null;
  const existingUser = await resolveUserLookup({ firebaseUid, email: normalizedEmail, phone });
  const user = existingUser || new User({ name: name || 'Park n Go User', password: getSyntheticPassword() });

  user.name = name || user.name || 'Park n Go User';
  user.email = normalizedEmail || user.email || undefined;
  user.phone = phone || user.phone || undefined;
  user.firebaseUid = firebaseUid || user.firebaseUid || undefined;
  user.emailVerified = Boolean(emailVerified || user.emailVerified);
  user.phoneVerified = Boolean(phoneVerified || user.phoneVerified);
  user.lastLogin = new Date();
  user.authProviders = {
    password: provider === 'password' || user.authProviders?.password || Boolean(user.password),
    phone: provider === 'phone' || user.authProviders?.phone || Boolean(user.phoneVerified),
    google: provider === 'google' || user.authProviders?.google || false,
    firebaseEmail: provider === 'firebase-email' || user.authProviders?.firebaseEmail || false,
  };

  await user.save();

  const docRef = usersCollection().doc(user._id.toString());
  const snapshot = await docRef.get();
  const existingData = snapshot.exists ? snapshot.data() : {};

  await docRef.set(
    {
      ...existingData,
      ...buildFirestoreUser(user),
      createdAt: existingData.createdAt || user.createdAt || new Date(),
    },
    { merge: true },
  );

  return sanitizeUser(user);
};

const getAuthProfileById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  const firestoreSnapshot = await usersCollection().doc(userId).get();
  const firestoreData = firestoreSnapshot.exists ? firestoreSnapshot.data() : null;

  return {
    ...sanitizeUser(user),
    firestoreProfile: firestoreData
      ? {
          ...firestoreData,
          createdAt: toDate(firestoreData.createdAt),
          updatedAt: toDate(firestoreData.updatedAt),
          lastLogin: toDate(firestoreData.lastLogin),
        }
      : null,
  };
};

module.exports = {
  syncUserRecord,
  getAuthProfileById,
};
