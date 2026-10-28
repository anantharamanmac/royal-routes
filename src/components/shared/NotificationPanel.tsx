// src/components/shared/NotificationPanel.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  X,
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  CheckCheck,
  Megaphone,
  Train,
  CalendarCheck,
} from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { fromNow, cn } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/lib/types";

// ─── Icon by type ─────────────────────────────────────────────────────────────
const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  assignment_created: CalendarCheck,
  itinerary_submitted: CheckCircle,
  itinerary_approved: CheckCircle,
  itinerary_rejected: AlertTriangle,
  changes_requested: AlertTriangle,
  deadline_approaching: AlertTriangle,
  announcement: Megaphone,
  trip_published: Train,
  general: Info,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  assignment_created: "text-royal-600 bg-royal-50",
  itinerary_submitted: "text-blue-600 bg-blue-50",
  itinerary_approved: "text-emerald-600 bg-emerald-50",
  itinerary_rejected: "text-red-600 bg-red-50",
  changes_requested: "text-orange-600 bg-orange-50",
  deadline_approaching: "text-amber-600 bg-amber-50",
  announcement: "text-gold-700 bg-gold-50",
  trip_published: "text-royal-700 bg-royal-50",
  general: "text-stone-500 bg-stone-100",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function NotifSkeleton() {
  return (
    <div className="animate-pulse flex gap-3 p-4 border-b border-ivory-100">
      <div className="w-9 h-9 rounded-full bg-stone-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-stone-100 rounded w-3/4" />
        <div className="h-3 bg-stone-100 rounded w-full" />
        <div className="h-2.5 bg-stone-100 rounded w-1/3" />
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification)));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const markRead = useCallback(
    async (notif: AppNotification) => {
      if (notif.isRead) return;
      await updateDoc(doc(db, "notifications", notif.id), { isRead: true });
    },
    []
  );

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach((n) => batch.update(doc(db, "notifications", n.id), { isRead: true }));
    await batch.commit();
  }, [notifications, user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full sm:w-[380px] bg-white shadow-premium-lg flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ivory-200 bg-royal-gradient">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gold-300" />
            <span className="font-display font-bold text-white text-base">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-gold-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-white/70 hover:text-white flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => <NotifSkeleton key={i} />)}
            </>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-royal-50 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-royal-400" />
              </div>
              <p className="font-display font-semibold text-stone-700 text-lg">You&apos;re all caught up!</p>
              <p className="text-sm text-stone-400">No notifications yet. We&apos;ll let you know when something important happens.</p>
            </div>
          ) : (
            <ul>
              {notifications.map((notif) => {
                const Icon = TYPE_ICON[notif.type] ?? Bell;
                const iconCls = TYPE_COLOR[notif.type] ?? "text-stone-500 bg-stone-100";
                return (
                  <li key={notif.id}>
                    <button
                      className={cn(
                        "w-full text-left flex gap-3 px-5 py-4 border-b border-ivory-100 hover:bg-ivory-50 transition-colors",
                        !notif.isRead && "bg-royal-50/40"
                      )}
                      onClick={() => markRead(notif)}
                    >
                      {/* Dot */}
                      <div className="relative flex-shrink-0 mt-0.5">
                        <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", iconCls)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {!notif.isRead && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-royal-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold leading-tight", notif.isRead ? "text-stone-600" : "text-stone-900")}>
                          {notif.title}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500 leading-snug line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="mt-1 text-[10px] text-stone-400 uppercase tracking-wider">
                          {fromNow(notif.createdAt)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
