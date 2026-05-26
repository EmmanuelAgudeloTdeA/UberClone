import { addDoc, collection, Timestamp } from 'firebase/firestore';

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
