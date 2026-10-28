import { db } from "@/lib/firebase/config";
import { Trip } from "@/lib/types";
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

/**
 * Fetch a single trip document by ID.
 * Returns null if the document does not exist.
 */
export async function getTrip(tripId: string): Promise<Trip | null> {
  try {
    const tripRef = doc(db, "trips", tripId);
    const snapshot = await getDoc(tripRef);

    if (!snapshot.exists()) {
      return null;
    }

    return { id: snapshot.id, ...snapshot.data() } as Trip;
  } catch (error) {
    console.error(`[getTrip] Failed to fetch trip "${tripId}":`, error);
    throw error;
  }
}

/**
 * Partially update a trip document.
 * Always stamps `updatedAt` with the server timestamp.
 */
export async function updateTrip(
  tripId: string,
  data: Partial<Trip>
): Promise<void> {
  try {
    const tripRef = doc(db, "trips", tripId);
    await updateDoc(tripRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[updateTrip] Failed to update trip "${tripId}":`, error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for a single trip document.
 * Invokes `callback` immediately with the current value and on every change.
 * Returns an Unsubscribe function to stop listening.
 */
export function listenToTrip(
  tripId: string,
  callback: (trip: Trip | null) => void
): Unsubscribe {
  const tripRef = doc(db, "trips", tripId);

  return onSnapshot(
    tripRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      callback({ id: snapshot.id, ...snapshot.data() } as Trip);
    },
    (error) => {
      console.error(`[listenToTrip] Listener error for trip "${tripId}":`, error);
    }
  );
}
