// src/components/shared/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  X,
  LayoutDashboard,
  MapPin,
  CalendarDays,
  Info,
  LogOut,
  ChevronDown,
  Crown,
  User,
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { cn, getInitials } from "@/lib/utils";
import NotificationPanel from "@/components/shared/NotificationPanel";

// ─── Nav links ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/itinerary", label: "Itinerary", icon: CalendarDays },
  { href: "/destinations/rajasthan", label: "Destinations", icon: MapPin },
  { href: "/travel-info", label: "Travel Info", icon: Info },
];

const ROLE_LABELS: Record<string, string> = {
  master_admin: "Master Admin",
  destination_admin: "Destination Admin",
  viewer: "Trip Member",
};

export default function Navbar() {
  const { user, appUser, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sticky nav on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Unread notifications count
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("isRead", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
    return unsub;
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initials = appUser?.displayName ? getInitials(appUser.displayName) : "U";
  const roleLabel = appUser?.role ? ROLE_LABELS[appUser.role] ?? appUser.role : "";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-30 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-card border-b border-ivory-200"
            : "bg-royal-950/90 backdrop-blur-sm"
        )}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-royal-gradient flex items-center justify-center shadow-premium">
                <Crown className="w-4 h-4 text-gold-300" />
              </div>
              <div className="hidden sm:block">
                <p className={cn("font-display font-bold text-sm leading-tight", scrolled ? "text-royal-950" : "text-white")}>
                  Royal Routes
                </p>
                <p className={cn("text-[10px] leading-none uppercase tracking-widest", scrolled ? "text-stone-400" : "text-white/50")}>
                  India Trip 2026
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href === "/destinations/rajasthan" ? "/destinations" : href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      active
                        ? scrolled
                          ? "bg-royal-50 text-royal-700"
                          : "bg-white/15 text-white"
                        : scrolled
                        ? "text-stone-600 hover:bg-stone-100 hover:text-stone-800"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Notification + Avatar */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <button
                onClick={() => setNotifOpen(true)}
                className={cn(
                  "relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                  scrolled ? "text-stone-600 hover:bg-stone-100" : "text-white/80 hover:bg-white/10"
                )}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-terracotta-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={cn(
                    "flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-xl transition-colors",
                    scrolled ? "hover:bg-stone-100" : "hover:bg-white/10"
                  )}
                >
                  {appUser?.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={appUser.photoURL}
                      alt={appUser.displayName}
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-gold-300/50"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-royal-gradient flex items-center justify-center ring-2 ring-gold-300/50">
                      <span className="font-display font-bold text-xs text-white">{initials}</span>
                    </div>
                  )}
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform",
                      scrolled ? "text-stone-500" : "text-white/60",
                      dropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-20 w-56 bg-white rounded-2xl border border-ivory-200 shadow-premium-lg overflow-hidden">
                      <div className="px-4 py-3 border-b border-ivory-100 bg-ivory-50">
                        <p className="font-semibold text-stone-800 text-sm truncate">
                          {appUser?.displayName ?? user?.email}
                        </p>
                        <p className="text-xs text-stone-500 truncate">{appUser?.email ?? user?.email}</p>
                        <span className="mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider text-royal-600 bg-royal-50 border border-royal-200 px-2 py-0.5 rounded-full">
                          {roleLabel}
                        </span>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className={cn(
                  "md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
                  scrolled ? "text-stone-600 hover:bg-stone-100" : "text-white hover:bg-white/10"
                )}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileOpen ? "max-h-screen" : "max-h-0"
          )}
        >
          <div className="bg-white border-t border-ivory-200 px-4 pt-3 pb-5 space-y-1">
            {/* User info strip */}
            <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-ivory-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-royal-gradient flex items-center justify-center flex-shrink-0">
                {appUser?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={appUser.photoURL} alt="" className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <span className="font-display font-bold text-sm text-white">{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-stone-800 text-sm truncate">{appUser?.displayName ?? "User"}</p>
                <p className="text-xs text-stone-400 truncate">{roleLabel}</p>
              </div>
            </div>

            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith("/destinations") && href.includes("/destinations");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-royal-50 text-royal-700"
                      : "text-stone-700 hover:bg-stone-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-2"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
