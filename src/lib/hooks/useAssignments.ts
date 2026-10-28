"use client";

import { useEffect, useState } from "react";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Assignment } from "@/lib/types";

export function useAssignments(tripId: string, adminId?: string) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tripId) { setLoading(false); return; }
    let q = query(collection(db, "assignments"), where("tripId", "==", tripId));
    if (adminId) {
      q = query(q, where("assignedAdminId", "==", adminId));
    }
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAssignments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Assignment)));
        setLoading(false);
      },
      (err) => { setError(err); setLoading(false); }
    );
    return unsub;
  }, [tripId, adminId]);

  return { assignments, loading, error };
}

