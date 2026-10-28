"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn, getInitials } from "@/lib/utils";
import { toast } from "sonner";

interface NavLink {
  href: string;
  label: string;
}

const memberLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/itinerary", label: "Itinerary" },
  { href: "/destinations/rajasthan", label: "Rajasthan" },
  { href: "/destinations/delhi", label: "Delhi" },
  { href: "/destinations/agra", label: "Agra" },
  { href: "/travel-info", label: "Travel Info" },
];

interface TopNavbarProps {
  unreadCount?: number;
  onBellClick?: () => void;
}

export default function TopNavbar({ unreadCount = 0, onBellClick }: TopNavbarProps) {
  const { user, appUser, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = appUser ? getInitials(appUser.displayName) : "?";
  const roleLabel = {
    master_admin: "Master Admin",
    destination_admin: "Destination Admin",
    viewer: "Trip Member",
  }[appUser?.role ?? "viewer"];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-ivory-200 shadow-sm">
      <div className="section-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">🏛️</span>
          <span className="font-display font-bold text-royal-900 hidden sm:block">Royal Routes</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {memberLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors font-medium",
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "bg-royal-50 text-royal-700"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Admin link */}
          {(appUser?.role === "master_admin" || appUser?.role === "destination_admin") && (
            <Link
              href="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-royal-gradient text-white text-xs font-semibold rounded-xl"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}

          {/* Notification bell */}
          <button
            onClick={onBellClick}
            className="relative p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* User avatar + dropdown OR Sign In button */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#007d8a] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {initials}
                </div>
                <ChevronDown className="w-4 h-4 text-stone-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {appUser?.displayName ?? user.displayName ?? "User"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
                    <span className="inline-block px-2 py-0.5 bg-teal-50 text-[#007d8a] border border-teal-200 rounded-md mt-1.5 text-[10px] font-bold uppercase">
                      {roleLabel}
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    {(appUser?.role === "master_admin" || appUser?.role === "destination_admin") && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-teal-50 hover:text-[#007d8a] rounded-xl transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-teal-600" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        setUserMenuOpen(false);
                        toast.success("Signed out successfully");
                        await logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#007d8a] hover:bg-[#006670] text-white text-xs font-bold transition-all shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-ivory-200 bg-white px-4 py-3 space-y-1">
          {memberLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 text-sm rounded-xl transition-colors font-medium",
                pathname === link.href
                  ? "bg-royal-50 text-royal-700"
                  : "text-stone-600 hover:bg-stone-50"
              )}
            >
              {link.label}
            </Link>
          ))}
          {(appUser?.role === "master_admin" || appUser?.role === "destination_admin") && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm rounded-xl bg-royal-gradient text-white font-semibold"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

