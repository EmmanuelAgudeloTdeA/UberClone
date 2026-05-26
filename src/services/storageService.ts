import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from './firebase';

// Blob and uploadString(base64) both fail in React Native due to Firebase SDK internals.
// fetch() on a local file:// URI returns a proper ArrayBuffer; Uint8Array avoids all blob issues.
export async function uploadProfilePhoto(uid: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();
  const storageRef = ref(storage, `users/${uid}/avatar`);
  await uploadBytes(storageRef, new Uint8Array(arrayBuffer), { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}
