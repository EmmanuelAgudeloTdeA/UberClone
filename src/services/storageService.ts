import * as FileSystem from 'expo-file-system';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';

import { storage } from './firebase';

// uploadBytes with a Blob fails on React Native (Firebase JS SDK uses XHR internally
// and can't serialize RN Blobs correctly). Reading as base64 + uploadString is reliable.
export async function uploadProfilePhoto(uid: string, localUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const storageRef = ref(storage, `users/${uid}/avatar`);
  await uploadString(storageRef, base64, 'base64');
  return getDownloadURL(storageRef);
}
