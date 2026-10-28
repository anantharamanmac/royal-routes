"use client";

import { useEffect, useState } from "react";
import { onSnapshot, collection, query, where } from "firebase/firestore";
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
      where("tripId", "==", tripId)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Destination));
        items.sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0));
        setDestinations(items);
        setLoading(false);
      },
      (err) => { setError(err); setLoading(false); }
    );
    return unsub;
  }, [tripId]);

  return { destinations, loading, error };
}

