import type { Persistence } from 'firebase/auth';

// getReactNativePersistence exists in the React Native Firebase Auth build
// but is absent from the web type definitions resolved by TypeScript.
// This augmentation adds it so the import in firebase.ts compiles cleanly.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
