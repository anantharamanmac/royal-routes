import { db } from "@/lib/firebase/config";
import { ApprovalRequest } from "@/lib/types";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION = "approvalRequests";

export async function createApprovalRequest(
  data: Omit<ApprovalRequest, "id" | "submittedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    submittedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getApprovalRequests(tripId: string): Promise<ApprovalRequest[]> {
  const q = query(
    collection(db, COLLECTION),
    where("tripId", "==", tripId),
    orderBy("submittedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ApprovalRequest));
}

export async function updateApprovalRequest(
  id: string,
  data: Partial<ApprovalRequest>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    reviewedAt: serverTimestamp(),
  });
}

