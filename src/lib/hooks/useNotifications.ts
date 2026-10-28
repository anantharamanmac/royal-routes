"use client";

import { useEffect, useState } from "react";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AppNotification } from "@/lib/types";

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.isRead).length);
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  return { notifications, unreadCount, loading };
}

