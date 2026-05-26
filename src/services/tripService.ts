import { addDoc, collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';

import { auth, db } from '@/services/firebase';
import { PlaceResult, VehicleType } from '@/store/tripSlice';

export interface TripRecord {
  origin: PlaceResult;
  destination: PlaceResult;
  fare: number;
  vehicleType: VehicleType;
  paymentMethod: 'stripe' | 'mercadopago';
  date: Timestamp;
  status: 'completed';
}

export async function fetchTripHistory(): Promise<TripRecord[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  const q = query(collection(db, 'users', uid, 'trips'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as TripRecord);
}

export async function saveCompletedTrip(
  data: Omit<TripRecord, 'date' | 'status'>,
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');

  await addDoc(collection(db, 'users', uid, 'trips'), {
    ...data,
    date: Timestamp.now(),
    status: 'completed',
  });
}
