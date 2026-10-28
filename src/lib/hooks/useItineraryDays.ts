"use client";

import { useEffect, useState } from "react";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ItineraryDay } from "@/lib/types";

export function useItineraryDays(tripId: string, destinationId?: string, publishedOnly = false) {
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tripId) { setLoading(false); return; }
    let q = query(
      collection(db, "itineraryDays"),
      where("tripId", "==", tripId),
      orderBy("dayNumber", "asc")
    );
    if (destinationId) {
      q = query(q, where("destinationId", "==", destinationId));
    }
    if (publishedOnly) {
      q = query(q, where("status", "==", "published"));
    }
    const unsub = onSnapshot(
      q,
      (snap) => {
        setDays(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ItineraryDay)));
        setLoading(false);
      },
      (err) => { setError(err); setLoading(false); }
    );
    return unsub;
  }, [tripId, destinationId, publishedOnly]);

  return { days, loading, error };
}

