import { db } from "@/lib/firebase/config";
import { TransportBooking } from "@/lib/types";
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

const COLLECTION = "transportBookings";

/**
 * Fetch a single transport booking by ID.
 */
export async function getTransportBooking(
  bookingId: string
): Promise<TransportBooking | null> {
  try {
    const ref = doc(db, COLLECTION, bookingId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as TransportBooking;
  } catch (error) {
    console.error(`[getTransportBooking] Failed to fetch booking "${bookingId}":`, error);
    throw error;
  }
}

/**
 * Fetch all transport bookings for a given trip, ordered by scheduledDeparture ascending.
 * Optionally filter by destinationId.
 */
export async function getTransportBookings(
  tripId: string,
  destinationId?: string
): Promise<TransportBooking[]> {
  try {
    const constraints = [
      where("tripId", "==", tripId),
      ...(destinationId ? [where("destinationId", "==", destinationId)] : []),
      orderBy("scheduledDeparture", "asc"),
    ];
    const q = query(collection(db, COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TransportBooking));
  } catch (error) {
    console.error(
      `[getTransportBookings] Failed to fetch bookings for trip "${tripId}":`,
      error
    );
    throw error;
  }
}

/**
 * Add a new transport booking.
 * Returns the new document ID.
 */
export async function addTransportBooking(
  data: Omit<TransportBooking, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("[addTransportBooking] Failed to add transport booking:", error);
    throw error;
  }
}

/**
 * Partially update a transport booking document.
 * Always stamps `updatedAt` with the server timestamp.
 */
export async function updateTransportBooking(
  bookingId: string,
  data: Partial<TransportBooking>
): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, bookingId);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(
      `[updateTransportBooking] Failed to update booking "${bookingId}":`,
      error
    );
    throw error;
  }
}

/**
 * Delete a transport booking document.
 */
export async function deleteTransportBooking(bookingId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, bookingId));
  } catch (error) {
    console.error(
      `[deleteTransportBooking] Failed to delete booking "${bookingId}":`,
      error
    );
    throw error;
  }
}

/**
 * Subscribe to real-time updates for transport bookings in a trip.
 * Returns an Unsubscribe function to stop listening.
 */
export function listenToTransportBookings(
  tripId: string,
  callback: (bookings: TransportBooking[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("tripId", "==", tripId),
    orderBy("scheduledDeparture", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as TransportBooking)
      );
      callback(bookings);
    },
    (error) => {
      console.error(
        `[listenToTransportBookings] Listener error for trip "${tripId}":`,
        error
      );
    }
  );
}
