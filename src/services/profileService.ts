import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import type { Gender, Language, SerializableUserProfile } from '@/types/user';
import { auth, db } from './firebase';

// ─── Firestore ────────────────────────────────────────────────────────────────

export async function fetchUserProfile(uid: string): Promise<SerializableUserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    uid: data.uid,
    fullName: data.fullName,
    phone: data.phone,
    gender: data.gender,
    email: data.email,
    language: data.language,
    photoURL: data.photoURL ?? '',
    createdAt: data.createdAt?.toMillis() ?? null,
  };
}

interface ProfileUpdates {
  fullName?: string;
  phone?: string;
  gender?: Gender;
  language?: Language;
  photoURL?: string;
}

export async function updateUserProfile(uid: string, updates: ProfileUpdates): Promise<void> {
  await updateDoc(doc(db, 'users', uid), updates as Record<string, unknown>);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function changeUserPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const { currentUser } = auth;
  if (!currentUser || !currentUser.email) throw new Error('User not authenticated');

  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
  await reauthenticateWithCredential(currentUser, credential);
  await updatePassword(currentUser, newPassword);
}
