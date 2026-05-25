import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import type { Gender, Language } from '@/types/user';
import { auth, db } from './firebase';

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  gender: Gender;
  language: Language;
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const { user } = await createUserWithEmailAndPassword(auth, payload.email, payload.password);

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    fullName: payload.fullName.trim(),
    phone: payload.phone.trim(),
    gender: payload.gender,
    email: payload.email.trim().toLowerCase(),
    language: payload.language,
    photoURL: '',
    createdAt: serverTimestamp(),
  });
}

export async function loginUser(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
