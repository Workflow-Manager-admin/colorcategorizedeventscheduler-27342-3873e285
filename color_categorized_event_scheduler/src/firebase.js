import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";

// PUBLIC_INTERFACE
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY", // <-- Replace with your Firebase project keys!
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};
// PUBLIC_INTERFACE
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * PUBLIC_INTERFACE
 * Fetch user profile (if exists); create if absent.
 */
export async function getOrCreateUserProfile(uid, defaultProfile = {}) {
  if (!uid) throw new Error("No UID specified");
  const profileRef = doc(db, "profiles", uid);
  const snap = await getDoc(profileRef);
  if (!snap.exists()) {
    await setDoc(profileRef, {
      name: defaultProfile.name || "",
      photoURL: defaultProfile.photoURL || "",
      timezone: defaultProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: Date.now()
    });
    return (await getDoc(profileRef)).data();
  }
  return snap.data();
}

/**
 * PUBLIC_INTERFACE
 * Update user profile
 */
export async function updateUserProfile(uid, profile) {
  if (!uid) throw new Error("No UID specified");
  const profileRef = doc(db, "profiles", uid);
  await setDoc(profileRef, { ...profile }, { merge: true });
}

/**
 * PUBLIC_INTERFACE
 * Fetch all events for a particular user
 */
export async function fetchEventsForUser(uid) {
  const result = [];
  if (!uid) return result;
  const eventsRef = collection(db, "users", uid, "events");
  const q = query(eventsRef, orderBy("start"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    result.push({ id: doc.id, ...doc.data() });
  });
  return result;
}

/**
 * PUBLIC_INTERFACE
 * Save an event (add or update)
 */
export async function saveUserEvent(uid, eventObj) {
  const eventsRef = collection(db, "users", uid, "events");
  if (eventObj.id) {
    const eventRef = doc(eventsRef, eventObj.id);
    await updateDoc(eventRef, { ...eventObj });
    return eventObj.id;
  } else {
    const added = await addDoc(eventsRef, { ...eventObj });
    return added.id;
  }
}

/**
 * PUBLIC_INTERFACE
 * Delete an event
 */
export async function deleteUserEvent(uid, eventId) {
  const eventRef = doc(db, "users", uid, "events", eventId);
  await deleteDoc(eventRef);
}

/**
 * PUBLIC_INTERFACE
 * Listen for authentication state changes.
 */
export function listenAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export { GoogleAuthProvider, updateProfile, fbSignOut };
