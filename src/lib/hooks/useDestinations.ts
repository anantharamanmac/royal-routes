"use client";

import { useEffect, useState } from "react";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Destination } from "@/lib/types";

export function useDestinations(tripId: string) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(Boolean(tripId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tripId) return;
    const q = query(
      collection(db, "destinations"),
      where("tripId", "==", tripId),
      orderBy("sequenceOrder", "asc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setDestinations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Destination)));
        setLoading(false);
      },
      (err) => { setError(err); setLoading(false); }
    );
    return unsub;
  }, [tripId]);

  return { destinations, loading, error };
}

