import { db } from "@/lib/firebase/config";
import { Destination } from "@/lib/types";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

const COLLECTION = "destinations";

/**
 * Fetch all destinations for a given trip, ordered by sequenceOrder.
 */
export async function getDestinations(tripId: string): Promise<Destination[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("tripId", "==", tripId),
      orderBy("sequenceOrder", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Destination)
    );
  } catch (error) {
    console.error(`[getDestinations] Failed to fetch destinations for trip "${tripId}":`, error);
    throw error;
  }
}

/**
 * Add a new destination to a trip.
 * Automatically stamps `createdAt` and `updatedAt` with server timestamps.
 * Returns the new document ID.
 */
export async function addDestination(
  tripId: string,
  data: Omit<Destination, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      tripId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`[addDestination] Failed to add destination for trip "${tripId}":`, error);
    throw error;
  }
}

/**
 * Partially update a destination document.
 * Always stamps `updatedAt` with the server timestamp.
 */
export async function updateDestination(
  destId: string,
  data: Partial<Destination>
): Promise<void> {
  try {
    const destRef = doc(db, COLLECTION, destId);
    await updateDoc(destRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[updateDestination] Failed to update destination "${destId}":`, error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for all destinations in a trip.
 * Returns an Unsubscribe function to stop listening.
 */
export function listenToDestinations(
  tripId: string,
  callback: (dests: Destination[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("tripId", "==", tripId),
    orderBy("sequenceOrder", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const dests = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Destination)
      );
      callback(dests);
    },
    (error) => {
      console.error(
        `[listenToDestinations] Listener error for trip "${tripId}":`,
        error
      );
    }
  );
}
