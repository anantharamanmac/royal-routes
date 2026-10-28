import { db } from "@/lib/firebase/config";
import { Assignment } from "@/lib/types";
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
  serverTimestamp,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";

const COLLECTION = "assignments";

/**
 * Fetch a single assignment by ID.
 */
export async function getAssignment(assignmentId: string): Promise<Assignment | null> {
  try {
    const ref = doc(db, COLLECTION, assignmentId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Assignment;
  } catch (error) {
    console.error(`[getAssignment] Failed to fetch assignment "${assignmentId}":`, error);
    throw error;
  }
}

/**
 * Fetch all assignments for a given trip, ordered by createdAt descending.
 */
export async function getAssignments(tripId: string): Promise<Assignment[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("tripId", "==", tripId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Assignment));
  } catch (error) {
    console.warn(`[getAssignments] Could not fetch assignments for trip "${tripId}":`, error);
    return [];
  }
}

/**
 * Fetch all assignments for a given destination.
 */
export async function getAssignmentsByDestination(
  destinationId: string
): Promise<Assignment[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("destinationId", "==", destinationId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Assignment));
  } catch (error) {
    console.warn(
      `[getAssignmentsByDestination] Could not fetch assignments for destination "${destinationId}":`,
      error
    );
    return [];
  }
}

/**
 * Create a new assignment.
 * Returns the new document ID.
 */
export async function addAssignment(
  data: Omit<Assignment, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("[addAssignment] Failed to create assignment:", error);
    throw error;
  }
}

/**
 * Partially update an assignment document.
 */
export async function updateAssignment(
  assignmentId: string,
  data: Partial<Assignment>
): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, assignmentId);
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[updateAssignment] Failed to update assignment "${assignmentId}":`, error);
    throw error;
  }
}

/**
 * Delete an assignment document.
 */
export async function deleteAssignment(assignmentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, assignmentId));
  } catch (error) {
    console.error(`[deleteAssignment] Failed to delete assignment "${assignmentId}":`, error);
    throw error;
  }
}

/**
 * Mark an assignment as submitted.
 * Sets status to "submitted" and stamps submittedAt with server timestamp.
 */
export async function submitAssignment(assignmentId: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, assignmentId);
    await updateDoc(ref, {
      status: "submitted",
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[submitAssignment] Failed to submit assignment "${assignmentId}":`, error);
    throw error;
  }
}

/**
 * Approve an assignment.
 * Sets status to "approved", records reviewer info and optional comment.
 */
export async function approveAssignment(
  assignmentId: string,
  reviewedBy: string,
  reviewComment?: string
): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, assignmentId);
    await updateDoc(ref, {
      status: "approved",
      reviewedBy,
      reviewedAt: serverTimestamp(),
      ...(reviewComment !== undefined ? { reviewComment } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[approveAssignment] Failed to approve assignment "${assignmentId}":`, error);
    throw error;
  }
}

/**
 * Request changes on an assignment.
 * Sets status to "changes_requested", records reviewer info and mandatory comment.
 */
export async function requestChanges(
  assignmentId: string,
  reviewedBy: string,
  reviewComment: string
): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, assignmentId);
    await updateDoc(ref, {
      status: "changes_requested",
      reviewedBy,
      reviewedAt: serverTimestamp(),
      reviewComment,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`[requestChanges] Failed to request changes on assignment "${assignmentId}":`, error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for all assignments in a trip.
 * Returns an Unsubscribe function to stop listening.
 */
export function listenToAssignments(
  tripId: string,
  callback: (assignments: Assignment[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("tripId", "==", tripId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const assignments = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Assignment)
      );
      callback(assignments);
    },
    (error) => {
      console.warn(
        `[listenToAssignments] Listener error for trip "${tripId}":`,
        error
      );
    }
  );
}

/**
 * Subscribe to real-time updates for assignments belonging to a specific admin.
 */
export function listenToAdminAssignments(
  assignedAdminId: string,
  callback: (assignments: Assignment[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("assignedAdminId", "==", assignedAdminId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const assignments = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as Assignment)
      );
      callback(assignments);
    },
    (error) => {
      console.error(
        `[listenToAdminAssignments] Listener error for admin "${assignedAdminId}":`,
        error
      );
    }
  );
}
