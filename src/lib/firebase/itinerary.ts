import { db } from "@/lib/firebase/config";
import { ItineraryDay, ItineraryItem } from "@/lib/types";
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
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

const DAYS_COLLECTION = "itineraryDays";
const ITEMS_COLLECTION = "itineraryItems";

// ─── Itinerary Days ───────────────────────────────────────────────────────────

/**
 * Fetch a single itinerary day by ID.
 */
export async function getItineraryDay(dayId: string): Promise<ItineraryDay | null> {
  try {
    const ref = doc(db, DAYS_COLLECTION, dayId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as ItineraryDay;
  } catch (error) {
    console.error(`[getItineraryDay] Failed to fetch day "${dayId}":`, error);
    throw error;
  }
}

/**
 * Fetch all itinerary days for a trip, ordered by dayNumber.
 * Optionally filter by destinationId.
 */
export async function getItineraryDays(
  tripId: string,
  destinationId?: string
): Promise<ItineraryDay[]> {
  try {
    const constraints = [
      where("tripId", "==", tripId),
      ...(destinationId ? [where("destinationId", "==", destinationId)] : []),
    ];
    const q = query(collection(db, DAYS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    const days = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ItineraryDay));
    return days.sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0));
  } catch (error) {
    console.warn(`[getItineraryDays] Could not fetch days for trip "${tripId}":`, error);
    return [];
  }
}

/**
 * Add a new itinerary day.
 * Returns the new document ID.
 */
export async function addItineraryDay(
  data: Omit<ItineraryDay, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, DAYS_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("[addItineraryDay] Failed to add itinerary day:", error);
    throw error;
  }
}

/**
 * Partially update an itinerary day document.
 */
export async function updateItineraryDay(
  dayId: string,
  data: Partial<ItineraryDay>
): Promise<void> {
  try {
    const ref = doc(db, DAYS_COLLECTION, dayId);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[updateItineraryDay] Failed to update day "${dayId}":`, error);
    throw error;
  }
}

/**
 * Delete an itinerary day document.
 */
export async function deleteItineraryDay(dayId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, DAYS_COLLECTION, dayId));
  } catch (error) {
    console.error(`[deleteItineraryDay] Failed to delete day "${dayId}":`, error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for itinerary days in a trip.
 * Returns an Unsubscribe function.
 */
export function listenToItineraryDays(
  tripId: string,
  callback: (days: ItineraryDay[]) => void
): Unsubscribe {
  const q = query(
    collection(db, DAYS_COLLECTION),
    where("tripId", "==", tripId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const days = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as ItineraryDay)
      );
      days.sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0));
      callback(days);
    },
    (error) => {
      console.warn(
        `[listenToItineraryDays] Listener error for trip "${tripId}":`,
        error
      );
    }
  );
}

// ─── Itinerary Items ──────────────────────────────────────────────────────────

/**
 * Fetch a single itinerary item by ID.
 */
export async function getItineraryItem(itemId: string): Promise<ItineraryItem | null> {
  try {
    const ref = doc(db, ITEMS_COLLECTION, itemId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as ItineraryItem;
  } catch (error) {
    console.warn(`[getItineraryItem] Could not fetch item "${itemId}":`, error);
    return null;
  }
}

/**
 * Fetch all itinerary items for a given day, ordered by sortOrder.
 */
export async function getItineraryItems(dayId: string): Promise<ItineraryItem[]> {
  try {
    const q = query(
      collection(db, ITEMS_COLLECTION),
      where("dayId", "==", dayId)
    );
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ItineraryItem));
    return items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch (error) {
    console.warn(`[getItineraryItems] Could not fetch items for day "${dayId}":`, error);
    return [];
  }
}

/**
 * Add a new itinerary item.
 * Returns the new document ID.
 */
export async function addItineraryItem(
  data: Omit<ItineraryItem, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, ITEMS_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("[addItineraryItem] Failed to add itinerary item:", error);
    throw error;
  }
}

/**
 * Partially update an itinerary item document.
 */
export async function updateItineraryItem(
  itemId: string,
  data: Partial<ItineraryItem>
): Promise<void> {
  try {
    const ref = doc(db, ITEMS_COLLECTION, itemId);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[updateItineraryItem] Failed to update item "${itemId}":`, error);
    throw error;
  }
}

/**
 * Delete an itinerary item document.
 */
export async function deleteItineraryItem(itemId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ITEMS_COLLECTION, itemId));
  } catch (error) {
    console.error(`[deleteItineraryItem] Failed to delete item "${itemId}":`, error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for itinerary items within a specific day.
 * Returns an Unsubscribe function.
 */
export function listenToItineraryItems(
  dayId: string,
  callback: (items: ItineraryItem[]) => void
): Unsubscribe {
  const q = query(
    collection(db, ITEMS_COLLECTION),
    where("dayId", "==", dayId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as ItineraryItem)
      );
      items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      callback(items);
    },
    (error) => {
      console.warn(
        `[listenToItineraryItems] Listener error for day "${dayId}":`,
        error
      );
    }
  );
}

/**
 * Batch-update the sortOrder of multiple itinerary items atomically.
 * Accepts an array of { id, sortOrder } pairs.
 */
export async function reorderItineraryItems(
  items: Array<{ id: string; sortOrder: number }>
): Promise<void> {
  if (items.length === 0) return;

  try {
    const batch = writeBatch(db);

    for (const { id, sortOrder } of items) {
      const ref = doc(db, ITEMS_COLLECTION, id);
      batch.update(ref, { sortOrder, updatedAt: serverTimestamp() });
    }

    await batch.commit();
  } catch (error) {
    console.error("[reorderItineraryItems] Failed to reorder items:", error);
    throw error;
  }
}
