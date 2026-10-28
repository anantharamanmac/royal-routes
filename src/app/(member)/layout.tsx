"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/lib/hooks/useNotifications";
import TopNavbar from "@/components/shared/TopNavbar";
import NotificationPanel from "@/components/shared/NotificationPanel";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const { user, appUser, loading } = useAuth();
  const { notifications, unreadCount } = useNotifications(appUser?.uid);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      <TopNavbar unreadCount={unreadCount} onBellClick={() => setNotifOpen(true)} />
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t border-ivory-200 py-8 mt-12">
        <div className="section-container text-center">
          <p className="font-display font-bold text-royal-900 text-lg mb-1">Royal Routes</p>
          <p className="text-stone-400 text-sm">Rajasthan · Delhi · Agra — Winter 2026–27</p>
        </div>
      </footer>
      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </div>
  );
}

