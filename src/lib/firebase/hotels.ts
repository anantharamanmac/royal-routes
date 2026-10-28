import { db } from "@/lib/firebase/config";
import { Hotel } from "@/lib/types";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

const COLLECTION = "hotels";

/**
 * Fetch a single hotel document by ID.
 */
export async function getHotel(hotelId: string): Promise<Hotel | null> {
  try {
    const ref = doc(db, COLLECTION, hotelId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Hotel;
  } catch (error) {
    console.error(`[getHotel] Failed to fetch hotel "${hotelId}":`, error);
    throw error;
  }
}

/**
 * Fetch all hotels for a given trip, ordered by checkIn ascending.
 * Optionally filter by destinationId.
 */
export async function getHotels(
  tripId: string,
  destinationId?: string
): Promise<Hotel[]> {
  try {
    const constraints = [
      where("tripId", "==", tripId),
      ...(destinationId ? [where("destinationId", "==", destinationId)] : []),
      orderBy("checkIn", "asc"),
    ];
    const q = query(collection(db, COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Hotel));
  } catch (error) {
    console.error(`[getHotels] Failed to fetch hotels for trip "${tripId}":`, error);
    throw error;
  }
}

/**
 * Add a new hotel document.
 * Returns the new document ID.
 */
export async function addHotel(
  data: Omit<Hotel, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("[addHotel] Failed to add hotel:", error);
    throw error;
  }
}

/**
 * Partially update a hotel document.
 * Always stamps `updatedAt` with the server timestamp.
 */
export async function updateHotel(
  hotelId: string,
  data: Partial<Hotel>
): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, hotelId);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[updateHotel] Failed to update hotel "${hotelId}":`, error);
    throw error;
  }
}

/**
 * Delete a hotel document.
 */
export async function deleteHotel(hotelId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, hotelId));
  } catch (error) {
    console.error(`[deleteHotel] Failed to delete hotel "${hotelId}":`, error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for hotels in a trip.
 * Returns an Unsubscribe function to stop listening.
 */
export function listenToHotels(
  tripId: string,
  callback: (hotels: Hotel[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("tripId", "==", tripId),
    orderBy("checkIn", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const hotels = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Hotel)
      );
      callback(hotels);
    },
    (error) => {
      console.error(
        `[listenToHotels] Listener error for trip "${tripId}":`,
        error
      );
    }
  );
}
