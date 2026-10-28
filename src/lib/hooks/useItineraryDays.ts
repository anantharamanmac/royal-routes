"use client";

import { useEffect, useState } from "react";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ItineraryDay } from "@/lib/types";

export function useItineraryDays(tripId: string, destinationId?: string, publishedOnly = false) {
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(Boolean(tripId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tripId) return;
    let q = query(
      collection(db, "itineraryDays"),
      where("tripId", "==", tripId)
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
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ItineraryDay));
        items.sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0));
        setDays(items);
        setLoading(false);
      },
      (err) => {
        console.warn("[useItineraryDays] Realtime listener notice:", err);
        setDays([]);
        setLoading(false);
      }
    );
    return unsub;
  }, [tripId, destinationId, publishedOnly]);

  return { days, loading, error };
}

