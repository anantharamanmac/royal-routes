"use client";

import { useEffect, useState } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Trip } from "@/lib/types";

export function useTrip(tripId: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(Boolean(tripId));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tripId) return;
    const ref = doc(db, "trips", tripId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) setTrip({ id: snap.id, ...snap.data() } as Trip);
        else setTrip(null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return unsub;
  }, [tripId]);

  return { trip, loading, error };
}

