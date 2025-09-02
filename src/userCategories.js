import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';

export function getCurrentUserId() {
  const auth = getAuth();
  return auth.currentUser ? auth.currentUser.uid : null;
}

export async function saveUserCategory(category) {
  const auth = getAuth();
  const db = getDatabase();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('No user logged in');
  const userCatRef = ref(db, `users/${uid}/categories`);
  // Get current categories
  let current = [];
  try {
    const snap = await get(userCatRef);
    if (snap.exists()) {
      current = snap.val();
      if (!Array.isArray(current)) current = [];
    }
  } catch {}
  if (!current.includes(category)) {
    current.push(category);
    await set(userCatRef, current);
  }
}
