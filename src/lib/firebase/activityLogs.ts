import { db } from "@/lib/firebase/config";
import { ActivityLog } from "@/lib/types";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

const COLLECTION = "activityLogs";

/**
 * Log a new activity event.
 * Automatically stamps `createdAt` with the server timestamp.
 * Returns the new document ID.
 */
export async function logActivity(
  data: Omit<ActivityLog, "id" | "createdAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("[logActivity] Failed to log activity:", error);
    throw error;
  }
}

/**
 * Fetch activity logs for a trip, ordered by createdAt descending.
 * Optionally limit the number of results returned.
 */
export async function getActivityLogs(
  tripId: string,
  maxResults?: number
): Promise<ActivityLog[]> {
  try {
    const constraints = [
      where("tripId", "==", tripId),
      orderBy("createdAt", "desc"),
      ...(maxResults !== undefined ? [firestoreLimit(maxResults)] : []),
    ];
    const q = query(collection(db, COLLECTION), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog));
  } catch (error) {
    console.error(
      `[getActivityLogs] Failed to fetch activity logs for trip "${tripId}":`,
      error
    );
    throw error;
  }
}

/**
 * Subscribe to real-time activity log updates for a trip.
 * Optionally limit the number of results returned.
 * Returns an Unsubscribe function to stop listening.
 */
export function listenToActivityLogs(
  tripId: string,
  callback: (logs: ActivityLog[]) => void,
  maxResults?: number
): Unsubscribe {
  const constraints = [
    where("tripId", "==", tripId),
    orderBy("createdAt", "desc"),
    ...(maxResults !== undefined ? [firestoreLimit(maxResults)] : []),
  ];
  const q = query(collection(db, COLLECTION), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const logs = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as ActivityLog)
      );
      callback(logs);
    },
    (error) => {
      console.error(
        `[listenToActivityLogs] Listener error for trip "${tripId}":`,
        error
      );
    }
  );
}
