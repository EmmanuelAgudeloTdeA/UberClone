import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from './firebase';

// Requires Firebase Storage to be enabled in the Firebase Console.
export async function uploadProfilePhoto(uid: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const storageRef = ref(storage, `users/${uid}/avatar`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
