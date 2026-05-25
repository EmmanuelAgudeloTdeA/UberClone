import type { Timestamp } from 'firebase/firestore';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type Language = 'en' | 'es';

export interface UserProfile {
  uid: string;
  fullName: string;
  phone: string;
  gender: Gender;
  email: string;
  language: Language;
  photoURL: string;
  createdAt: Timestamp | null;
}

// Redux-safe variant (Timestamp replaced with ms number)
export interface SerializableUserProfile {
  uid: string;
  fullName: string;
  phone: string;
  gender: Gender;
  email: string;
  language: Language;
  photoURL: string;
  createdAt: number | null;
}
