import { db } from "@/lib/firebase/config";
import { AppNotification } from "@/lib/types";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

const COLLECTION = "notifications";

/**
 * Fetch all notifications for a user, ordered by createdAt descending.
 */
export async function getUserNotifications(
  userId: string
): Promise<AppNotification[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as AppNotification)
    );
  } catch (error) {
    console.error(
      `[getUserNotifications] Failed to fetch notifications for user "${userId}":`,
      error
    );
    throw error;
  }
}

/**
 * Subscribe to real-time notification updates for a user.
 * Returns an Unsubscribe function to stop listening.
 */
export function listenToUserNotifications(
  userId: string,
  callback: (notifications: AppNotification[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as AppNotification)
      );
      callback(notifications);
    },
    (error) => {
      console.error(
        `[listenToUserNotifications] Listener error for user "${userId}":`,
        error
      );
    }
  );
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, notificationId);
    await updateDoc(ref, { isRead: true });
  } catch (error) {
    console.error(
      `[markNotificationRead] Failed to mark notification "${notificationId}" as read:`,
      error
    );
    throw error;
  }
}

/**
 * Batch-mark all unread notifications for a user as read.
 */
export async function markAllRead(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    for (const d of snapshot.docs) {
      batch.update(d.ref, { isRead: true });
    }
    await batch.commit();
  } catch (error) {
    console.error(
      `[markAllRead] Failed to mark all notifications as read for user "${userId}":`,
      error
    );
    throw error;
  }
}

/**
 * Create a new notification for a user.
 * Automatically stamps `createdAt` with the server timestamp.
 * Returns the new document ID.
 */
export async function createNotification(
  data: Omit<AppNotification, "id" | "createdAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("[createNotification] Failed to create notification:", error);
    throw error;
  }
}

/**
 * Subscribe to the real-time count of unread notifications for a user.
 * Invokes `callback` with the current unread count immediately and on every change.
 * Returns an Unsubscribe function to stop listening.
 */
export function getUnreadCount(
  userId: string,
  callback: (count: number) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    where("isRead", "==", false)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      console.error(
        `[getUnreadCount] Listener error for user "${userId}":`,
        error
      );
    }
  );
}
